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
const checkPricePermission = async (req, res, next) => {
    try {
        const user = req.user; 
        const role = await user.getRole();
        
        if (role.role_name === 'admin' || role.role_name === 'owner_instr') {
            next();
        } else {
            res.status(403).json({ 
                message: "Seuls les administrateurs et les propriétaires d'instruments peuvent modifier les prix" 
            });
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la vérification des permissions" });
    }
};




export const secret = jwtSecret;