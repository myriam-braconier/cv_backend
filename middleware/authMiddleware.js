import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';


// Initialiser dotenv pour charger les variables d'environnement
dotenv.config();


// Définir le secret à partir des variables d'environnement
const jwtSecret = process.env.JWT_SECRET;

// Liste des routes publiques
const publicRoutes = [
    '/api/synthetisers',      // Liste des synthétiseurs
    '/api/synthetisers/:id'   // Détails d'un synthétiseur
];

export const authenticateToken = (req, res, next) => {
    // Vérifier si la route actuelle est publique
    const isPublicRoute = publicRoutes.some(route => {
        // Convertir la route publique en regex pour gérer les paramètres dynamiques
        const routeRegex = new RegExp('^' + route.replace(/:\w+/g, '[^/]+') + '$');
        return routeRegex.test(req.path);
    });

    // Si c'est une route publique, passer directement au suivant
    if (isPublicRoute) {
        return next();
    }

    // Pour les routes protégées, vérifier le token
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

// const checkPricePermission = async (req, res, next) => {
//     try {
//         const user = req.user; 
//         const role = await user.getRole();
        
//         if (role.role_name === 'admin' || role.role_name === 'owner_instr') {
//             next();
//         } else {
//             res.status(403).json({ 
//                 message: "Seuls les administrateurs et les propriétaires d'instruments peuvent modifier les prix" 
//             });
//         }
//     } catch (error) {
//         res.status(500).json({ message: "Erreur lors de la vérification des permissions" });
//     }
// };





// Exporter le secret
export const secret = process.env.JWT_SECRET;