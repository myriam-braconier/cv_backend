
const Profile = require('../models/Profile');

// Fonction pour obtenir tous les synthétiseurs
exports.getAllProfiles = async (req, res) => {
    try {
        const synths = await Profile.findAll();
        res.json(synths);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve profiles' });
    }
};

// Fonction pour créer un nouveau synthétiseur
exports.createProfile = async (req, res) => {
    try {
        const newSynth = await Profile.create(req.body);
        res.status(201).json(newSynth);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create profile' });
    }
};