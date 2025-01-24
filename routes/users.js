import express from 'express';
import { getAllUsers, createUser, getUsersWithPosts, getUserPermissions } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js'

const router = express.Router();
// Route pour obtenir tous les utilisateurs
router.get('/', getAllUsers);

// Route pour obtenir les utilisateurs avec leurs posts
router.get('/with-posts', getUsersWithPosts);

// Route pour obtenir les permissions des utilsiateurs
router.get('/permissions', authenticateToken, getUserPermissions);

// Route pour créer un nouveau utilisateur
router.post('/', createUser);



export default router; 