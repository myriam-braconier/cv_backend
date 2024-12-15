import express from 'express';
const router = express.Router();
import  userController from '../controllers/userController.js';

// Route pour obtenir tous les synthétiseurs
router.get('/', userController.getAllUsers);

// Route pour créer un nouveau synthétiseur
router.post('/', userController.createUser);

export default router; 