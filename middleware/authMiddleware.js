import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET || "default_secret";

// Liste des routes publiques (expressions régulières)
const publicRoutes = [
  /^\/api\/synthetisers$/,
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
];

// Fonction pour vérifier si la route est publique
const isPublicRoute = (path) => {
  return publicRoutes.some((pattern) => pattern.test(path));
};

export const authenticateToken = (req, res, next) => {
  console.log("🔐 Auth Middleware - Path:", req.path);
  console.log("🔐 Auth Middleware - Method:", req.method);

  // Autoriser les routes publiques sans token
  if (isPublicRoute(req.path)) {
    console.log("✅ Public route, skipping authentication");
    return next();
  }

  // Récupérer le token dans Authorization ou cookie
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

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      console.error("❌ Token verification failed:", err.message);
      let errorMessage = "Invalid token";
      if (err.name === "TokenExpiredError") errorMessage = "Token expired";
      if (err.name === "JsonWebTokenError") errorMessage = "Invalid token format";

      return res.status(403).json({
        success: false,
        error: errorMessage,
        expired: err.name === "TokenExpiredError",
      });
    }

    // Ajouter les infos utilisateur à la requête
    req.user = {
      id: decoded.id,
      email: decoded.email,
      isAdmin: decoded.isAdmin ?? false,
      permissions: decoded.permissions || [],
    };

    console.log("✅ User authenticated:", req.user);
    next();
  });
};

export const checkPermissions = (requiredPermissions, mode = "all") => (req, res, next) => {
	if (mode === "all") {
		const hasAll = requiredPermissions.every((perm) =>
			req.user?.permissions?.includes(perm)
		);
			if (!hasAll)
				return res.status(403).json({ error: "All permissions required" });
		} else {
			const hasAny = requiredPermissions.some((perm) =>
				req.user?.permissions?.includes(perm)
			);
			if (!hasAny)
				return res
					.status(403)
					.json({ error: "At least one permission required" });
		}
		next();
	};

  export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Authentication required"
    });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      error: "Administrator access required"
    });
  }

  console.log("✅ Admin access granted to:", req.user.email);
  next();
};

// Middleware pour charger les permissions du rôle
const loadUserPermissions = async (user) => {
	const role = await user.getRole();
	return role.permissions;
};
