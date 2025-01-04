import express from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import { models } from "./models/index.js";

console.log("=================================");
console.log(`🚀 Environment: ${process.env.NODE_ENV}`);
console.log(`📦 Database: ${process.env.DB_HOST}`);
console.log("=================================");

// Configuration
dotenv.config();
const app = express();
// rendre les models disponibles dans l'app
const aboutRouter = require("./routes/about");

app.set("models", models);

const jwtSecret = process.env.JWT_SECRET;

// Vérifier la présence de JWT_SECRET
if (!jwtSecret) {
	console.error("JWT_SECRET is not set in environment variables");
	process.exit(1);
}

// Configuration CORS unifiée
const allowedOrigins = [
	"https://concrete-frontend.vercel.app",
	"http://localhost:4000",
	"http://localhost:3000",
];

app.use(
	cors({
		origin: "https://concrete-frontend.vercel.app" || "http://localhost:3000",
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
	})
);

// Middlewares de base
app.use(cookieParser());
app.use(express.json());

// Configuration des headers pour les cookies
app.use((req, res, next) => {
	// Vérifier si l'origine est dans la liste des origines autorisées
	const origin = req.headers.origin;
	if (allowedOrigins.includes(origin)) {
		res.header("Access-Control-Allow-Origin", origin);
	}

	// Gérer les requêtes OPTIONS préliminaires
	if (req.method === "OPTIONS") {
		return res.status(200).end();
	}
	next();
});

// Middleware d'authentification
export const authenticateToken = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	// Si pas de token dans le header, vérifier dans les cookies
	if (!token && req.cookies) {
		token = req.cookies.token;
	}

	if (!token) {
		return res.status(401).json({ error: "No token provided" });
	}

	jwt.verify(token, jwtSecret, (err, user) => {
		if (err) {
			return res.status(403).json({ error: "Invalid token" });
		}
		req.user = user;
		next();
	});
};

// Handler pour favicon
app.get("/favicon.ico", (req, res) => res.status(204).send());
app.get("/favicon.png", (req, res) => res.status(204).send());

// Importer et utiliser les routes
import aboutRouter from './routes/about.js';
import authRoutes from "./routes/auth.js";
import synthetiserRoutes from "./routes/synthetisers.js";
import userRoutes from "./routes/users.js";
import roleRoutes from "./routes/roles.js";
import profileRoutes from "./routes/profiles.js";
import postRoutes from "./routes/posts.js";
import adminRoutes from "./routes/admin.js";
import auctionRoutes from "./routes/auctions.js";

// Routes
app.use('/', aboutRouter);
app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use("/api/synthetisers", synthetiserRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/auctions", auctionRoutes);

// Route protégée d'exemple
app.get("/protected", authenticateToken, (req, res) => {
	res.json({
		message: "Welcome to the protected route!",
		user: req.user,
	});
});

// Middleware 404
app.use((req, res) => {
	console.log(`Route non trouvée: ${req.method} ${req.url}`);
	res.status(404).json({ message: "Route non trouvée" });
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ error: "Something went wrong!" });
});

// Démarrage du serveur
const PORT = process.env.NODE_ENV === "development" ? 4000 : 3306;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
// pour gérer la fermeture globale au shutdown
process.on("SIGINT", async () => {
	try {
		await sequelize.close();
		console.log("Connexions DB fermées");
		process.exit(0);
	} catch (error) {
		console.error("Erreur fermeture DB:", error);
		process.exit(1);
	}
});

export default app;
