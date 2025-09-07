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
	getLatestAuctionBySynthetiser,
} from "../controllers/synthetiserController.js";
import { authenticateToken } from "../middleware/authMiddleware.js"; // Import nommé
import { checkPermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();


// Routes publiques - pas besoin d'authentification
router.get('/', getAllSynthetisers);
router.get('/:id', getSynthetiser);

// Routes pour l'import (admin only)
router.post("/import", 
    authenticateToken, 
    checkPermission(['synths:import', 'admin:import'], 'any'),
    importData
);

// Routes de gestion des synthetiseurs
router.post('/', 
    authenticateToken,
    checkPermission(['synths:create', 'admin:write']),
    createSynthetiser
);
router.put('/:id', 
    authenticateToken,
    checkPermission(['synths:update', 'admin:write']),
    updateSynthetiser
);
router.delete('/:id', 
    authenticateToken,
    checkPermission(['synths:delete', 'admin:delete'], 'all'),
    deleteSynthetiser
);

// Routes pour les enchères
router.post('/:id/auctions', 
    authenticateToken,
    checkPermission(['auctions:create', 'auctions:read', 'auctions:update','synths:bid']),
    addAuction
);
router.get(
	"/:id/auctions/latest",
	authenticateToken,
	getLatestAuctionBySynthetiser
);

// Routes pour les posts
router.post('/:id/posts', 
    authenticateToken,
    checkPermission(['posts:create', 'synths:comment']),
    addPost
);

// Route pour la duplication (admin uniquement)
router.post(
	"/:id/duplicate",
	authenticateToken,
	checkPermission(["synths:duplicate", "admin:write"], "all"),
	duplicateSynthetiser
);

export default router;
