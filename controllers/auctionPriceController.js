import db from "../models/index.js";

export const getAllAuctions = async (req, res) => {
	try {
		// Récupération des enchères avec leurs relations
		const auctions = await db.AuctionPrice.findAll({
			include: [
				{
					model: db.User,
					as: "user",
					attributes: ["id", "username"], // Sélectionner uniquement les champs nécessaires
				},
				{
					model: db.Synthetiser,
					as: "synthetiser",
					attributes: ["id", "marque", "modele", "image_url"], // Sélectionner uniquement les champs nécessaires
				},
			],
			order: [["createdAt", "DESC"]], // Tri par date de création décroissante
			attributes: {
				exclude: ["userId"], // Exclure les champs sensibles
			},
		});

		// Retourner les résultats
		res.json({
			success: true,
			data: auctions,
		});
	} catch (error) {
		console.error("Erreur lors de la récupération des enchères:", error);
		res.status(500).json({
			success: false,
			error: "Erreur lors de la récupération des enchères",
			details: error.message,
		});
	}
};

export const getLatestAuctionBySynthId = async (req, res) => {
	try {
		const synthetiserId = parseInt(req.params.id);
		
		if (isNaN(synthetiserId)) {
			return res.status(400).json({
				success: false,
				message: "ID synthétiseur invalide",
			});
		}

		console.log('🔍 Debug Info:');
		console.log('- ID reçu:', req.params.id);
		console.log('- ID converti:', synthetiserId);
		console.log('- Type de synthetiserId:', typeof synthetiserId);

		// Vérifier si le synthétiseur existe
		const synthExists = await db.Synthetiser.findByPk(synthetiserId);
		console.log('- Synthétiseur existe:', synthExists ? 'OUI' : 'NON');

		// Compter les enchères
		const auctionCount = await db.AuctionPrice.count({
			where: { synthetiserId: synthetiserId }
		});
		console.log('- Nombre total d\'enchères:', auctionCount);

		// Requête simple
		const latestAuction = await db.AuctionPrice.findOne({
			where: { synthetiserId: synthetiserId }, // Simple égalité
			include: [
				{
					model: db.Synthetiser,
					as: "synthetiser",
					attributes: ["id", "marque", "modele", "image_url"],
				},
			],
			order: [["createdAt", "DESC"]],
		});

		console.log('- Enchère trouvée:', latestAuction ? 'OUI' : 'NON');

		if (!latestAuction) {
			return res.status(404).json({
				success: false,
				message: "Aucune enchère trouvée pour ce synthétiseur",
			});
		}

		return res.status(200).json({
			success: true,
			data: latestAuction,
		});

	} catch (error) {
		console.error("❌ Erreur:", error);
		return res.status(500).json({
			success: false,
			message: "Erreur lors de la récupération de l'enchère",
			error: error.message,
		});
	}
};

// controllers/auctionController.js
export const createAuction = async (req, res) => {
	try {
		const { proposal_price, userId, status } = req.body;
		// Conversion et validation de synthetiserId
		const synthetiserId = parseInt(req.params.id) || parseInt(req.body.synthetiserId);

		// Validation des données
		if (!proposal_price || !userId || !synthetiserId || isNaN(synthetiserId)) {
			return res.status(400).json({
				message: "Prix, userId et synthetiserId valides sont requis",
			});
		}

		// Création de l'enchère avec le modèle AuctionPrice
		const newAuction = await db.AuctionPrice.create({
			proposal_price: Number(proposal_price),
			userId: Number(userId),
			synthetiserId: synthetiserId, // Déjà converti en nombre
			status: status || "active",
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		// Vérification que l'enchère a bien été créée
		if (!newAuction) {
			throw new Error("Erreur lors de la création de l'enchère");
		}

		// Retourner la nouvelle enchère créée
		res.status(201).json({
			success: true,
			data: newAuction,
		});
	} catch (error) {
		console.error("Erreur lors de la création de l'enchère:", error);
		res.status(500).json({
			success: false,
			error: "Erreur lors de la création de l'enchère",
			details: error.message,
		});
	}
};

// Dans controllers/auctionController.js
export const deleteAuction = async (req, res) => {
	try {
		// Conversion et validation de l'ID
		const auctionId = parseInt(req.params.auctionId);
		
		if (isNaN(auctionId)) {
			return res.status(400).json({
				message: "ID d'enchère invalide",
			});
		}

		console.log("Tentative de suppression de l'enchère:", auctionId);

		// Vérification que l'enchère existe avant suppression
		const auction = await db.AuctionPrice.findByPk(auctionId);

		if (!auction) {
			return res.status(404).json({
				message: "Enchère non trouvée",
			});
		}

		// Suppression
		await auction.destroy({ force: true });

		console.log("Enchère supprimée avec succès:", auctionId);
		res.status(204).send();
	} catch (error) {
		console.error("Erreur dans deleteAuction:", error);
		res.status(500).json({ message: "Erreur serveur", error: error.message });
	}
};