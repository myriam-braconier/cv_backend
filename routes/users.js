const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route pour obtenir tous les synthétiseurs
router.get('/', userController.getAllUsers);

// Route pour créer un nouveau synthétiseur
router.user('/', userController.createUser);

module.exports = router;