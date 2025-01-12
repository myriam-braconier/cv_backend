import express from "express";
const router = express.Router();
import {
	createAuction,
	getLatestAuctionBySynthId,
	getAllAuctions,
	deleteAuction
} from "../controllers/auctionPriceController.js";
// import { authenticateToken } from "../middleware/authMiddleware.js"; // pour auth

router.get("/",  getAllAuctions);

router.post("/:synthId",  createAuction);

router.put("/:id/auctions",  getLatestAuctionBySynthId);

router.delete('/:auctionId', deleteAuction);
export default router;
