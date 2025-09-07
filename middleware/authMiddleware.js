import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import db from "../models/index.js";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET || "default_secret";

// Liste des routes publiques (expressions régulières)
const publicRoutes = [
	/^\/api\/synthetisers\/[^\/]+$/,
	/^\/api\/synthetisers\/[^\/]+\/auctions\/latest$/,
	/^\/api\/synthetisers\/[^\/]+\/auctions$/,
	/^\/api\/auctions$/,
	/^\/api\/auctions\/[^\/]+$/,
	/^\/api\/users\/with-posts$/,
	/^\/api\/posts$/,
	/^\/api\/posts\/[^\/]+$/,
	/^\/api\/users\/login$/,
	/^\/api\/users\/register$/,
	/^\/api\/public\/roles$/,
];

// Fonction pour vérifier si une route est publique
function isPublicRoute(path) {
	console.log("🧪 Testing path:", path);

	// Vérifier d'abord les routes simples
	const publicPaths = [
		"/auth/login",
		"/auth/register",
		"/auth/logout",
		"/api/health",
		"/favicon.ico",
		"/api/public/roles",
	];
	if (publicPaths.includes(path)) {
		console.log("✅ Match dans publicPaths");
		return true;
	}

	// Ensuite vérifier les expressions régulières
	const regexMatch = publicRoutes.some((regex) => {
		const match = regex.test(path);
		if (match) console.log("✅ Match regex:", regex);
		return match;
	});
	return regexMatch;
}

export const authenticateToken = async (req, res, next) => {
	console.log("🔐 Auth Middleware - Path:", req.path);
	console.log("🔐 Auth Middleware - Method:", req.method);
	console.log("🔍 URL complète:", req.url);
	console.log("🔍 Test isPublicRoute:", isPublicRoute(req.path));

	// ⚠️ Vérifier si c'est une route publique
	if (isPublicRoute(req.path)) {
		console.log("✅ Public route, skipping authentication");
		return next();
	}

	// Récupérer le token dans Authorization header ou cookie
	let token = null;
	const authHeader = req.headers["authorization"];

	if (authHeader && authHeader.startsWith("Bearer ")) {
		token = authHeader.substring(7);
		console.log("📋 Token found in Authorization header");
	} else if (req.cookies && req.cookies.token) {
		token = req.cookies.token;
		console.log("🍪 Token found in cookies");
	}

	if (!token) {
		console.log("❌ Token missing for protected route");
		return res.status(401).json({
			success: false,
			error: "Access token required",
			path: req.path,
		});
	}

	if (!jwtSecret) {
		console.error("❌ JWT_SECRET not configured");
		return res.status(500).json({
			success: false,
			error: "Server configuration error",
		});
	}

	try {
		// Vérifier le token
		const decoded = jwt.verify(token, jwtSecret);
		console.log("🎫 Token décodé pour utilisateur ID:", decoded.id);
		
		// Récupérer l'utilisateur complet avec ses permissions depuis la DB
		const user = await db.User.findByPk(decoded.id, {
			include: [
				{
					model: db.Role,
					as: 'role', // Garde votre association existante
					include: [
						{
							model: db.Permission,
							as: 'permissions', // Garde votre association existante
							through: { attributes: [] } // Exclut les attributs de la table de liaison
						}
					]
				}
			]
		});

		if (!user) {
			console.error("❌ User not found in database:", decoded.id);
			return res.status(401).json({
				success: false,
				error: "User not found",
			});
		}

		console.log("👤 Utilisateur trouvé:", {
			id: user.id,
			email: user.email,
			role: user.role?.name || 'Aucun rôle'
		});

		// Extraire les permissions du rôle avec gestion des erreurs
		let permissions = [];
		try {
				// Adaptez selon l'alias de votre modèle Role
			const rolePermissions = user.role?.permissions || user.role?.permission;
			if (rolePermissions && Array.isArray(rolePermissions)) {
				permissions = rolePermissions.map(p => p.name);
				console.log("🔑 Permissions extraites du rôle:", permissions);
			} else {
				console.log("⚠️ Aucune permission trouvée pour ce rôle");
				console.log("🔍 Structure du rôle:", {
					role: user.role?.name,
					permissions: user.role?.permissions,
					permission: user.role?.permission
				});
				permissions = [];
			}
		} catch (permError) {
			console.error("❌ Erreur lors de l'extraction des permissions:", permError);
			permissions = [];
		}
		
		// Ajouter les infos utilisateur à la requête
		req.user = {
			id: user.id,
			email: user.email,
			username: user.username,
			isAdmin: user.isAdmin ?? false,
			roleId: user.roleId,
			role: user.role, // Ajouter l'objet role complet
			permissions: permissions, // Maintenant récupéré depuis la DB
		};

		console.log("✅ User authenticated:", {
			id: req.user.id,
			email: req.user.email,
			isAdmin: req.user.isAdmin,
			permissionsCount: req.user.permissions.length
		});
		console.log("🔑 User permissions:", permissions);
		
		next();

	} catch (err) {
		console.error("❌ Authentication error:", err.message);
		console.error("❌ Error details:", {
			name: err.name,
			message: err.message,
			stack: err.stack?.split('\n')[0] // Première ligne de la stack pour debug
		});
		
		let errorMessage = "Invalid token";
		let statusCode = 403;
		
		if (err.name === "TokenExpiredError") {
			errorMessage = "Token expired";
			statusCode = 401;
		}
		if (err.name === "JsonWebTokenError") {
			errorMessage = "Invalid token format";
			statusCode = 401;
		}
		if (err.name === "SequelizeError" || err.name === "SequelizeDatabaseError") {
			errorMessage = "Database error during authentication";
			statusCode = 500;
			console.error("🗄️ Erreur Sequelize détaillée:", err);
		}

		return res.status(statusCode).json({
			success: false,
			error: errorMessage,
			expired: err.name === "TokenExpiredError",
		});
	}
};

export const checkPermissions =
	(requiredPermissions, mode = "all") =>
	(req, res, next) => {
		console.log("🔍 Vérification des permissions:", {
			required: requiredPermissions,
			userPermissions: req.user?.permissions || [],
			mode: mode
		});

		if (!req.user) {
			console.log("❌ Aucun utilisateur authentifié");
			return res.status(401).json({ 
				success: false,
				error: "Authentication required" 
			});
		}

		if (!req.user.permissions || !Array.isArray(req.user.permissions)) {
			console.log("❌ Permissions utilisateur non définies ou invalides");
			return res.status(403).json({ 
				success: false,
				error: "User permissions not loaded" 
			});
		}

		if (mode === "all") {
			const hasAll = requiredPermissions.every((perm) =>
				req.user.permissions.includes(perm)
			);
			if (!hasAll) {
				console.log("❌ Permissions insuffisantes - toutes requises");
				return res.status(403).json({ 
					success: false,
					error: "All permissions required",
					required: requiredPermissions,
					user: req.user.permissions
				});
			}
		} else {
			const hasAny = requiredPermissions.some((perm) =>
				req.user.permissions.includes(perm)
			);
			if (!hasAny) {
				console.log("❌ Permissions insuffisantes - au moins une requise");
				return res.status(403).json({ 
					success: false,
					error: "At least one permission required",
					required: requiredPermissions,
					user: req.user.permissions
				});
			}
		}
		
		console.log("✅ Permissions validées");
		next();
	};

export const requireAdmin = (req, res, next) => {
	if (!req.user) {
		return res.status(401).json({
			success: false,
			error: "Authentication required",
		});
	}

	if (!req.user.isAdmin) {
		console.log("❌ Accès admin refusé pour:", req.user.email);
		return res.status(403).json({
			success: false,
			error: "Administrator access required",
		});
	}

	console.log("✅ Admin access granted to:", req.user.email);
	next();
};

// Middleware pour charger les permissions du rôle
const loadUserPermissions = async (user) => {
	try {
		const role = await user.getRole();
		return role ? role.permissions || [] : [];
	} catch (error) {
		console.error("❌ Erreur lors du chargement des permissions:", error);
		return [];
	}
};