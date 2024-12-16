import express from "express";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
// import cors from 'cors'; // Ajout de CORS pour gérer les requêtes cross-origin

// Importer les routes
import authRoutes from "./routes/auth.js";
import synthetiserRoutes from "./routes/synthetisers.js";
import userRoutes from "./routes/users.js";
import roleRoutes from "./routes/roles.js";
import profileRoutes from "./routes/profiles.js";
import postRoutes from "./routes/posts.js";

// Charger les variables d'environnement
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
// app.use(cors()); // Activer CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Pour parser les requêtes URL-encoded

// Secret pour signer les JWT
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    console.error('JWT_SECRET is not set in environment variables');
    process.exit(1);
}

// Middleware pour vérifier le JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ error: "No token provided" });

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = user;
        next();
    });
};

// Routes d'authentification
app.use('/auth', authRoutes);
app.use('/register', authRoutes);
app.use('/login', authRoutes);

// Route à protéger


app.use("/synthetisers", synthetiserRoutes);
app.use("/users", userRoutes);
app.use("/roles", roleRoutes);
app.use("/profiles", profileRoutes);
app.use("/posts", postRoutes);

// Route protégée d'exemple
app.get("/protected", authenticateToken, (req, res) => {
    res.json({ message: "Welcome to the protected route!", user: req.user });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
