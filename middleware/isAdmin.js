// middleware/isAdmin.js
import jwt from 'jsonwebtoken';
import db from '../models/index.js';

export const isAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token non fourni' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.User.findByPk(decoded.id, {
      include: [{
        model: db.Role,
        attributes: ['name']
      }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    if (!user.Roles.some(role => role.name === 'admin')) {
      return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Non autorisé' });
  }
};