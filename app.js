import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import db from "./models/index.js";
import sequelize from "./utils/sequelize.js";


console.log("=================================");
console.log(`🚀 Environment: ${process.env.NODE_ENV}`);
console.log(`📦 Database: ${process.env.DB_HOST}`);
console.log("=================================");

const app = express();
// rendre les models disponibles dans l'app

app.set("models", db);

const jwtSecret = process.env.JWT_SECRET;

// Vérifier la présence de JWT_SECRET
if (!jwtSecret) {
	console.error("JWT_SECRET is not set in environment variables");
	process.exit(1);
}

// Configuration CORS unifiée
const allowedOrigins = [
	"https://concrete-vibes.up.railway.app/",
	"http://localhost:4000",
	"http://localhost:3000",
];

// Middlewares de base
app.use(cookieParser());
app.use(express.json());
app.use(
	cors({
		origin: "https://concrete-vibes.up.railway.app/" || "http://localhost:3000",
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
	})
);
// app.use(cors({
//     origin: origin => {
//         if (!origin || allowedOrigins.includes(origin)) return origin;
//         return false;
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"]
// }));

// Headers CORS
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

// app.use(authenticateToken); // quand on veut Appliquer le middleware à toutes les routes

// Handler pour favicon
app.get("/favicon.ico", (req, res) => res.status(204).send());
app.get("/favicon.png", (req, res) => res.status(204).send());

// Importer et utiliser les routes
import authRoutes from "./routes/auth.js";
import synthetiserRoutes from "./routes/synthetisers.js";
import userRoutes from "./routes/users.js";
import roleRoutes from "./routes/roles.js";
import profileRoutes from "./routes/profiles.js";
import postRoutes from "./routes/posts.js";
import adminRoutes from "./routes/admin.js";
import auctionRoutes from "./routes/auctions.js";
import { authenticateToken } from "./middleware/authMiddleware.js";

// Routes publiques qui ne nécessitent pas d'authentification
app.use("/auth", authRoutes);
app.use("/api/roles", roleRoutes);

// Routes protégées
app.use("/admin", adminRoutes);
app.use("/api/synthetisers", synthetiserRoutes);
app.use("/api/users", userRoutes);
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

// Pour debug
app._router.stack.forEach(function (r) {
	if (r.route && r.route.path) {
		console.log(r.route.path, r.route.methods);
	}
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
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

const NODE_ENV = process.env.NODE_ENV || "development";

console.log(`🚀 Environment: ${NODE_ENV}`);
console.log("=================================");
console.log(`🚀 Environment: ${process.env.NODE_ENV}`);
console.log(`📦 Database: ${process.env.DB_HOST}`);
console.log("=================================");

// Debug pour voir ce qui est chargé
console.log(
	"Modèles disponibles:",
	Object.keys(db).filter((key) => key !== "sequelize" && key !== "Sequelize")
);

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
