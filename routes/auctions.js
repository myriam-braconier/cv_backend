// routes/auctionRoutes.js
import express from 'express';
const router = express.Router();
import { createAuctionViaSynth } from '../controllers/auctionPriceController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';  // Import nommé



// Route pour la méthode 2
router.post('/synth-auctions', authenticateToken, createAuctionViaSynth);

export default router;
