import express from 'express';
import { getAllUsers, createUser, getUsersWithPosts } from '../controllers/userController.js';

const router = express.Router();
// Route pour obtenir tous les utilisateurs
router.get('/', getAllUsers);

// Route pour obtenir les utilisateurs avec leurs posts
router.get('/with-posts', getUsersWithPosts);

// Route pour créer un nouveau utilisateur
router.post('/', createUser);



export default router; 