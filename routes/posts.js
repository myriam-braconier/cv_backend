const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Route pour obtenir tous les synthétiseurs
router.get('/', postController.getAllPosts);

// Route pour créer un nouveau synthétiseur
router.post('/', postController.createPost);

module.exports = router;