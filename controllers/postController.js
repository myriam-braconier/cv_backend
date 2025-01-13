import db from "../models/index.js";

// Fonction pour obtenir tous les posts
// Fonction pour obtenir tous les posts
export const getAllPosts = async (req, res) => {
    try {
        const { synthetiserId } = req.query; // Récupérer le synthetiserId de la requête

        // Construire l'objet de requête
        const queryOptions = {
            include: [{
                model: db.User,
                as: 'author',
                attributes: ['id', 'username']
            }],
            order: [['createdAt', 'DESC']]
        };

        // Ajouter la condition where si synthetiserId est fourni
        if (synthetiserId) {
            queryOptions.where = { synthetiserId: Number(synthetiserId) };
        }

        const posts = await db.Post.findAll(queryOptions);

        // Logs détaillés
        console.log('Requête avec synthetiserId:', synthetiserId);
        console.log('Premier post complet:', JSON.stringify(posts[0], null, 2));
        console.log('Nombre de posts trouvés:', posts.length);
        
        res.json(posts);
    } catch (error) {
        console.error("Erreur lors de la récupération des posts:", error);
        res.status(500).json({
            error: "Failed to retrieve posts",
            details: error.message
        });
    }
};

export const getPostById = async (req, res) => {
    try {
      const { id } = req.params;
      const post = await db.Post.findOne({
        where: { id },
        include: [{
          model: db.User,
          as: 'author',
          attributes: ['id', 'username']
        }]
      });
  
      if (!post) {
        return res.status(404).json({ message: 'Post non trouvé' });
      }
  
      res.json(post);
    } catch (error) {
      console.error('Erreur lors de la récupération du post:', error);
      res.status(500).json({ error: error.message });
    }
  };

// Fonction pour créer un nouveau post
export const createPost = async (req, res) => {
    try {
        const newPost = await db.Post.create(req.body);
        // Récupérer le post avec les infos utilisateur
        const postWithUser = await db.Post.findByPk(newPost.id, {
            include: [{
                model: db.User,
                as: 'author',
                attributes: ['id', 'username']
            }]
        });
        res.status(201).json(postWithUser);
    } catch (error) {
        console.error("Erreur création post:", error);
        res.status(400).json({ error: "Failed to create post" });
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
	} 
};

// Exporter les fonctions avec un export par défaut
export default { getAllPosts, createPost, updatePost };
