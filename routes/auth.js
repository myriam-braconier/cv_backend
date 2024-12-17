import express from "express";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'; // Ajout de l'import JWT
import dotenv from 'dotenv'; // Pour accéder aux variables d'environnement
import { User } from "../models/User.js";
import { Op } from "sequelize";




// Configuration de dotenv
dotenv.config();


const router = express.Router();

router.post("/register", async (req, res) => {
   console.log('Requête reçue sur /register:', {
       ...req.body,
       password: '[MASQUÉ]'
   });

   const { username, email, password } = req.body;

   try {
       // Validation des données
       if (!email || !password || !username) {
           console.log('Validation échouée - champs manquants');
           return res.status(400).json({
               message: "Tous les champs sont requis.",
               details: {
                   email: !email,
                   password: !password,
                   username: !username
               }
           });
       }

       // Vérifier si l'email ou le username existe déjà
       const existingUser = await User.findOne({
           where: {
               [Op.or]: [
                   { email: email },
                   { username: username }
               ]
           }
       });

       if (existingUser) {
           console.log('Utilisateur existant trouvé:', {
               email: existingUser.email === email,
               username: existingUser.username === username
           });
           return res.status(409).json({
               message: existingUser.email === email 
                   ? "Cet email est déjà utilisé." 
                   : "Ce nom d'utilisateur est déjà pris."
           });
       }

       // Hash du mot de passe
       const hashedPassword = await bcrypt.hash(password, 10);

       // Création de l'utilisateur
       const newUser = await User.create({
           username,
           email,
           password: hashedPassword
       });

       console.log('Nouvel utilisateur créé:', {
           id: newUser.id,
           username: newUser.username
       });

       // Envoyer la réponse de succès
       res.status(201).json({
           message: "Utilisateur créé avec succès",
           userId: newUser.id,
           username: newUser.username
       });

   } catch (error) {
       console.error('Erreur lors de la création de l\'utilisateur:', error);
       
       // Gérer les erreurs spécifiques de Sequelize
       if (error.name === 'SequelizeValidationError') {
           return res.status(400).json({
               message: "Données invalides",
               details: error.errors.map(err => ({
                   field: err.path,
                   message: err.message
               }))
           });
       }

       // Erreur générique
       res.status(500).json({
           message: "Erreur interne du serveur lors de la création de l'utilisateur."
       });
   }
});


// route de connexion
// La route sera accessible via /auth/login
router.post("/login", async (req, res) => {
	console.log('Route /login atteinte');
	console.log('Corps de la requête reçue:', req.body); // Log la requête reçue
	console.log('Tentative de connexion pour:', req.body.email);
	const { email, password } = req.body;

	try {
		if (!email || !password) {
			console.log('Validation échouée - champs manquants');
			return res.status(400).json({
				message: "Email et mot de passe sont requis.",
			});
		}

		const user = await User.findOne({ where: { email } });
		console.log('Utilisateur trouvé:', user ? 'Oui' : 'Non'); // Log si l'utilisateur est trouvé
		if (!user) {
			return res.status(404).json({ message: "Utilisateur non trouvé." });
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(401).json({ message: "Mot de passe incorrect." });
		}

		const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
			expiresIn: "1h",
		});

		res.status(200).json({
			message: "Connexion réussie",
			token,
			userId: user.id,
			username: user.username,
            email: user.email
		});
	} catch (error) {
		console.error("Erreur lors de la connexion:", error);
		res.status(500).json({
			message: "Erreur interne du serveur lors de la connexion.",
		});
	}
});

export default router;
