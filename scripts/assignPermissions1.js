// scripts/assignPermissions.js
import db from '../models/index.js';

const assignPermissionsToRoles = async () => {
    try {
        console.log('Début de l\'attribution des permissions aux rôles...');

        // 1. Attribution pour le rôle USER
        const userRole = await db.Role.findOne({ where: { name: 'user' } });
        if (userRole) {
            const userPermissions = await db.Permission.findAll({
                where: {
                    name: ['synths:read', 'users:read']
                }
            });
            await userRole.setPermissions(userPermissions);
            console.log('✓ Permissions attribuées au rôle user');
        }

        // 2. Attribution pour le rôle MODERATOR
        const moderatorRole = await db.Role.findOne({ where: { name: 'moderator' } });
        if (moderatorRole) {
            const moderatorPermissions = await db.Permission.findAll({
                where: {
                    name: [
                        'synths:read', 
                        'users:read',
                        'users:update'
                    ]
                }
            });
            await moderatorRole.setPermissions(moderatorPermissions);
            console.log('✓ Permissions attribuées au rôle moderator');
        }

        // 3. Attribution pour le rôle ADMIN
        const adminRole = await db.Role.findOne({ where: { name: 'admin' } });
        if (adminRole) {
            const adminPermissions = await db.Permission.findAll();  // Toutes les permissions
            await adminRole.setPermissions(adminPermissions);
            console.log('✓ Permissions attribuées au rôle admin');
        }

        // 4. Attribution pour le rôle CREATOR
        const creatorRole = await db.Role.findOne({ where: { name: 'creator' } });
        if (creatorRole) {
            const creatorPermissions = await db.Permission.findAll({
                where: {
                    name: [
                        'synths:read',
                        'synths:update',
                    ]
                }
            });
            await creatorRole.setPermissions(creatorPermissions);
            console.log('✓ Permissions attribuées au rôle creator');
        }

        // 5. Attribution pour le rôle OWNER_INSTr (toutes les permissions comme admin)
        const ownerRole = await db.Role.findOne({ where: { name: 'owner_instr' } });

        if (ownerRole) {
             const creatorPermissions = await db.Permission.findAll({
                where: {
                    name: [
                        'synths:read',
                        'synths:update',
                    ]
                }
            });
            await ownerRole.setPermissions(ownerPermissions);
            console.log('✓ Permissions attribuées au rôle owner');
        }

        console.log('\nAttribution des permissions terminée avec succès');
    } catch (error) {
        console.error('Erreur lors de l\'attribution des permissions:', error);
        throw error;
    }
};





// Exécution du script
if (import.meta.url === `file://${process.argv[1]}`) {
    assignPermissionsToRoles()
        .then(() => {
            console.log('Script terminé avec succès');
            process.exit(0);
        })
        .catch(error => {
            console.error('Erreur fatale:', error);
            process.exit(1);
        });
}

export { assignPermissionsToRoles };