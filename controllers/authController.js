// controllers/authController.js
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from "../models/index.js";



// Configuration de dotenv
dotenv.config();


const authController = {
    // Login
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Vérifier si l'utilisateur existe
            const user = await db.User.findOne({ where: { email } });
            if (!user || !await bcrypt.compare(password, user.password)) {
                return res.status(401).json({ message: "Email ou mot de passe incorrect" });
            }


            // Créer le token
          
            const token = jwt.sign(
                { id: user.id, email: user.email, roleId: user.roleId },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Préparer les données utilisateur à renvoyer
            const userData = {
                id: user.id,
                email: user.email,
                username: user.username,
                roleId: user.roleId
            };



            // Définir le cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: true, // Important pour SameSite=None
                sameSite: 'none',
                maxAge: 24 * 60 * 60 * 1000, // 24 heures
                path: '/' // S'assurer que le cookie est disponible sur tout le site
            });

            // Renvoyer la réponse
            res.status(200).json({
                message: "Connexion réussie",
                user: userData,
                token
            });

        } catch (error) {
            console.error('Erreur de connexion:', error);
            res.status(500).json({ message: "Erreur lors de la connexion" });
        }
    },

    // Vérification du token
    verify: async (req, res) => {
        try {
            // Le middleware authenticateToken a déjà vérifié le token
            const user = await db.User.findByPk(req.user.id, {
                attributes: ['id', 'email', 'username', 'roleId'],
                include: [{
                    model: db.Role,
                    attributes: ['name']
                }]
            });

            if (!user) {
                return res.status(404).json({ message: "Utilisateur non trouvé" });
            }

            res.status(200).json({ 
                valid: true, 
                user: {
                    ...user.get(),
                    role: user.Role?.name
                }
            });


        } catch (error) {
            console.error('Erreur de vérification:', error);
            res.status(500).json({ message: "Erreur lors de la vérification" });
        }
    },

    // Déconnexion
    logout: async (req, res) => {
        try {


             // Configuration identique pour supprimer le cookie
        res.header('Access-Control-Allow-Origin', 'https://concrete-frontend.vercel.app');
        res.header('Access-Control-Allow-Credentials', 'true');



             res.cookie('token', '', {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 0,
                path: '/'
            });

            res.status(200).json({ message: "Déconnexion réussie" });

        } catch (error) {
            console.error('Erreur de déconnexion:', error);
            res.status(500).json({ message: "Erreur lors de la déconnexion" });
        }
    },

    // Inscription
    register: async (req, res) => {
        try {
            const { email, password, username } = req.body;

            // Vérifier si l'utilisateur existe déjà
            const existingUser = await db.User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: "Cet email est déjà utilisé" });
            }

            // Hasher le mot de passe
            const hashedPassword = await bcrypt.hash(password, 10);

            // Créer l'utilisateur
            const user = await db.User.create({
                email,
                password: hashedPassword,
                username,
                roleId: ['user'] // rôle par défaut
            });

            // Créer le token
            const token = jwt.sign(
                { 
                    id: user.id, 
                    email: user.email, 
                    role: user.role 
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Préparer les données utilisateur
            const userData = {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role
            };

            // Définir le cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: true,  // Toujours true quand sameSite est 'None'
                sameSite: 'none',
                maxAge: 24 * 60 * 60 * 1000,
                path: '/'
            });

            res.status(201).json({
                message: "Inscription réussie",
                user: userData,
                token
            });

        } catch (error) {
            console.error('Erreur d\'inscription:', error);
            res.status(500).json({ message: "Erreur lors de l'inscription" });
        }
    }
};

export default authController;