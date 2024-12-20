// routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from "../models/index.js";
import { authenticateToken } from '../middleware/authMiddleware.js'; 


// Configuration de dotenv
dotenv.config();

const router = express.Router();

// Route /me  pour utiliser Sequelize
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await db.User.findOne({
            where: { id: req.user.userId },
            include: {
                model: db.Role,
                as: 'role',
                attributes: ['name']
            },
            attributes: ['id', 'email', 'username'] // Exclure le password
        });
        
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.json({
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role ? user.role.name : null
        });
    } catch (err) {
        console.error('Error in /auth/me:', err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Route d'enregistrement 
router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
 
        const result = await db.Sequelize.transaction(async (t) => {
            console.log('1. Début de la transaction');
            
            // 1. Créer l'utilisateur
            console.log('2. Création de l\'utilisateur');
            const newUser = await db.User.create({
                username,
                email,
                password: hashedPassword
            }, { transaction: t });
            console.log('3. Utilisateur créé:', newUser.id);
 
            // 2. Trouver ou créer le rôle user
            console.log('4. Recherche/création du rôle user');
            const [userRole] = await db.Role.findOrCreate({
                where: { name: 'user' },
                defaults: {
                    name: 'user',
                    description: 'Utilisateur standard'
                },
                transaction: t
            });
            console.log('5. Rôle trouvé/créé:', userRole.id);
 
            // 3. Ajouter le rôle à l'utilisateur
            console.log('6. Attribution du rôle');
            await newUser.addRole(userRole, { transaction: t });
            console.log('7. Rôle attribué');
 
            console.log('8. Retour de l\'utilisateur');
            return newUser;
        });
 
        console.log('9. Transaction terminée avec succès');
        console.log('10. Données de l\'utilisateur:', {
            id: result.id,
            username: result.username
        });
 
        return res.status(201).json({
            message: "Utilisateur créé avec succès",
            userId: result.id,
            username: result.username
        });
 
    } catch (error) {
        console.error('Erreur détaillée:', error);
        console.error('Stack trace:', error.stack);
        return res.status(500).json({
            message: "Erreur lors de la création de l'utilisateur",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Route de connexion
router.post("/login", async (req, res) => {
    console.log('Route /login atteinte');
    console.log('Corps de la requête reçue:', req.body);
    console.log('Tentative de connexion pour:', req.body.email);
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            console.log('Validation échouée - champs manquants');
            return res.status(400).json({
                message: "Email et mot de passe sont requis."
            });
        }

        const user = await db.User.findOne({ 
            where: { email },
            include: [{
                model: db.Role,
                as: 'role'
            }]
        });
        
        console.log('Utilisateur trouvé:', user ? 'Oui' : 'Non');
        
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Mot de passe incorrect." });
        }

        const token = jwt.sign({ 
            userId: user.id,
            role: user.role ? user.role.name : null
        }, process.env.JWT_SECRET, {
            expiresIn: "1h"
        });

        res.status(200).json({
            message: "Connexion réussie",
            token,
            userId: user.id,
            username: user.username,
            email: user.email,
            role: user.role ? user.role.name : null
        });
    } catch (error) {
        console.error("Erreur lors de la connexion:", error);
        res.status(500).json({
            message: "Erreur interne du serveur lors de la connexion."
        });
    }
});



export default router;