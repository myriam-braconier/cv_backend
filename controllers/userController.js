const User = require('../models/User');

// Fonction pour obtenir tous les synthétiseurs
exports.getAllUsers = async (req, res) => {
    try {
        const synths = await User.findAll();
        res.json(synths);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve users' });
    }
};

// Fonction pour créer un nouveau synthétiseur
exports.createUser = async (req, res) => {
    try {
        const newSynth = await User.create(req.body);
        res.status(201).json(newSynth);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create user' });
    }
};