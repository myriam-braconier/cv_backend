// routes/auth.js
import express from "express";
import { register, login, verify, logout } from '../controllers/authController.js';
import dotenv from 'dotenv';
import { authenticateToken } from '../middleware/authMiddleware.js';

// Configuration de dotenv
dotenv.config();

const router = express.Router();


router.post('/register', register);
router.post('/login', login);
router.get('/verify', authenticateToken, authController.verify);
router.post('/logout', authenticateToken, authController.logout);

export default router;