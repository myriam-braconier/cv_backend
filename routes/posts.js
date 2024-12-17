import express from 'express';
const router = express.Router();
import { getAllPosts, createPost } from '../controllers/postController.js';

// Route pour obtenir tous les synthétiseurs
router.get('/', getAllPosts);

// Route pour créer un nouveau synthétiseur
router.post('/', createPost);

export default router; 