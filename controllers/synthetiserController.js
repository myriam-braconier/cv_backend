import { importJsonData } from "../utils/importService.js";
import db from "../models/index.js";


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
			include: [
				{
					model: db.AuctionPrice,
					as: "auctionPrices", // Comme défini dans les associations
					attributes: ["id", "proposal_price", "status"], // Les champs que vous voulez
					order: [["createdAt", "DESC"]], // Pour avoir les plus récentes d'abord
				},
			],
			order: [["createdAt", "DESC"]], // Ordre des synthétiseurs
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
// Fonction pour obtenir un synthétiseur spécifique
export const getSynthetiser = async (req, res) => {
	const { id } = req.params;

	try {
		const synthetiser = await db.Synthetiser.findByPk(id, {
			include: [
				{
					model: db.Post,
					as: "posts",
					attributes: ["id", "titre", "commentaire", "contenu", "type_contenu"],
				},
				{
					model: db.AuctionPrice,
					as: "auctionPrices",
					attributes: ["id", "proposal_price", "status", "createdAt"],
					order: [["createdAt", "DESC"]],
				},
			],
		});

		if (!synthetiser) {
			return res.status(404).json({
				error: "Synthétiseur non trouvé",
				details: `Aucun synthétiseur trouvé avec l'ID ${id}`,
			});
		}

		return res.status(200).json({
			data: synthetiser,
			message: "Synthétiseur récupéré avec succès",
		});
	} catch (error) {
		console.error("Get synthetiser error:", error);
		return res.status(500).json({
			error: "Échec de la récupération du synthétiseur",
			details: error.message,
		});
	}
};
// Fonction pour créer un nouveau synthétiseur
export const createSynthetiser = async (req, res) => {
	try {
	  // Vérifier si l'utilisateur est authentifié
	  if (!req.user) {
		return res.status(401).json({ error: "Non authentifié" });
	  }
  
	  const synthData = {
		...req.body,
		price: req.body.price ? {
		  value: req.body.price.value,
		  currency: req.body.price.currency,
		  lastUpdatedBy: req.user.id
		} : null,
		userId: req.user.id
	  };
  
	  // Créer le synthétiseur avec les colonnes générées
	  const newSynth = await db.Synthetiser.create(synthData, {
		fields: [
		  'marque',
		  'modele',
		  'specifications',
		  'image_url',
		  'note',
		  'nb_avis',
		  'price',
		  'userId'
		]
	  });
  
	  res.status(201).json({
		data: newSynth,
		message: "Synthétiseur créé avec succès"
	  });
  
	} catch (error) {
	  console.error("Create error:", error);
	  res.status(400).json({
		error: "Échec de la création du synthétiseur",
		details: error.message
	  });
	}
  };
  
  export const duplicateSynthetiser = async (req, res) => {
    const { id } = req.params;
    try {
        // Vérifier si l'utilisateur est authentifié
        if (!req.user) {
            return res.status(401).json({ error: "Non authentifié" });
        }

        // Vérifier le rôle de l'utilisateur
        const userRole = req.user.roleId;
        if (userRole !== 2) {
            return res.status(403).json({
                error: "Non autorisé",
                message: "Seuls les administrateurs peuvent dupliquer un synthétiseur"
            });
        }

        // Récupérer le synthétiseur original
        const originalSynth = await db.Synthetiser.findByPk(id);
        if (!originalSynth) {
            return res.status(404).json({
                error: "Synthétiseur non trouvé",
                details: `Aucun synthétiseur trouvé avec l'ID ${id}`
            });
        }

        // Créer une copie du synthétiseur
        const duplicatedSynth = await db.Synthetiser.create({
            marque: originalSynth.marque,
            modele: `${originalSynth.modele} (copie)`,
            specifications: originalSynth.specifications,
            image_url: originalSynth.image_url,
            note: originalSynth.note,
            nb_avis: originalSynth.nb_avis,
            price: originalSynth.price,
            userId: req.user.id
        });

        res.status(201).json({
            message: "Synthétiseur dupliqué avec succès",
            data: duplicatedSynth
        });

    } catch (error) {
        console.error("Erreur lors de la duplication:", error);
        res.status(500).json({
            error: "Erreur lors de la duplication du synthétiseur",
            details: error.message
        });
    }
};


export const deleteSynthetiser = async (req, res) => {
	const { id } = req.params;
	try {
		// Vérifier si l'utilisateur est authentifié
		if (!req.user) {
			return res.status(401).json({ error: "Non authentifié" });
		}

		// Vérifier le rôle de l'utilisateur
		const userRole = req.user.roleId;
		if (userRole !== 2) {
			return res.status(403).json({
				error: "Non autorisé",
				message: "Seuls les administrateurs peuvent supprimer un synthétiseur",
			});
		}

		// Vérifier si le synthétiseur existe
		const existingSynth = await db.Synthetiser.findByPk(id);
		if (!existingSynth) {
			return res.status(404).json({
				error: "Synthétiseur non trouvé",
				details: `Aucun synthétiseur trouvé avec l'ID ${id}`,
			});
		}

		// Supprimer le synthétiseur et ses relations
		await existingSynth.destroy();

		res.status(200).json({
			message: "Synthétiseur supprimé avec succès",
		});
	} catch (error) {
		console.error("Erreur lors de la suppression:", error);
		res.status(500).json({
			error: "Erreur lors de la suppression du synthétiseur",
			details: error.message,
		});
	}
};

// Fonction pour mettre à jour un synthétiseur
export const updateSynthetiser = async (req, res) => {
	const { id } = req.params;

	try {
		// Vérifier si l'utilisateur est authentifié
		if (!req.user) {
			return res.status(401).json({ error: "Non authentifié" });
		}

		// Rechercher le synthétiseur
		const synth = await db.Synthetiser.findByPk(id);
		if (!synth) {
			return res.status(404).json({ error: "Synthétiseur non trouvé" });
		}

		// Mettre à jour avec les nouvelles données
		const updatedSynth = await synth.set(req.body).save();

		// Retourner le synthétiseur mis à jour
		res.json(updatedSynth);
	} catch (error) {
		console.error("Erreur lors de la mise à jour:", error);
		res.status(500).json({
			error: "Erreur lors de la mise à jour du synthétiseur",
			details: error.message,
		});
	}
};

// Fonction pour ajouter une enchère
export const addAuction = async (req, res) => {
	const { id } = req.params;
	const { proposal_price, userId } = req.body;

	try {
		const synthetiser = await db.Synthetiser.findByPk(id);
		if (!synthetiser) {
			return res.status(404).json({
				error: "Synthétiseur non trouvé",
			});
		}

		if (!proposal_price) {
			return res.status(400).json({
				error: "Le montant de l'enchère est requis",
			});
		}

		const newAuction = await db.AuctionPrice.create({
			proposal_price,
			status: "active",
			synthetiserId: id,
			userId,
			createAt: new Date().toISOString(),
			updateAt: new Date().toISOString(),
		});

		res.status(201).json({
			data: newAuction,
			message: "Enchère ajoutée avec succès",
		});
	} catch (error) {
		console.error("Erreur d'ajout d'enchère:", error);
		res.status(400).json({
			error: "Échec de l'ajout de l'enchère",
			details: error.message,
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

export const updatePrice = async (req, res) => {
	const { id } = req.params;
	const { auctionPrice } = req.body;

	try {
		// Vérifier si l'utilisateur est authentifié
		if (!req.user) {
			return res.status(401).json({
				error: "Non authentifié",
			});
		}

		// Vérifier le rôle de l'utilisateur
		const userRole = req.user.role;
		if (!["admin", "owner_instr"].includes(userRole)) {
			return res.status(403).json({
				error: "Non autorisé",
				message:
					"Seuls les administrateurs et les propriétaires peuvent modifier le prix",
			});
		}

		const existingSynth = await db.Synthetiser.findByPk(id);
		if (!existingSynth) {
			return res.status(404).json({
				error: "Synthétiseur non trouvé",
			});
		}

		// Si c'est un owner_instr, vérifier qu'il est bien le propriétaire
		if (userRole === "owner_instr" && existingSynth.userId !== req.user.id) {
			return res.status(403).json({
				error: "Non autorisé",
				message: "Vous ne pouvez modifier que vos propres synthétiseurs",
			});
		}

		// Mise à jour du prix
		await existingSynth.update(
			{ auctionPrice },
			{
				user: req.user,
			}
		);

		res.json({
			data: existingSynth,
			message: "Prix mis à jour avec succès",
		});
	} catch (error) {
		console.error("Erreur lors de la mise à jour du prix:", error);
		res.status(500).json({
			error: "Erreur lors de la mise à jour du prix",
			message: error.message,
		});
	}
};

export const getLatestAuctionBySynthId = async (req, res) => {
    try {
        const synthetiserId = parseInt(req.params.id, 10);
        console.log('ID recherché:', synthId);
        
        const latestAuction = await db.AuctionPrice.findOne({
            where: { synthId, status: "active" },
            order: [["proposal_price", "DESC"], ["createdAt", "DESC"]]
        });
        
        console.log('Enchère trouvée:', latestAuction);
        
        if (!latestAuction) {
            return res.status(404).json({ message: "Aucune enchère trouvée" });
        }
        
		return res.status(200).json({
			...latestAuction.toJSON(),
			createdAt: latestAuction.createdAt,
		});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};


