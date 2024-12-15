import express from 'express';
const router = express.Router();
import roleController from '../controllers/roleController.js';

// Route pour obtenir tous les synthétiseurs
router.get('/', roleController.getAllRoles);

// Route pour créer un nouveau synthétiseur
router.post('/', roleController.createRole);

export default router; 