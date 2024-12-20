// controllers/authController.js
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import db from "../models/index.js";

export const register = async (req, res) => {
    const { username, email, password } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.sequelize.transaction(async (t) => {
            // Vérifier si l'utilisateur existe déjà
            const existingUser = await db.user.findOne({
                where: {
                    [db.Sequelize.Op.or]: [
                        { email: email },
                        { username: username }
                    ]
                },
                include: [{
                    model: db.role,
                    as: 'role'
                }]
            });

            if (existingUser) {
                throw new Error('Un utilisateur avec cet email ou ce nom existe déjà');
            }

            // Trouver le rôle user
            const userRole = await db.role.findOne({
                where: { name: 'user' },
                transaction: t
            });

            if (!userRole) {
                throw new Error('Rôle utilisateur non trouvé');
            }

            // Créer l'utilisateur avec le rôle
            const newUser = await db.user.create({
                username,
                email,
                password: hashedPassword,
                roleId: userRole.id,
                isActive: true
            }, { transaction: t });

            return newUser;
        });

        return res.status(201).json({
            message: "Utilisateur créé avec succès",
            userId: result.id,
            username: result.username
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

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({
                message: "Email et mot de passe sont requis."
            });
        }

        const user = await db.user.findOne({ 
            where: { email },
            include: [{
                model: db.role,
                as: 'role'
            }]
        });
        
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Mot de passe incorrect." });
        }

        const token = jwt.sign({ 
            userId: user.id,
            roleId: user.roleId
        }, process.env.JWT_SECRET, {
            expiresIn: "1h"
        });

        res.status(200).json({
            message: "Connexion réussie",
            token,
            userId: user.id,
            username: user.username,
            email: user.email,
            role: user.role.name
        });
    } catch (error) {
        console.error("Erreur:", error);
        res.status(500).json({
            message: "Erreur interne du serveur."
        });
    }
};

