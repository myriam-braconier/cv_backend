import { hasPermission } from '../helpers/permissions.js';

/**
* Middleware vérifiant si l'utilisateur possède une permission spécifique
* @param {string} permissionName - Nom de la permission à vérifier
* @returns {Function} Middleware Express
*/
export const checkPermission = (permissionName) => async (req, res, next) => {
   try {
       const hasUserPermission = await hasPermission(req.user.id, permissionName);
       
       if (hasUserPermission) {
           next();
       } else {
           res.status(403).json({ 
               message: "Permission refusée",
               requiredPermission: permissionName 
           });
       }
   } catch (error) {
       console.error('Erreur lors de la vérification des permissions:', error);
       res.status(500).json({ 
           message: "Erreur lors de la vérification des permissions" 
       });
   }
};