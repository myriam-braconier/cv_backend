import db from "../models/index.js";

// Fonction pour obtenir tous les posts
export const getAllPosts = async (req, res) => {
	try {
		const posts = await db.Post.findAll();
		res.json(posts);
	} catch (error) {
		res.status(500).json({ error: "Failed to retrieve posts" });
	} finally {
		// Libère explicitement la connexion
		await sequelize.connectionManager.releaseConnection(connection);
	}
};

// Fonction pour créer un nouveau post
export const createPost = async (req, res) => {
	try {
		const newPost = await db.Post.create(req.body);
		res.status(201).json(newPost);
	} catch (error) {
		res.status(400).json({ error: "Failed to create post" });
	} finally {
		// Libère explicitement la connexion
		await sequelize.connectionManager.releaseConnection(connection);
	}
};

// Updater le post d'un utilisateur
export const updatePost = async (req, res) => {
	const { id } = req.params;
let connection;
	try {



 // Obtenir une connexion du pool
 connection = await sequelize.connectionManager.getConnection();



		// Vérifier si l'utilisateur est authentifié
		if (!req.user) {
			return res.status(401).json({ error: "Non authentifié" });
		}

		// Rechercher le post
		const post = await db.Post.findByPk(id);
		if (!post) {
			return res.status(404).json({ error: "Post non trouvé" });
		}

		// Vérifier si l'utilisateur est l'auteur du post
		if (post.userId !== req.user.id) {
			return res.status(403).json({ error: "Non autorisé à modifier ce post" });
		}

		// Mettre à jour avec les nouvelles données
		const updatedPost = await post.set(req.body).save();

		// Retourner le synthétiseur mis à jour
		res.json(updatedPost);
	} catch (error) {
		console.error("Erreur lors de la mise à jour:", error);
		res.status(500).json({
			error: "Erreur lors de la mise à jour du post",
			details: error.message,
		});
	} finally {
		// Libère explicitement la connexion
		await sequelize.connectionManager.releaseConnection(connection);
	}
};

// Exporter les fonctions avec un export par défaut
export default { getAllPosts, createPost, updatePost };
