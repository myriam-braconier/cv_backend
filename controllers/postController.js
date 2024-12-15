
import Post from '../models/Post.js';

// Fonction pour obtenir tous les synthétiseurs
export const getAllPosts = async (req, res) => {
    try {
        const synths = await Post.findAll();
        res.json(synths);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve posts' });
    }
};

// Fonction pour créer un nouveau synthétiseur
export const createPost = async (req, res) => {
    try {
        const newSynth = await Post.create(req.body);
        res.status(201).json(newSynth);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create post' });
    }
};

// Exporter les fonctions avec un export par défaut
export default { getAllPosts, createPost };