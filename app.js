import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cors from "cors";
// Configuration
dotenv.config();


const app = express();

// a mettre avant les routes :
// Configuration CORS
app.use(
	cors({
		origin: "http://localhost:3000", // L'URL de votre frontend Next.js
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
	})
);


// Middleware global

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware d'authentification
export const authenticateToken = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];
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

// Middleware de logging
app.use((req, res, next) => {
	console.log("Requête reçue :", {
		method: req.method,
		url: req.url,
		body: req.body,
	});
	next();
});

// Importer les routes
import authRoutes from "./routes/auth.js";
import synthetiserRoutes from "./routes/synthetisers.js";
import userRoutes from "./routes/users.js";
import roleRoutes from "./routes/roles.js";
import profileRoutes from "./routes/profiles.js";
import postRoutes from "./routes/posts.js";
import adminRoutes from "./routes/admin.js";
import auctionRoutes from "./routes/auctions.js"

const jwtSecret = process.env.JWT_SECRET;

// Vérifier la présence de JWT_SECRET
if (!jwtSecret) {
	console.error("JWT_SECRET is not set in environment variables");
	process.exit(1);
}

// Configurer les headers
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Credentials", "true");
	res.header("Access-Control-Allow-Origin", "http://localhost:3000");
	res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
	);
	next();
});

// Routes - Déplacées avant le middleware 404
app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use("/api/synthetisers", synthetiserRoutes);
app.use("/api/users", userRoutes); // Ajout du préfixe /api
app.use("/api/roles", roleRoutes); // Ajout du préfixe /api
app.use("/api/profiles", profileRoutes); // Ajout du préfixe /api
app.use("/api/posts", postRoutes); // Ajout du préfixe /api
app.use('/api/auctions', auctionRoutes);

// Route protégée d'exemple
app.get("/protected", authenticateToken, (req, res) => {
	res.json({
		message: "Welcome to the protected route!",
		user: req.user,
	});
});

// Middleware 404 - Déplacé APRÈS toutes les routes
app.use((req, res) => {
	console.log(`Route non trouvée: ${req.method} ${req.url}`);
	res.status(404).json({ message: "Route non trouvée" });
});

// Gestion des erreurs - Gardé en dernier
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ error: "Something went wrong!" });
});

// Démarrer le serveur
// Démarrage du serveur
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

export default app;
