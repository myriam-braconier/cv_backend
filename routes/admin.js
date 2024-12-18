// routes/admin.js
import express from 'express';
import { isAdmin } from '../middleware/isAdmin.js';
import db from '../models/index.js';

const router = express.Router();

router.post('/make-admin/:userId', isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const adminUser = req.user;

    await db.sequelize.transaction(async (t) => {
      // Vérifier si l'utilisateur cible existe
      const targetUser = await db.User.findByPk(userId);
      if (!targetUser) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      // Trouver le rôle admin
      const adminRole = await db.Role.findOne({
        where: { name: 'admin' }
      });

      // Vérifier si l'utilisateur a déjà le rôle
      const existingRole = await db.UserRole.findOne({
        where: {
          UserId: userId,
          RoleId: adminRole.id
        }
      });

      if (existingRole) {
        return res.status(400).json({ message: "L'utilisateur est déjà administrateur" });
      }

      // Logger l'action
      await db.AdminActionLog.create({
        adminId: adminUser.id,
        action: 'MAKE_ADMIN',
        targetUserId: userId
      }, { transaction: t });

      // Attribuer le rôle
      await db.UserRole.create({
        UserId: userId,
        RoleId: adminRole.id
      }, { transaction: t });

      res.status(200).json({
        message: `L'utilisateur ${targetUser.username} est maintenant administrateur`
      });
    });

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      message: "Erreur lors de l'attribution du rôle admin",
      error: error.message
    });
  }
});

export default router;