import express from 'express';
import db from '../models/index.js'
import { 
  getAllUsers, 
  createUser, 
  getUsersWithPosts, 
  getUserPermissions 
} from '../controllers/userController.js';
import { 
  authenticateToken, 
 
  checkPermissions 
} from '../middleware/authMiddleware.js';

const router = express.Router();

// ==========================================
// ROUTES PUBLIQUES
// ==========================================

// Route publique - définie dans votre middleware comme publique
router.get('/with-posts', getUsersWithPosts);

// ==========================================
// ROUTES AVEC PERMISSIONS SPÉCIFIQUES
// ==========================================

// Route nécessitant la permission "read_users" OU être admin
router.get('/', 
  authenticateToken, 
  (req, res, next) => {
    // Si admin, passer directement
    if (req.user.isAdmin) {
      return next();
    }
    // Sinon, vérifier les permissions
    return checkPermissions(['read_users'], 'any')(req, res, next);
  },
  getAllUsers
);


// Route nécessitant la permission "create_users" OU être admin
router.post('/', 
  authenticateToken, 
  (req, res, next) => {
    if (req.user.isAdmin) {
      return next();
    }
    return checkPermissions(['create_users'], 'any')(req, res, next);
  },
  createUser
);

// Route pour que l'utilisateur puisse voir SES propres permissions
router.get('/permissions',
  authenticateToken, // sécurisation de la route
  async (req, res) => {
    try {
      console.log('🔍 Récupération permissions pour utilisateur:', req.user.id);
      
      // L'utilisateur peut toujours voir ses propres permissions
      const userId = req.user.id;
      
      // Récupérer l'utilisateur avec ses permissions via Sequelize
      const user = await db.User.findByPk(userId, {
        include: [
          {
            model: db.Role,
            as: 'role', // Ajustez selon votre association
            include: [
              {
                model: db.Permission,
                as: 'permissions', // Ajustez selon votre association
                through: { attributes: [] } // Exclut les attributs de la table de liaison
              }
            ]
          }
        ]
      });

      console.log('👤 Utilisateur trouvé:', user ? 'Oui' : 'Non');
      console.log('👑 Rôle de l\'utilisateur:', user?.role?.name);
      console.log('🔑 Permissions brutes:', user?.role?.permissions);

      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: 'Utilisateur non trouvé' 
        });
      }

      // Extraire les permissions
      const permissions = user.role?.permissions || [];
      
      console.log('✅ Permissions formatées:', permissions);
      
      // Format attendu par le frontend
      res.json({
        success: true,
        permissions: permissions, // Tableau d'objets { id, name, description }
        role: user.role?.name,
        debug: {
          userId: userId,
          roleId: user.roleId,
          permissionsCount: permissions.length
        }
      });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des permissions:', error);
      res.status(500).json({ 
        success: false,
        message: 'Erreur interne du serveur',
        error: error.message 
      });
    }
  }
);

export default router;