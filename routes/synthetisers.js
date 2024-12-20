// routes/synthetisers.js
import express from 'express';
import { importData, getAllSynthetisers, createSynthetiser } from '../controllers/synthetiserController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';  // Import nommé

const router = express.Router();

router.use(authenticateToken);  // Utilisation du middleware

router.post('/import', importData);
router.get('/', getAllSynthetisers);
router.post('/', createSynthetiser);

export default router;