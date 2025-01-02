// routes/auctionRoutes.js
import express from 'express';
const router = express.Router();
import { createAuction, getLatestAuctionBySynthId, getAllAuctions } from '../controllers/auctionPriceController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';  



router.get('/', authenticateToken, getAllAuctions);

router.post('/:synthId', authenticateToken, createAuction);

router.put('/:id/auctions',     authenticateToken, getLatestAuctionBySynthId);
export default router;
