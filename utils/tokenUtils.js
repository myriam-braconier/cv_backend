import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

export const generateToken = (user) => {
	// Extraire les permissions au format tableau simple (ex: ["read", "write"])
	const permissions = user.permissions || [];
	// Préparer la charge utile (payload) du token
	const payload = {
		id: user.id,
		email: user.email,
		isAdmin: user.isAdmin ?? false, // booléen isAdmin
		permissions: user.permissions || [], // tableau de permissions
	};

	// Générer et signer le token JWT avec un temps d'expiration
	return jwt.sign(payload, JWT_SECRET, {
		expiresIn: "24h", // expiration du token
	});
};
