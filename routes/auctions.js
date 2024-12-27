// routes/auctionRoutes.js
import express from 'express';
const router = express.Router();
import { createAuction, getLatestAuctionBySynthId } from '../controllers/auctionPriceController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';  // Import nommé


router.post('/:synthId', authenticateToken, createAuction);

router.put('/synthetisers/:id/auctions',     authenticateToken, getLatestAuctionBySynthId);
export default router;
