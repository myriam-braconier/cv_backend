import express from 'express';
const router = express.Router();
import profileController from '../controllers/profileController.js';

// Route pour obtenir tous les synthétiseurs
router.get('/', profileController.getAllProfiles);

// Route pour créer un nouveau synthétiseur
router.post('/', profileController.createProfile);

export default router; 