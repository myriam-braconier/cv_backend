// controllers/authController.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import db from "../models/index.js";
import dotenv from 'dotenv';



// Configuration de dotenv
dotenv.config();

const router = express.Router();

// Route /me  pour utiliser Sequelize

export const me = async (req, res) => {
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
}


export const register = async (req, res) => {
    const { username, email, password, has_instrument } = req.body;
   
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await db.sequelize.transaction(async (t) => {
            console.log('Données reçues:', { username, email, has_instrument });

            const existingUser = await db.User.findOne({
                where: {
                    [db.Sequelize.Op.or]: [
                        { email: email },
                        { username: username }
                    ]
                }
            });

            if (existingUser) {
                throw new Error('Un utilisateur avec cet email ou ce nom existe déjà');
            }

            const defaultRoleId = 1; // user
            const creatorRoleId = 2; // creator
            const roleId = has_instrument ? creatorRoleId : defaultRoleId;
            
            console.log('RoleId sélectionné:', roleId);

            const newUser = await db.User.create({
                username,
                email,
                password: hashedPassword,
                has_instrument: has_instrument || false,
                roleId: roleId,
                isActive: true
            }, { 
                transaction: t,
            });

            console.log('Nouvel utilisateur créé:', {
                id: newUser.id,
                username: newUser.username,
                roleId: newUser.roleId,
                hasInstrument: newUser.has_instrument
            });

            return newUser;
        });

        return res.status(201).json({
            message: "Utilisateur créé avec succès",
            userId: result.id,
            username: result.username,
            hasInstrument: result.has_instrument
        });

    } catch (error) {
        console.error('Erreur:', error);
        if (error.message.includes('existe déjà')) {
            return res.status(409).json({ message: error.message });
        }
        return res.status(500).json({
            message: "Erreur lors de la création de l'utilisateur",
            error: error.message
        });
    }
};


// Route de connexion
export const login = async (req, res) => {
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
            roleId: user.roleId,
            role: user.role ? user.role.name : null
        }, process.env.JWT_SECRET, // ✅ Utiliser la même clé secrète partout
        { expiresIn: '24h' });

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
}

