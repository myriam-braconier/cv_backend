import User from '../models/User.js';

// Fonction pour obtenir tous les synthétiseurs
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve users' });
    }
};

// Fonction pour créer un nouvel utilisateur
export const createUser = async (req, res) => {
    try {
        const newUser = await User.create(req.body);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create user' });
    }
};

export default { getAllUsers, createUser}; // Export par défaut sous forme d'objet