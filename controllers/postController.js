
const Post = require('../models/Post');

// Fonction pour obtenir tous les synthétiseurs
exports.getAllPosts = async (req, res) => {
    try {
        const synths = await Post.findAll();
        res.json(synths);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve posts' });
    }
};

// Fonction pour créer un nouveau synthétiseur
exports.createPost = async (req, res) => {
    try {
        const newSynth = await Post.create(req.body);
        res.status(201).json(newSynth);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create post' });
    }
};