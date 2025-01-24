// controllers/authController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import db from "../models/index.js";
const { sequelize } = db;

// Configuration de dotenv
dotenv.config();

const authController = {
	// Login
	login: async (req, res) => {
		try {
			const { email, password } = req.body;

			// Vérifier si l'utilisateur existe
			const user = await db.User.findOne({ where: { email } });
			if (!user || !(await bcrypt.compare(password, user.password))) {
				return res
					.status(401)
					.json({ message: "Email ou mot de passe incorrect" });
			}

			// Créer le token

			const token = jwt.sign(
				{ id: user.id, email: user.email, roleId: user.roleId },
				process.env.JWT_SECRET,
				{ expiresIn: "24h" }
			);

			// Préparer les données utilisateur à renvoyer
			const userData = {
				id: user.id,
				email: user.email,
				username: user.username,
				roleId: user.roleId,
			};

			// Définir le cookie
			res.cookie("token", token, {
				httpOnly: true,
				secure: true, // Important pour SameSite=None
				sameSite: "none",
				maxAge: 24 * 60 * 60 * 1000, // 24 heures
				path: "/", // S'assurer que le cookie est disponible sur tout le site
			});

			// Renvoyer la réponse
			res.status(200).json({
				message: "Connexion réussie",
				user: userData,
				token,
			});
		} catch (error) {
			console.error("Erreur de connexion:", error);
			res.status(500).json({ message: "Erreur lors de la connexion" });
		}
	},

	// Vérification du token
	verify: async (req, res) => {
		try {
			// Le middleware authenticateToken a déjà vérifié le token
			const user = await db.User.findByPk(req.user.id, {
				attributes: ["id", "email", "username", "roleId"],
				include: [
					{
						model: db.Role,
						as: "role", // ajout de l'alias
						attributes: ["name"],
					},
				],
			});

			if (!user) {
				return res.status(404).json({ message: "Utilisateur non trouvé" });
			}

			res.status(200).json({
				valid: true,
				user,
			});
		} catch (error) {
			console.error("Erreur de vérification:", error);
			res.status(500).json({ message: "Erreur lors de la vérification" });
		}
	},

	// Déconnexion
	logout: async (req, res) => {
		try {
			// Configuration pour les CORS
			res.header(
				"Access-Control-Allow-Origin",
				"https://concrete-frontend.vercel.app"
			);
			res.header("Access-Control-Allow-Credentials", "true");

			// suppression du cookie
			res.cookie("token", "", {
				httpOnly: true,
				secure: true,
				sameSite: "none",
				maxAge: 0,
				path: "/",
			});

			res.status(200).json({ message: "Déconnexion réussie" });
		} catch (error) {
			console.error("Erreur de déconnexion:", error);
			res.status(500).json({ message: "Erreur lors de la déconnexion" });
		}
	},

	// Inscription
	register: async (req, res) => {
		try {
			const { username, email, password, has_instrument } = req.body;
	
			// Vérification des données requises
			if (!username || !email || !password) {
				return res.status(400).json({ 
					success: false,
					message: "Veuillez remplir tous les champs requis" 
				});
			}
	
			// Création de l'utilisateur avec transaction
			const result = await db.sequelize.transaction(async (t) => {
				const user = await db.User.create({
					username,
					email,
					password: await bcrypt.hash(password, 10),
					has_instrument: Boolean(has_instrument)
				}, { 
					transaction: t
				});
	
				return user;
			});
	
			// Création du token
			const token = jwt.sign(
				{
					id: result.id,
					email: result.email,
					roleId: result.roleId
				},
				process.env.JWT_SECRET,
				{ expiresIn: "24h" }
			);
	
			// Réponse
			res.status(201).json({
				success: true,
				message: "Inscription réussie",
				user: {
					id: result.id,
					email: result.email,
					username: result.username,
					roleId: result.roleId,
					has_instrument: result.has_instrument
				},
				token
			});
	
		} catch (error) {
			if (error.name === 'SequelizeUniqueConstraintError') {
				return res.status(400).json({
					success: false,
					message: "Cet email est déjà utilisé"
				});
			}
	
			console.error("Erreur d'inscription:", error);
			res.status(500).json({
				success: false,
				message: "Erreur lors de l'inscription",
				error: process.env.NODE_ENV === 'development' ? error.message : undefined
			});
		}
	}
};

export default authController;
