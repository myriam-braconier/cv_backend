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
	// controllers/authController.js
	register: async (req, res) => {
		try {
			const { username, email, password, has_instrument, roleId, role_id } =
				req.body;

			// Log des données reçues pour debug
			console.log("Données reçues du frontend:", {
				username,
				email,
				has_instrument,
				roleId,
				role_id,
			});

			// Conversion explicite des valeurs
			const isOwner = Boolean(has_instrument);
			// Utiliser le roleId envoyé ou le calculer en fonction de has_instrument
			const finalRoleId = roleId || role_id || (isOwner ? 5 : 1);

			console.log("Valeurs calculées:", {
				isOwner,
				finalRoleId,
			});

			// Vérifier si l'utilisateur existe déjà
			const existingUser = await db.User.findOne({ where: { email } });
			if (existingUser) {
				return res.status(400).json({ message: "Cet email est déjà utilisé" });
			}

			// Hasher le mot de passe
			const hashedPassword = await bcrypt.hash(password, 10);

			// Log avant création
			console.log("Données avant création:", {
				username,
				email,
				has_instrument: isOwner,
				roleId,
			});

			// Créer l'utilisateur avec le mot de passe hashé
			const user = await db.User.create({
				username,
				email,
				password: hashedPassword,
				has_instrument: isOwner,
				roleId: finalRoleId, // Utiliser le roleId calculé
			});

			// Log après création
			console.log("Utilisateur créé:", {
				id: user.id,
				email: user.email,
				has_instrument: user.has_instrument,
				roleId: user.roleId,
			});

			// Vérifier que l'utilisateur a bien été créé avec le bon rôle
			const verifiedUser = await db.User.findByPk(user.id);
			console.log("Vérification après création:", {
				id: verifiedUser.id,
				roleId: verifiedUser.roleId,
			});

			// Créer le token avec le bon roleId
			const token = jwt.sign(
				{
					id: verifiedUser.id,
					email: verifiedUser.email,
					roleId: verifiedUser.roleId, // Utiliser le roleId de l'utilisateur vérifié
				},
				process.env.JWT_SECRET,
				{ expiresIn: "24h" }
			);

			res.status(201).json({
				message: "Inscription réussie",
				user: {
					id: verifiedUser.id,
					email: verifiedUser.email,
					username: verifiedUser.username,
					roleId: verifiedUser.roleId, // S'assurer que c'est le bon roleId
				},
				token,
			});
		} catch (error) {
			console.error("Erreur détaillée d'inscription:", error);
			res.status(500).json({
				message: "Erreur lors de l'inscription",
				error: error.message,
			});
		}
	},
};

export default authController;
