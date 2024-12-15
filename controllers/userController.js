import User from '../models/User.js';

// Fonction pour obtenir tous les synthétiseurs
export const getAllUsers = async (req, res) => {
    try {
        const synths = await User.findAll();
        res.json(synths);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve users' });
    }
};

// Fonction pour créer un nouveau synthétiseur
export const createUser = async (req, res) => {
    try {
        const newSynth = await User.create(req.body);
        res.status(201).json(newSynth);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create user' });
    }
};

export default { getAllUsers, createUser}; // Export par défaut sous forme d'objet