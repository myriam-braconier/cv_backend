import bcrypt from "bcrypt";
import dotenv from "dotenv";
import db from "../models/index.js";
import { generateToken } from "../utils/tokenUtils.js";

dotenv.config();
const ADMIN_ROLE_ID = 2;

const authController = {
	// Login
	login: async (req, res) => {
		try {
			const { email, password } = req.body;

			// Récupérer l'utilisateur avec rôle et permissions inclus
			const user = await db.User.findOne({
				where: { email },
				include: [
					{
						model: db.Role,
						as: "role",
						include: [
							{
								model: db.Permission,
								as: "permissions",
								through: db.RolePermission,
							},
						],
					},
				],
			});

			// Vérification utilisateur et mot de passe
			if (!user || !(await bcrypt.compare(password, user.password))) {
				return res
					.status(401)
					.json({ message: "Email ou mot de passe incorrect" });
			}

			// Extraire les permissions de l'utilisateur
			const permissions = user.role?.permissions?.map((p) => p.name) || [];

			// 🎯 Créer explicitement l'objet pour le token avec toutes les données nécessaires
			const tokenPayload = {
				id: user.id,
				email: user.email,
				username: user.username,
				roleId: user.roleId, // 🎯 Explicitement inclus
				isAdmin: user.isAdmin,
				permissions,
			};


				console.log("🔍 Token payload:", tokenPayload); // Pour debug

		// Générer le token JWT avec le payload explicite
		const token = generateToken(tokenPayload);


			// Préparer les données utilisateur à renvoyer
			const userData = {
				id: user.id,
				email: user.email,
				username: user.username,
				roleId: user.roleId,
				isAdmin: user.isAdmin,
				permissions,
			};
			const isProduction = process.env.NODE_ENV === "production";

			// Définir le cookie sécurisé contenant le token
			res.cookie("token", token, {
				httpOnly: true,
				secure: isProduction, // true en prod (HTTPS), false en local (HTTP)
				sameSite: isProduction ? "none" : "lax", // none en prod, lax en local pour fonctionner sans HTTPS
				maxAge: 24 * 60 * 60 * 1000,
				path: "/",
			});

			// Envoyer la réponse
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
				attributes: ["id", "email", "username", "roleId", "isAdmin"],
				include: [
					{
						model: db.Role,
						as: "role",
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
			next(error); // Propagation à middleware d'erreur global
		}
	},

	// Déconnexion
	logout: async (req, res) => {
		try {
			// Configuration CORS (adapter si besoin)
			res.header(
				"Access-Control-Allow-Origin",
				"https://concrete-vibes.up.railway.app"
			);
			res.header("Access-Control-Allow-Credentials", "true");

			// Suppression du cookie
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
			const { username, email, password, has_instrument, roleId } = req.body;

			// Vérification des champs requis
			if (!username || !email || !password) {
				return res.status(400).json({
					success: false,
					message: "Veuillez remplir tous les champs requis",
				});
			}

			// Vérifier le rôle de la personne connectée
			// Supposons que authenticateToken ajoute req.user avec roleId
			const requestingUserRoleId = req.user && req.user.roleId;

			// Seuls les admins peuvent attribuer un rôle admin à un nouvel utilisateur
			if (roleId === ADMIN_ROLE_ID && requestingUserRoleId !== ADMIN_ROLE_ID) {
				return res.status(403).json({
					success: false,
					message:
						"Vous n'êtes pas autorisé à attribuer le rôle administrateur",
				});
			}

			// Création utilisateur avec transaction
			const result = await db.sequelize.transaction(async (t) => {
				const hashedPassword = await bcrypt.hash(password, 10);
				const user = await db.User.create(
					{
						username,
						email,
						password: hashedPassword,
						has_instrument: Boolean(has_instrument),
						roleId,
					},
					{ transaction: t }
				);

				return user;
			});

			// Générer token
			const token = await generateToken(result);

			res.status(201).json({
				success: true,
				message: "Inscription réussie",
				user: {
					id: result.id,
					email: result.email,
					username: result.username,
					roleId: result.roleId,
					has_instrument: result.has_instrument,
				},
				token,
			});
		} catch (error) {
			if (error.name === "SequelizeUniqueConstraintError") {
				return res.status(400).json({
					success: false,
					message: "Cet email est déjà utilisé",
				});
			}

			console.error("Erreur d'inscription:", error);
			res.status(500).json({
				success: false,
				message: "Erreur lors de l'inscription",
				error:
					process.env.NODE_ENV === "development" ? error.message : undefined,
			});
		}
	},
};

export default authController;
