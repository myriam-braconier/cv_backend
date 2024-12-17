import express from 'express';
import { importData, getAllSynthetisers, createSynthetiser } from '../controllers/synthetiserController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';


const router = express.Router();




// Ne pas inclure /api/synthetisers ici car c'est déjà dans app.js
router.use(authenticateToken);

// Route pour importer les données JSON depuis des fichiers dans le dossier data
router.post('/import', importData);


// Route pour obtenir tous les synthétiseurs
router.get('/', getAllSynthetisers);

// Route pour créer un nouveau synthétiseur
router.post('/', createSynthetiser);

export default router; 
