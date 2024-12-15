import express from 'express';
import * as synthetiserController from '../controllers/synthetiserController.js'; // import toutes les exportations nommées

const router = express.Router();


// Route pour importer les données JSON depuis des fichiers dans le dossier data
router.post('/import', synthetiserController.importData);


// Route pour obtenir tous les synthétiseurs
router.get('/', synthetiserController.getAllSynthetisers);

// Route pour créer un nouveau synthétiseur
router.post('/', synthetiserController.createSynthetiser);

export default router; 
