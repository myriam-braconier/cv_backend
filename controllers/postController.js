
import db from "../models/index.js";


// Fonction pour obtenir tous les posts
export const getAllPosts = async (req, res) => {
    try {
        const posts = await db.Post.findAll();
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve posts' });
    }  finally {
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
        res.status(400).json({ error: 'Failed to create post' });
    }  finally {
        // Libère explicitement la connexion
        await sequelize.connectionManager.releaseConnection(connection);
    }
};

// Exporter les fonctions avec un export par défaut
export default { getAllPosts, createPost };