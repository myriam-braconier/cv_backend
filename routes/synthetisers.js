// routes/synthetisers.js
import express from "express";
import {
	importData,
	getAllSynthetisers,
	createSynthetiser,
	getSynthetiser,
	updateSynthetiserInfo,
	addPost,
	addAuction,
} from "../controllers/synthetiserController.js";
import { authenticateToken } from "../middleware/authMiddleware.js"; // Import nommé

const router = express.Router();

router.use(authenticateToken); // Utilisation du middleware sur toutes les routes

// routes de lecture
router.get("/", authenticateToken, getAllSynthetisers);
router.get("/:id", authenticateToken, getSynthetiser);

// routes de création
router.post("/import", authenticateToken, importData);
router.post("/", authenticateToken, createSynthetiser);
// Route pour ajouter un post
router.post("/:id/posts", authenticateToken, addPost);

// Route pour mettre à jour un synthétiseur
router.put("/:id",  authenticateToken, updateSynthetiserInfo);

// sous-routes
// les routes d'enchères comme sous-routes
router.put("/:id/auctions", authenticateToken, addAuction); 


export default router;
