const Role = require('../models/Role');

// Fonction pour obtenir tous les synthétiseurs
exports.getAllRoles = async (req, res) => {
    try {
        const synths = await Role.findAll();
        res.json(synths);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve roles' });
    }
};

// Fonction pour créer un nouveau synthétiseur
exports.createRole = async (req, res) => {
    try {
        const newSynth = await Role.create(req.body);
        res.status(201).json(newSynth);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create role' });
    }
};