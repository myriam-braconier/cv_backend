// routes/synthetisers.js
import express from "express";
import {
	importData,
	getAllSynthetisers,
	createSynthetiser,
	deleteSynthetiser,
	getSynthetiser,
	updateSynthetiser,
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
// routes de destruction
router.delete("/:id", authenticateToken, deleteSynthetiser);
// Route pour ajouter un post
router.post("/:id/posts", authenticateToken, addPost);

// Route pour mettre à jour un synthétiseur
router.put("/:id",  authenticateToken, updateSynthetiser);

// sous-routes
//route pour encherir
router.post("/:id/auctions", authenticateToken, addAuction); 


export default router;
