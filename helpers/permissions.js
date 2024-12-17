import { User, Role, Permission } from '../models/index.js';

/**
* Vérifie si un utilisateur possède une permission spécifique
* @param {number} userId - ID de l'utilisateur
* @param {string} permissionName - Nom de la permission à vérifier
* @returns {Promise<boolean>} True si l'utilisateur a la permission
*/
export const hasPermission = async (userId, permissionName) => {
   try {
       const user = await User.findByPk(userId, {
           include: [{
               model: Role,
               include: [Permission]
           }]
       });

       if (!user) {
           return false;
       }

       return user.Roles.some(role =>
           role.Permissions.some(permission => 
               permission.name === permissionName
           )
       );
   } catch (error) {
       console.error('Erreur lors de la vérification des permissions:', error);
       return false;
   }
};