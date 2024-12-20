import db from "../models/index.js";


// Fonction pour obtenir tous les synthétiseurs
export const getAllProfiles = async (req, res) => {
    try {
        const profiles = await db.Profile.findAll();
        res.json(profiles);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve profiles' });
    }
};

// Fonction pour créer un nouveau synthétiseur
export const createProfile = async (req, res) => {
    try {
        const newProfile = await db.Profile.create(req.body);
        res.status(201).json(newProfile);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create profile' });
    }
};

