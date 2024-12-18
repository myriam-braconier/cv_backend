import db from "../models/index.js";


// Fonction pour obtenir tous les utilisateurs
export const getAllUsers = async (req, res) => {
    try {
        const users = await db.user.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve users' });
    }
};

// Fonction pour créer un nouvel utilisateur
export const createUser = async (req, res) => {
    try {
        const newUser = await db.user.create(req.body);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create user' });
    }
};
