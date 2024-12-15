import express from 'express';
const router = express.Router();
import postController from '../controllers/postController.js';

// Route pour obtenir tous les synthétiseurs
router.get('/', postController.getAllPosts);

// Route pour créer un nouveau synthétiseur
router.post('/', postController.createPost);

export default router; 