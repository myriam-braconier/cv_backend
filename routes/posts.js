import express from 'express';
const router = express.Router();
import { getAllPosts, createPost, updatePost } from '../controllers/postController.js';

// Route pour obtenir tous les posts
router.get('/', getAllPosts);

// Route pour créer un nouveau post
router.post('/', createPost);

// route pour modifier un post
router.put('/:id', updatePost);

export default router; 