// routes/auth.js
import express from "express";
import authController from '../controllers/authController.js';
import dotenv from 'dotenv';
import { authenticateToken } from '../middleware/authMiddleware.js';

// Configuration de dotenv
dotenv.config();

const router = express.Router();


router.post('/register', authController.register);
router.post('/login', authController.login);


export default router;