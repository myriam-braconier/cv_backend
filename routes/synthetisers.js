// routes/synthetisers.js
import express from 'express';
import { importData, getAllSynthetisers, createSynthetiser, getSynthetiser, updateMainSynthetiserInfo, updatePrice, addPost } from '../controllers/synthetiserController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';  // Import nommé

const router = express.Router();

router.use(authenticateToken);  // Utilisation du middleware sur toutes les routes



// routes de lecture
router.get('/', getAllSynthetisers);
router.get('/:id', getSynthetiser);  

// routes de création
router.post('/import', importData);
router.post('/', createSynthetiser);
// Route pour ajouter un post
router.post('/:id/posts', addPost);

// Nouvelles routes pour les mises à jour
router.put('/:id/main-info', updateMainSynthetiserInfo);  // Mise à jour des infos principales
                  // Mise à jour du prix



export default router;