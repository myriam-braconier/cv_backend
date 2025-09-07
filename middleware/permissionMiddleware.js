/**
* Middleware vérifiant si l'utilisateur possède une permission spécifique
* @param {string[]} requiredPermissions - Liste des permissions requises
* @param {string} type - 'any' ou 'all' pour le type de vérification
* @returns {Function} Middleware Express
*/
export const checkPermission = (requiredPermissions, type = 'any') => {
    return async (req, res, next) => {
        try {
            // Vérification que l'utilisateur est authentifié
            if (!req.user) {
                return res.status(401).json({ 
                    success: false,
                    message: 'Utilisateur non authentifié' 
                });
            }

            // Vérification que l'utilisateur a un roleId
            if (!req.user.roleId) {
                console.error('User missing roleId:', req.user);
                return res.status(403).json({ 
                    success: false,
                    message: 'Utilisateur sans rôle défini' 
                });
            }

            // Récupération du rôle et des permissions
            const userRole = await db.Role.findByPk(req.user.roleId, {
                include: [{
                    model: db.Permission,
                    as: 'permissions'
                }]
            });

            if (!userRole) {
                console.error('Role not found for user:', req.user.id, 'roleId:', req.user.roleId);
                return res.status(403).json({ 
                    success: false,
                    message: 'Rôle utilisateur introuvable' 
                });
            }

            const userPermissions = userRole.permissions ? userRole.permissions.map(p => p.name) : [];

            // Log pour debug
            console.log('🔍 User permissions check:', {
                userId: req.user.id,
                roleId: req.user.roleId,
                userPermissions,
                requiredPermissions,
                type
            });

            // Vérifie si l'utilisateur a AU MOINS UNE des permissions requises
            if (type === 'any') {
                const hasAnyPermission = requiredPermissions.some(
                    permission => userPermissions.includes(permission)
                );
                if (!hasAnyPermission) {
                    return res.status(403).json({ 
                        success: false,
                        message: 'Permissions insuffisantes. Permissions requises (au moins une): ' + requiredPermissions.join(', '),
                        userPermissions: userPermissions,
                        requiredPermissions: requiredPermissions
                    });
                }
            }
            // Vérifie si l'utilisateur a TOUTES les permissions requises
            else if (type === 'all') {
                const hasAllPermissions = requiredPermissions.every(
                    permission => userPermissions.includes(permission)
                );
                if (!hasAllPermissions) {
                    const missingPermissions = requiredPermissions.filter(
                        permission => !userPermissions.includes(permission)
                    );
                    return res.status(403).json({ 
                        success: false,
                        message: 'Permissions insuffisantes. Permissions manquantes: ' + missingPermissions.join(', '),
                        userPermissions: userPermissions,
                        requiredPermissions: requiredPermissions,
                        missingPermissions: missingPermissions
                    });
                }
            }

            console.log('✅ Permission check passed for user:', req.user.id);
            next();
        } catch (error) {
            console.error('❌ Error in checkPermission middleware:', error);
            res.status(500).json({ 
                success: false,
                message: 'Erreur serveur lors de la vérification des permissions',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    };
};