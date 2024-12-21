// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';



const jwtSecret = process.env.JWT_SECRET;

// Correction : exporter la fonction comme export nommé
export const authenticateToken = (req, res, next) => { // export nommé donc on ne l'importe pas par défaut
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: "Token manquant" });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                console.error('Erreur d\'authentification:', err);
                return res.status(403).json({ message: "Token invalide" });
            }
            req.user = user;
            next();
        });
   } catch (error) {
       console.error('Erreur d\'authentification:', error);
       return res.status(403).json({ 
           error: "Token invalide ou expiré." 
       });
   }


   


};

export const secret = jwtSecret;