import express from "express";
const router = express.Router();
import {
	createAuction,
	getLatestAuctionBySynthId,
	getAllAuctions,
} from "../controllers/auctionPriceController.js";
// import { authenticateToken } from "../middleware/authMiddleware.js"; // pour auth

router.get("/",  getAllAuctions);

router.post("/:synthId",  createAuction);

router.put("/:id/auctions",  getLatestAuctionBySynthId);
export default router;
