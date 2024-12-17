import express from 'express';
import { getAllUsers, createUser } from '../controllers/userController.js';

const router = express.Router();
// Route pour obtenir tous les utilisateurs
router.get('/', getAllUsers);

// Route pour créer un nouveau utilisateur
router.post('/', createUser);

export default router; 