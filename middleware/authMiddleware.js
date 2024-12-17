import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Configuration des variables d'environnement
dotenv.config();
const jwtSecret = process.env.JWT_SECRET;

// Middleware d'authentification
export function authenticateToken (req, res, next) {
   const authHeader = req.headers['authorization'];
   const token = authHeader && authHeader.split(' ')[1];

   if (!token) {
       return res.status(401).json({ 
           error: "Accès refusé. Token manquant." 
       });
   }

   try {
       const decoded = jwt.verify(token, jwtSecret);
       req.user = decoded;
       next();
   } catch (error) {
       console.error('Erreur d\'authentification:', error);
       return res.status(403).json({ 
           error: "Token invalide ou expiré." 
       });
   }
};

// Export nommé du secret JWT pour réutilisation
export const secret = jwtSecret;