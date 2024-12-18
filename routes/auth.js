// routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Op } from "sequelize";
import db from "../models/index.js";

// Configuration de dotenv
dotenv.config();

const router = express.Router();

// Route d'enregistrement 
router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
 
        const result = await db.sequelize.transaction(async (t) => {
            console.log('1. Début de la transaction');
            
            // 1. Créer l'utilisateur
            console.log('2. Création de l\'utilisateur');
            const newUser = await db.user.create({
                username,
                email,
                password: hashedPassword
            }, { transaction: t });
            console.log('3. Utilisateur créé:', newUser.id);
 
            // 2. Trouver ou créer le rôle user
            console.log('4. Recherche/création du rôle user');
            const [userRole] = await db.role.findOrCreate({
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

        const user = await db.user.findOne({ 
            where: { email },
            include: [{
                model: db.role,
                as: 'roles'
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
            roles: user.roles.map(role => role.name)
        }, process.env.JWT_SECRET, {
            expiresIn: "1h"
        });

        res.status(200).json({
            message: "Connexion réussie",
            token,
            userId: user.id,
            username: user.username,
            email: user.email,
            roles: user.roles.map(role => role.name)
        });
    } catch (error) {
        console.error("Erreur lors de la connexion:", error);
        res.status(500).json({
            message: "Erreur interne du serveur lors de la connexion."
        });
    }
});

export default router;