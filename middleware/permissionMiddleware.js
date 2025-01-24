/**
* Middleware vérifiant si l'utilisateur possède une permission spécifique
* @param {string} permissionName - Nom de la permission à vérifier
* @returns {Function} Middleware Express
*/
export const checkPermission = (requiredPermissions, type = 'any') => {
    return async (req, res, next) => {
        try {
            const userRole = await db.Role.findByPk(req.user.roleId, {
                include: [{
                    model: db.Permission,
                    as: 'permissions'
                }]
            });

            const userPermissions = userRole.permissions.map(p => p.name);

            // Vérifie si l'utilisateur a AU MOINS UNE des permissions requises
            if (type === 'any') {
                const hasAnyPermission = requiredPermissions.some(
                    permission => userPermissions.includes(permission)
                );
                if (!hasAnyPermission) {
                    return res.status(403).json({ 
                        message: 'Vous devez avoir au moins une des permissions requises' 
                    });
                }
            }
            // Vérifie si l'utilisateur a TOUTES les permissions requises
            else if (type === 'all') {
                const hasAllPermissions = requiredPermissions.every(
                    permission => userPermissions.includes(permission)
                );
                if (!hasAllPermissions) {
                    return res.status(403).json({ 
                        message: 'Vous devez avoir toutes les permissions requises' 
                    });
                }
            }

            next();
        } catch (error) {
            res.status(500).json({ message: 'Erreur serveur' });
        }
    };
};

