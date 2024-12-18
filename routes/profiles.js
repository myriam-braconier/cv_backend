import express from 'express';
const router = express.Router();
import { getAllProfiles, createProfile } from '../controllers/profileController.js';

// Route pour obtenir tous les profile
router.get('/', getAllProfiles);

// Route pour créer un nouveau profile
router.post('/', createProfile);

export default router; 