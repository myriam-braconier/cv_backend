import express from 'express';
import { 
  getAllUsers, 
  createUser, 
  getUsersWithPosts, 
  getUserPermissions 
} from '../controllers/userController.js';
import { 
  authenticateToken, 
  requireAdmin, 
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

// Route nécessitant la permission "manage_permissions" ET être admin
router.get('/permissions', 
  authenticateToken, 
  requireAdmin,
  checkPermissions(['manage_permissions'], 'all'),
  getUserPermissions
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
router.get('/my-permissions', 
  authenticateToken, 
  async (req, res) => {
    try {
      // L'utilisateur peut toujours voir ses propres permissions
      const userId = req.user.id;
      
      // Récupérer les permissions de l'utilisateur connecté
      // (adaptez cette logique selon votre modèle de données)
      const userPermissions = await getUserPermissionsByUserId(userId);
      
      res.json({
        permissions: userPermissions
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des permissions:', error);
      res.status(500).json({ message: 'Erreur interne du serveur' });
    }
  }
);

export default router;