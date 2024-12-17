import express from 'express';
const router = express.Router();
import { getAllRoles, createRole } from '../controllers/roleController.js';

// Route pour obtenir tous les synthétiseurs
router.get('/', getAllRoles);

// Route pour créer un nouveau synthétiseur
router.post('/', createRole);

export default router; 