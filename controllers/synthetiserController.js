// controllers/synthesizerController.js
const Synthesizer = require('../models/Synthesizer');

// Fonction pour obtenir tous les synthétiseurs
exports.getAllSynthesizers = async (req, res) => {
    try {
        const synths = await Synthesizer.findAll();
        res.json(synths);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve synthesizers' });
    }
};

// Fonction pour créer un nouveau synthétiseur
exports.createSynthesizer = async (req, res) => {
    try {
        const newSynth = await Synthesizer.create(req.body);
        res.status(201).json(newSynth);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create synthesizer' });
    }
};
