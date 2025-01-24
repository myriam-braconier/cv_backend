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

// middleware/authMiddleware.js
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

// const checkPricePermission = async (req, res, next) => {
//     try {
//         const user = req.user;
//         const role = await user.getRole();

//         if (role.role_name === 'admin' || role.role_name === 'owner_instr') {
//             next();
//         } else {
//             res.status(403).json({
//                 message: "Seuls les administrateurs et les propriétaires d'instruments peuvent modifier les prix"
//             });
//         }
//     } catch (error) {
//         res.status(500).json({ message: "Erreur lors de la vérification des permissions" });
//     }
// };

// Exporter le secret
export const secret = process.env.JWT_SECRET;
