import { importJsonData } from "../utils/importService.js";
import db from "../models/index.js";

export const updatePrice = async (req, res) => {
	const { id } = req.params;
	const { auctionPrice } = req.body;

	try {
		const existingSynth = await db.Synthetiser.findByPk(id);

		if (!existingSynth) {
			return res.status(404).json({
				error: "Synthétiseur non trouvé",
			});
		}

		// Mise à jour avec l'utilisateur dans les options
		await existingSynth.update(
			{ auctionPrice },
			{
				user: req.user, // L'utilisateur authentifié doit être disponible dans req.user
			}
		);

		res.json({
			data: existingSynth,
			message: "Prix mis à jour avec succès",
		});
	} catch (error) {
		if (error.message === "Seul le propriétaire peut modifier le prix") {
			return res.status(403).json({
				error: "Non autorisé",
				message: error.message,
			});
		}

		res.status(500).json({
			error: "Erreur lors de la mise à jour du prix",
			message: error.message,
		});
	}
};

// Fonction pour importer des données JSON dans la base de données
export const importData = async (req, res) => {
	try {
		const result = await importJsonData();
		res.status(201).json(result);
	} catch (error) {
		console.error("Import error:", error);
		res.status(500).json({ error: error.message });
	}
};

// Fonction pour obtenir tous les synthétiseurs
export const getAllSynthetisers = async (req, res) => {
	try {
		console.log("Début de la récupération des synthétiseurs");

		// Vérifier que le modèle Post existe
		if (!db.Post) {
			console.error("Modèle Post non trouvé dans db:", Object.keys(db));
			throw new Error("Modèle Post non configuré");
		}

		// Récupération des synthétiseurs avec leurs posts
		const synths = await db.Synthetiser.findAll({
			include: [
				{
					model: db.Post,
					as: "posts",
					required: false, // Pour faire un LEFT JOIN
				},
			],
			raw: false,
			nest: true,
			include: [{
                model: db.AuctionPrice,
                as: 'auctionPrices',  // Comme défini dans les associations
                attributes: ['id', 'proposal_price', 'status'], // Les champs que vous voulez
                order: [['createdAt', 'DESC']], // Pour avoir les plus récentes d'abord
            }],
            order: [['createdAt', 'DESC']], // Ordre des synthétiseurs
		});

		console.log("Synthétiseurs récupérés, nombre:", synths.length);

		// Formatage des données avec gestion d'erreur
		const formattedSynths = synths.map((synth) => {
			try {
				const plainSynth = synth.get({ plain: true });
				return {
					...plainSynth,
					posts: Array.isArray(plainSynth.posts) ? plainSynth.posts : [],
					postCount: Array.isArray(plainSynth.posts)
						? plainSynth.posts.length
						: 0,
				};
			} catch (error) {
				console.error("Erreur lors du formatage du synthétiseur:", error);
				return {
					...synth,
					posts: [],
					postCount: 0,
				};
			}
		});

		console.log("Données formatées avec succès");

		res.json({
			data: formattedSynths,
			roles: ["user"],
			message: "Synthétiseurs récupérés avec succès",
		});
	} catch (error) {
		console.error("Erreur détaillée:", {
			message: error.message,
			stack: error.stack,
			name: error.name,
		});

		res.status(500).json({
			error: "Erreur lors de la récupération des synthétiseurs",
			details: error.message,
			stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
		});
	}
};

// Fonction pour créer un nouveau synthétiseur
export const createSynthetiser = async (req, res) => {
	try {
		const newSynth = await db.Synthetiser.create(req.body);
		res.status(201).json(newSynth);
	} catch (error) {
		console.error("Create error:", error);
		res.status(400).json({
			error: "Failed to create synthetiser",
			details: error.message,
		});
	}
};

// Fonction pour mettre à jour les informations principales d'un synthétiseur
export const updateMainSynthetiserInfo = async (req, res) => {
	const { id } = req.params;

	try {
		const existingSynth = await db.Synthetiser.findByPk(id);

		if (!existingSynth) {
			return res.status(404).json({
				error: "Synthétiseur non trouvé",
				details: `Aucun synthétiseur trouvé avec l'ID ${id}`,
			});
		}

		// Extraction uniquement des champs autorisés
		const { marque, modele, specifications, image_url } = req.body;

		// Création de l'objet de mise à jour
		const updateData = {};
		if (marque !== undefined) updateData.marque = marque;
		if (modele !== undefined) updateData.modele = modele;
		if (specifications !== undefined)
			updateData.specifications = specifications;
		if (image_url !== undefined) updateData.image_url = image_url;

		// Mise à jour du synthétiseur
		await existingSynth.update(updateData);

		// Récupération du synthétiseur mis à jour
		const updatedSynth = await db.Synthetiser.findByPk(id);

		res.json({
			data: updatedSynth,
			message:
				"Informations principales du synthétiseur mises à jour avec succès",
		});
	} catch (error) {
		console.error("Update error:", error);
		res.status(400).json({
			error: "Échec de la mise à jour du synthétiseur",
			details: error.message,
		});
	}
};

// Fonction pour obtenir un synthétiseur spécifique
export const getSynthetiser = async (req, res) => {
	const { id } = req.params;
  
	try {
	  const synthetiser = await db.Synthetiser.findByPk(id, {
		include: [
		  {
			model: db.Post,
			as: "posts",
			attributes: ['id', 'titre', 'commentaire', 'contenu', 'type_contenu'],
		  },
		  {
			model: db.AuctionPrice,
			as: 'auctionPrices',
			attributes: ['id', 'proposal_price', 'status', 'createdAt'],
			order: [['createdAt', 'DESC']]
		  }
		]
	  });
  
	  if (!synthetiser) {
		return res.status(404).json({
		  error: "Synthétiseur non trouvé",
		  details: `Aucun synthétiseur trouvé avec l'ID ${id}`
		});
	  }
  
	  return res.status(200).json({
		data: synthetiser,
		message: "Synthétiseur récupéré avec succès"
	  });
  
	} catch (error) {
	  console.error("Get synthetiser error:", error);
	  return res.status(500).json({
		error: "Échec de la récupération du synthétiseur",
		details: error.message
	  });
	}
  };
  

// Fonction pour ajouter un post à un synthétiseur
export const addPost = async (req, res) => {
	const { id } = req.params;
	const { content } = req.body;

	try {
		// Vérifier si le synthétiseur existe
		const synthetiser = await db.Synthetiser.findByPk(id);

		if (!synthetiser) {
			return res.status(404).json({
				error: "Synthétiseur non trouvé",
				details: `Aucun synthétiseur trouvé avec l'ID ${id}`,
			});
		}

		// Vérifier si le contenu est fourni
		if (!content) {
			return res.status(400).json({
				error: "Contenu manquant",
				details: "Le contenu du post est requis",
			});
		}

		// Créer le post
		const newPost = await db.Post.create({
			content,
			synthetiserId: id,
		});

		res.status(201).json({
			data: newPost,
			message: "Post ajouté avec succès",
		});
	} catch (error) {
		console.error("Add post error:", error);
		res.status(400).json({
			error: "Échec de l'ajout du post",
			details: error.message,
		});
	}
};
//Fonction pour mettre à jour un seulsynthetiseur
export const updateSynthetiserInfo = async (req, res) => {
	const { id } = req.params;
	try {
		// Récupération du synthétiseur
		const existingSynth = await db.Synthetiser.findByPk(id);
		if (!existingSynth) {
			return res.status(404).json({
				error: "Synthétiseur non trouvé",
				details: `Aucun synthétiseur trouvé avec l'ID ${id}`,
			});
		}

		// req.user est maintenant disponible grâce au middleware
		const currentUser = req.user;
		console.log("Utilisateur courant:", currentUser);

		// Filtrage des champs autorisés
		const allowedFields = [
			"marque",
			"modele",
			"specifications",
			"image_url",
			"price",
			"auctionPrice",
			"note",
			"nb_avis",
		];

		// Création de l'objet de mise à jour avec uniquement les champs autorisés
		const updateData = {};
		for (const field of allowedFields) {
			if (req.body[field] !== undefined) {
				updateData[field] = req.body[field];
			}
		}

		// Passer l'utilisateur dans les options
		await existingSynth.update(updateData, {
			user: currentUser,
		});

		// Récupération du synthétiseur mis à jour
		const updatedSynth = await db.Synthetiser.findByPk(id);

		res.json({
			data: updatedSynth,
			message: "Synthétiseur mis à jour avec succès",
		});
	} catch (error) {
		console.error("Erreur lors de la mise à jour:", error);

		// Gestion spécifique des erreurs de permission
		if (error.message === "Seul le propriétaire peut modifier le prix") {
			return res.status(403).json({
				error: "Permission refusée",
				details: error.message,
			});
		}

		res.status(500).json({
			error: "Erreur lors de la mise à jour du synthétiseur",
			details: error.message,
		});
	}
};
