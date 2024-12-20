
import db from "../models/index.js";


// Fonction pour obtenir tous les posts
export const getAllPosts = async (req, res) => {
    try {
        const posts = await db.post.findAll();
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve posts' });
    }
};

// Fonction pour créer un nouveau post
export const createPost = async (req, res) => {
    try {
        const newPost = await db.post.create(req.body);
        res.status(201).json(newPost);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create post' });
    }
};

// Exporter les fonctions avec un export par défaut
export default { getAllPosts, createPost };