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

// Middleware pour forcer la non-mise en cache
app.use('/api/auth/login', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Middlewares globaux
app.use(cookieParser());
app.use(express.json());


import authRoutes from './routes/auth.js';
// Routes publiques avant le middleware d'authentification
app.use('/auth', authRoutes); // routes de login/register/logout

// Route de base pour tester
app.get('/', (req, res) => {
  res.json({ message: 'Serveur fonctionne !', port: PORT });
});
// Routes favicon (pour éviter les erreurs 404 liées au favicon)
app.get("/favicon.ico", (req, res) => res.sendStatus(204));
app.get("/favicon.png", (req, res) => res.sendStatus(204));
// Middleware d'authentification global qui protège les routes suivantes
app.use(authenticateToken);

// Gestion des prévol OPTIONS rapidement
app.options('*', (req, res) => res.sendStatus(200));



// Import et déclaration des routes
import synthetiserRoutes from "./routes/synthetisers.js";
import userRoutes from "./routes/users.js";
import profileRoutes from "./routes/profiles.js";
import postRoutes from "./routes/posts.js";
import adminRoutes from "./routes/admin.js";
import auctionRoutes from "./routes/auctions.js";
import roleRoutes from "./routes/roles.js";

app.use("/admin", adminRoutes);
app.use("/api/synthetisers", synthetiserRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/auction-prices", auctionRoutes); // Support legacy route
app.use("/api/roles", roleRoutes); // Support legacy route


// Route public mais protégée
app.get('/api/public/roles', async (req, res) => {
    console.log('🎯 Route /api/public/roles appelée !');

  try {
    console.log('📋 Récupération des rôles publics pour inscription');
    
    // Récupérer tous les rôles depuis votre base de données
    const allRoles = await db.Role.findAll(); 
    
    // Filtrer pour exclure les rôles sensibles (admin, moderator, etc.)
    const publicRoles = allRoles.filter(role => 
      !['admin', 'moderator'].includes(role.name.toLowerCase())
    );
    
    console.log(`✅ ${publicRoles.length} rôles publics retournés`);
    res.json(publicRoles);
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des rôles publics:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des rôles disponibles' 
    });
  }
});

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


// À ajouter dans votre app.js pour diagnostiquer les associations
app.get('/api/debug/associations', async (req, res) => {
  console.log('🔍 === DIAGNOSTIC ASSOCIATIONS ===');
  
  try {
    // 1. Vérifier les associations disponibles
    console.log('📋 Associations Role:', Object.keys(db.Role.associations || {}));
    console.log('📋 Associations Permission:', Object.keys(db.Permission.associations || {}));
    console.log('📋 Associations User:', Object.keys(db.User.associations || {}));
    
    // 2. Tester différents alias pour Role → Permission
    const testRole = await db.Role.findOne({ where: { name: 'owner_instr' } });
    
    if (!testRole) {
      return res.json({
        error: 'Rôle owner_instr non trouvé',
        availableRoles: await db.Role.findAll({ attributes: ['id', 'name'] })
      });
    }
    
    console.log('👑 Rôle testé:', testRole.name, 'ID:', testRole.id);
    
    const tests = [];
    
    // Test 1: alias 'permissions'
    try {
      const test1 = await db.Role.findByPk(testRole.id, {
        include: [{ 
          model: db.Permission, 
          as: 'permissions',
          through: { attributes: [] }
        }]
      });
      tests.push({
        alias: 'permissions',
        success: true,
        count: test1.permissions?.length || 0,
        data: test1.permissions?.slice(0, 2) // Premiers résultats
      });
      console.log('✅ Test permissions:', test1.permissions?.length || 0);
    } catch (err) {
      tests.push({
        alias: 'permissions',
        success: false,
        error: err.message
      });
      console.log('❌ Erreur permissions:', err.message);
    }
    
    // Test 2: alias 'permission' (singulier)
    try {
      const test2 = await db.Role.findByPk(testRole.id, {
        include: [{ 
          model: db.Permission, 
          as: 'permission',
          through: { attributes: [] }
        }]
      });
      tests.push({
        alias: 'permission',
        success: true,
        count: test2.permission?.length || 0,
        data: test2.permission?.slice(0, 2)
      });
      console.log('✅ Test permission:', test2.permission?.length || 0);
    } catch (err) {
      tests.push({
        alias: 'permission',
        success: false,
        error: err.message
      });
      console.log('❌ Erreur permission:', err.message);
    }
    
    // Test 3: sans alias
    try {
      const test3 = await db.Role.findByPk(testRole.id, {
        include: [{ 
          model: db.Permission,
          through: { attributes: [] }
        }]
      });
      tests.push({
        alias: 'no-alias',
        success: true,
        count: test3.Permissions?.length || 0,
        data: test3.Permissions?.slice(0, 2)
      });
      console.log('✅ Test no-alias:', test3.Permissions?.length || 0);
    } catch (err) {
      tests.push({
        alias: 'no-alias',
        success: false,
        error: err.message
      });
      console.log('❌ Erreur no-alias:', err.message);
    }
    
    // 4. Vérifier directement la table de liaison
    let rolePermissionCount = 0;
    try {
      rolePermissionCount = await db.RolePermission.count({
        where: { roleId: testRole.id }
      });
      console.log('🔗 Liaisons RolePermission:', rolePermissionCount);
    } catch (err) {
      console.log('❌ Erreur RolePermission:', err.message);
    }
    
    // 5. Requête SQL brute pour vérifier
    let rawPermissions = [];
    try {
      const [results] = await db.sequelize.query(`
        SELECT p.id, p.name, p.description 
        FROM permissions p 
        JOIN rolepermissions rp ON p.id = rp.permissionId 
        WHERE rp.roleId = ?
      `, {
        replacements: [testRole.id],
        type: db.sequelize.QueryTypes.SELECT
      });
      rawPermissions = results || [];
      console.log('🗄️ Permissions via SQL brut:', rawPermissions.length);
    } catch (err) {
      console.log('❌ Erreur SQL brut:', err.message);
    }
    
    res.json({
      success: true,
      role: {
        id: testRole.id,
        name: testRole.name
      },
      associations: {
        Role: Object.keys(db.Role.associations || {}),
        Permission: Object.keys(db.Permission.associations || {}),
        User: Object.keys(db.User.associations || {})
      },
      tests: tests,
      rolePermissionCount: rolePermissionCount,
      rawPermissions: rawPermissions,
      recommendation: tests.find(t => t.success && t.count > 0)?.alias || 'Problème d\'association'
    });
    
  } catch (error) {
    console.error('❌ Erreur diagnostic:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});


// À ajouter TEMPORAIREMENT dans votre app.js pour identifier le problème
app.get('/api/debug/test-auth', (req, res) => {
  console.log('🐛 === DEBUG TEST AUTH ===');
  console.log('req.user:', req.user);
  console.log('req.user exists:', !!req.user);
  console.log('user permissions:', req.user?.permissions);
  
  res.json({
    success: true,
    message: 'Auth test OK',
    user: {
      id: req.user?.id,
      email: req.user?.email,
      permissions: req.user?.permissions
    }
  });
});

// pour identifier problème accès aux permissions
app.get('/api/test-simple', (req, res) => {
  res.json({
    success: true,
    message: 'Route simple OK',
    user: req.user?.email
  });
});
// Route de test directe pour permissions
app.get('/api/debug/permissions-direct', async (req, res) => {
  console.log('🐛 === DEBUG PERMISSIONS DIRECT ===');
  console.log('req.user au début:', req.user);
  
  try {
    if (!req.user) {
      console.log('❌ req.user est undefined dans la route permissions');
      return res.status(401).json({ 
        success: false,
        message: 'req.user non défini',
        debug: 'Middleware auth pas exécuté ou échoué'
      });
    }

    console.log('✅ req.user existe:', req.user.id);
    
    const userId = req.user.id;
    
    const user = await db.User.findByPk(userId, {
      include: [
        {
          model: db.Role,
          as: 'role',
          include: [
            {
              model: db.Permission,
              as: 'permissions',
              through: { attributes: [] }
            }
          ]
        }
      ]
    });

    console.log('👤 Utilisateur trouvé:', user ? 'Oui' : 'Non');
    console.log('👑 Rôle:', user?.role?.name);
    console.log('🔑 Permissions count:', user?.role?.permissions?.length || 0);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Utilisateur non trouvé en base' 
      });
    }

    const permissions = user.role?.permissions?.map(permission => ({
      id: permission.id,
      name: permission.name,
      description: permission.description
    })) || [];
    
    console.log('✅ Permissions formatées:', permissions.map(p => p.name));
    
    res.json({
      success: true,
      permissions: permissions,
      role: user.role?.name,
      debug: {
        userId: userId,
        roleId: user.roleId,
        permissionsCount: permissions.length,
        middlewarePermissions: req.user.permissions
      }
    });

  } catch (error) {
    console.error('❌ Erreur dans debug permissions:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: error.message 
    });
  }
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
  // Sur Railway, log seulement les vraies erreurs serveur (500+)
  // et en dev local
  if (process.env.RAILWAY_ENVIRONMENT !== 'production' || 
      (err.status && err.status >= 500)) {
    console.error("❌ Error:", err.message, "Route:", req.path);
  }
  
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    error: statusCode >= 500 ? "Internal server error" : err.message,
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
