// routes/synthetisers.js
import express from 'express';
import { importData, getAllSynthetisers, createSynthetiser, getSynthetiser, updateSynthetiserInfo, addPost } from '../controllers/synthetiserController.js';
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

// Route pour mettre à jour un synthétiseur
router.put('/:id', authenticateToken, updateSynthetiserInfo);

               

export default router;