
import Profile from '../models/Profile.js';

// Fonction pour obtenir tous les synthétiseurs
export const getAllProfiles = async (req, res) => {
    try {
        const synths = await Profile.findAll();
        res.json(synths);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve profiles' });
    }
};

// Fonction pour créer un nouveau synthétiseur
export const createProfile = async (req, res) => {
    try {
        const newSynth = await Profile.create(req.body);
        res.status(201).json(newSynth);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create profile' });
    }
};

// Exporter les fonctions avec un export par défaut
export default { getAllProfiles, createProfile};