// scripts/assignPermissionsDebug.js
import db from '../models/index.js';

const checkAndAssignPermissions = async () => {
    try {
        // 1. Vérifier les rôles existants
        console.log('\n=== Vérification des rôles ===');
        const roles = await db.Role.findAll();
        console.log('Rôles trouvés:', roles.map(r => ({id: r.id, name: r.name})));

        // 2. Vérifier les permissions existantes
        console.log('\n=== Vérification des permissions ===');
        const permissions = await db.Permission.findAll();
        console.log('Permissions trouvées:', permissions.map(p => ({id: p.id, name: p.name})));

        // 3. Attribution des permissions pour chaque rôle
        console.log('\n=== Attribution des permissions ===');
        
        const rolePermissions = {
            user: ['synths:read', 'users:read'],
            moderator: ['synths:read', 'synths:create', 'users:read', 'users:update'],
            admin: ['synths:read', 'synths:create', 'synths:update', 'synths:delete', 
                   'users:read', 'users:create', 'users:update', 'users:delete'],
            creator: ['synths:read', 'synths:create', 'synths:update'],
            owner: ['synths:read', 'synths:create', 'synths:update', 'synths:delete', 
                   'users:read', 'users:create', 'users:update', 'users:delete']
        };

        for (const [roleName, permissionNames] of Object.entries(rolePermissions)) {
            console.log(`\nTraitement du rôle: ${roleName}`);
            
            // Trouver le rôle
            const role = await db.Role.findOne({ where: { name: roleName } });
            if (!role) {
                console.log(`⚠️ Rôle ${roleName} non trouvé`);
                continue;
            }

            // Trouver les permissions pour ce rôle
            const rolePermissions = await db.permission.findAll({
                where: { name: permissionNames }
            });

            console.log(`Permissions trouvées pour ${roleName}:`, 
                       rolePermissions.map(p => p.name));

            // Attribuer les permissions
            await role.setPermissions(rolePermissions);
            console.log(`✓ Permissions attribuées au rôle ${roleName}`);

            // Vérifier l'attribution
            const assignedPermissions = await role.getPermissions();
            console.log(`Permissions vérifiées pour ${roleName}:`, 
                       assignedPermissions.map(p => p.name));
        }

        // 4. Vérification finale
        console.log('\n=== Vérification finale ===');
        for (const role of roles) {
            const perms = await role.getPermissions();
            console.log(`${role.name}:`, perms.map(p => p.name));
        }

    } catch (error) {
        console.error('Erreur:', error);
    } finally {
        await db.sequelize.close();
    }
};

// Exécution
console.log('=== Début de l\'attribution des permissions ===');
checkAndAssignPermissions();