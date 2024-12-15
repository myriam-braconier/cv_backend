const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// Route pour obtenir tous les synthétiseurs
router.get('/', profileController.getAllProfiles);

// Route pour créer un nouveau synthétiseur
router.profile('/', profileController.createProfile);

module.exports = router;