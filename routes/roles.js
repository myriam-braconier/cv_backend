const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');

// Route pour obtenir tous les synthétiseurs
router.get('/', roleController.getAllRoles);

// Route pour créer un nouveau synthétiseur
router.role('/', roleController.createRole);

module.exports = router;