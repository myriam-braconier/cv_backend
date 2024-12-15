// routes/synthesizers.js
const express = require('express');
const router = express.Router();
const synthesizerController = require('../controllers/synthesizerController');

// Route pour obtenir tous les synthétiseurs
router.get('/', synthesizerController.getAllSynthesizers);

// Route pour créer un nouveau synthétiseur
router.post('/', synthesizerController.createSynthesizer);

module.exports = router;
