import express from "express";
const router = express.Router();
import {
	createAuction,
	getLatestAuctionBySynthId,
	getAllAuctions,
	deleteAuction
} from "../controllers/auctionPriceController.js";

router.get("/",  getAllAuctions);

router.post("/:synthId",  createAuction);

router.put("/:id/auctions",  getLatestAuctionBySynthId);

// Ajoutez un log pour déboguer
router.delete('/:auctionId', (req, res, next) => {
    console.log('Route DELETE atteinte pour l\'ID:', req.params.auctionId);
    next();
}, deleteAuction);

export default router;
