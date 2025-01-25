import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Initialiser dotenv pour charger les variables d'environnement
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

// Liste des routes publiques
const publicRoutes = [
	"/api/synthetisers",
	"/api/synthetisers/:id",
	"/api/synthetisers/:id/auctions/latest",
	"/api/synthetisers/:id/auctions",
	"/api/auctions",
	"/api/auctions/:id",
	"/api/users",
	"/api/users/with-posts",
];


export const checkPermissions = (requiredPermissions, mode = 'all') => (req, res, next) => {
	if (mode === 'all') {
	  const hasAll = requiredPermissions.every(perm => req.user?.permissions?.includes(perm));
	  if (!hasAll) return res.status(403).json({ error: "All permissions required" });
	} else {
	  const hasAny = requiredPermissions.some(perm => req.user?.permissions?.includes(perm));
	  if (!hasAny) return res.status(403).json({ error: "At least one permission required" });
	}
	next();
  };

// Middleware pour charger les permissions du rôle
const loadUserPermissions = async (user) => {
	const role = await user.getRole();
	return role.permissions;
   };
   
   // Génération du token avec permissions
   export const generateToken = async (user) => {
	const defaultPermissions = ['synths:read']; // Permission par défaut
	const userRole = await db.Role.findByPk(user.roleId);
	const rolePermissions = userRole?.permissions || [];
	
	return jwt.sign({
	  id: user.id,
	  email: user.email,
	  roleId: user.roleId,
	  permissions: [...defaultPermissions, ...rolePermissions]
	}, process.env.JWT_SECRET, { expiresIn: "24h" });
  };
   

export const authenticateToken = (req, res, next) => {
	console.log("Path:", req.path);
	console.log("Headers:", req.headers);

	let token = null;
	const authHeader = req.headers["authorization"];

	if (authHeader) {
		token = authHeader.split(" ")[1];
		console.log("Token from header:", token);
	} else if (req.cookies && req.cookies.token) {
		token = req.cookies.token;
		console.log("Token from cookies:", token);
	}

	if (!token) {
		console.log("No token found");
		// Si c'est une route publique, on continue
		if (publicRoutes.includes(req.path)) {
			return next();
		}
		return res.status(401).json({ error: "No token provided" });
	}

	jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
		if (err) {
			console.error("Token verification error:", err);
			return res.status(403).json({ error: "Invalid token" });
		}
		console.log("Decoded user:", JSON.stringify(user, null, 2)); // Log détaillé
		req.user = user;
		next();
	});
};


// Exporter le secret
export const secret = process.env.JWT_SECRET;
