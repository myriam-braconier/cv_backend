import Role from '../models/Role.js';

// Fonction pour obtenir tous les synthétiseurs
export const getAllRoles = async (req, res) => {
    try {
        const synths = await Role.findAll();
        res.json(synths);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve roles' });
    }
};

// Fonction pour créer un nouveau synthétiseur
export const createRole = async (req, res) => {
    try {
        const newSynth = await Role.create(req.body);
        res.status(201).json(newSynth);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create role' });
    }
};

// Exporter les fonctions avec un export par défaut 
export default { getAllRoles, createRole};