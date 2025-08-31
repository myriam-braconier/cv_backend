import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import db from "./models/index.js";
import sequelize from "./utils/sequelize.js";
import { authenticateToken } from './middleware/authMiddleware.js';
import dotenv from 'dotenv';

dotenv.config();

console.log("=================================");
console.log(`🚀 Environment: ${process.env.NODE_ENV}`);
console.log(`📦 Database: ${process.env.DB_HOST}`);
console.log("=================================");

const app = express();

app.set("models", db);

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  console.error("JWT_SECRET is not set in environment variables");
  process.exit(1);
}

// Configuration des origines autorisées pour CORS
const allowedOrigins = [
  "https://concrete-vibes.up.railway.app",
  "http://localhost:4000",
  "http://localhost:3000",
];

// Middleware pour forcer la non-mise en cache
app.use('/api/auth/login', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});


// Middleware CORS
app.use(cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origine (ex: Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error("CORS policy: Origin not allowed"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Middlewares globaux
app.use(cookieParser());
app.use(express.json());


import authRoutes from './routes/auth.js';
// Routes publiques avant le middleware d'authentification
app.use('/auth', authRoutes); // routes de login/register/logout

// Middleware d'authentification global qui protège les routes suivantes
app.use(authenticateToken);

// Gestion des prévol OPTIONS rapidement
app.options('*', (req, res) => res.sendStatus(200));

// Routes favicon (pour éviter les erreurs 404 liées au favicon)
app.get("/favicon.ico", (req, res) => res.sendStatus(204));
app.get("/favicon.png", (req, res) => res.sendStatus(204));

// Import et déclaration des routes
import synthetiserRoutes from "./routes/synthetisers.js";
import userRoutes from "./routes/users.js";
import profileRoutes from "./routes/profiles.js";
import postRoutes from "./routes/posts.js";
import adminRoutes from "./routes/admin.js";
import auctionRoutes from "./routes/auctions.js";

app.use("/admin", adminRoutes);
app.use("/api/synthetisers", synthetiserRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/auctions", auctionRoutes);

// Route protégée exemple
app.get("/protected", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentification requise" });
  }
  res.json({
    message: "Welcome to the protected route!",
    user: req.user,
  });
});

// Health check (publique)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date(),
    authenticated: !!req.user,
  });
});

// Route 'me' (auth required)
app.get('/api/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Not authenticated",
    });
  }
  res.json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      isAdmin: req.user.isAdmin,
      permissions: req.user.permissions || []
    }
  });
});

// Log des routes chargées (debug)
app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`${Object.keys(r.route.methods).join(', ').toUpperCase()} ${r.route.path}`);
  }
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.path,
  });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error("❌ Global error handler:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// Démarrage serveur
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔐 JWT_SECRET configured: ${!!jwtSecret}`);
  console.log(`🌐 CORS Allowed Origins: ${allowedOrigins.join(', ')}`);
});

const NODE_ENV = process.env.NODE_ENV || "development";
console.log(`🚀 Environment: ${NODE_ENV}`);

console.log("=================================");
console.log(`📦 Database: ${process.env.DB_HOST}`);
console.log("=================================");

// Gestion de la fermeture propre au SIGINT
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
