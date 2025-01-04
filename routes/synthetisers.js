// routes/synthetisers.js
import express from "express";
import {
	importData,
	getAllSynthetisers,
	createSynthetiser,
	duplicateSynthetiser,
	deleteSynthetiser,
	getSynthetiser,
	updateSynthetiser,
	addPost,
	addAuction,
	getLatestAuctionBySynthetiser
} from "../controllers/synthetiserController.js";
import { authenticateToken } from "../middleware/authMiddleware.js"; // Import nommé

const router = express.Router();

// router.use(authenticateToken); // Utilisation du middleware sur toutes les routes


router.post("/import", authenticateToken, importData);

// Routes publiques
router.get('/', getAllSynthetisers);
router.get('/:id', getSynthetiser);

// Routes protégées nécessitant une authentification
router.post('/', authenticateToken, createSynthetiser);
router.put('/:id', authenticateToken, updateSynthetiser);
router.delete('/:id', authenticateToken, deleteSynthetiser);

// Routes pour les enchères
router.post('/:id/auctions', authenticateToken, addAuction);
router.get('/:id/auctions/latest', authenticateToken, getLatestAuctionBySynthetiser);

// Routes pour les posts
router.post('/:id/posts', authenticateToken, addPost);

// Route pour la duplication (admin uniquement)
router.post('/:id/duplicate', authenticateToken, duplicateSynthetiser);

export default router;
