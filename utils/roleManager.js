// utils/roleManager.js
import db from '../models/index.js';

const createRoles = async () => {
    try {
        console.log('\n=== Initialisation des rôles ===');
        
        const roles = [
            {
                name: 'user',
                description: 'Utilisateur standard avec accès basique au système'
            },
            {
                name: 'moderator',
                description: 'Modérateur avec permissions de gestion du contenu'
            },
            {
                name: 'admin',
                description: 'Administrateur avec accès étendu au système'
            },
            {
                name: 'creator',
                description: 'Créateur de contenu avec droits de publication'
            },
            {
                name: 'owner_instr',
                description: 'Propriétaire avec accès complet au système'
            }
        ];

        for (const roleData of roles) {
            const [role, created] = await db.Role.findOrCreate({
                where: { name: roleData.name },
                defaults: roleData
            });

            if (created) {
                console.log(`✓ Rôle '${roleData.name}' créé avec succès`);
            } else {
                console.log(`→ Rôle '${roleData.name}' déjà existant`);
            }
        }

        console.log('\n✓ Initialisation des rôles terminée avec succès');
    } catch (error) {
        console.error('\n❌ Erreur lors de la création des rôles:', error);
        throw error;
    }
};

const deleteRole = async (roleName) => {
    try {
        console.log(`\n=== Suppression du rôle '${roleName}' ===`);

        // Vérifier si le rôle est protégé
        const protectedRoles = ['admin', 'owner'];
        if (protectedRoles.includes(roleName)) {
            throw new Error(`Le rôle '${roleName}' est protégé et ne peut pas être supprimé`);
        }

        // Trouver le rôle
        const role = await db.Role.findOne({
            where: { name: roleName }
        });

        if (!role) {
            throw new Error(`Le rôle '${roleName}' n'existe pas`);
        }

        // Supprimer les associations dans la table de jonction
        if (db.UserRoles) {
            await db.UserRoles.destroy({
                where: { roleId: role.id }
            });
        }

        if (db.RolePermission) {
            await db.RolePermission.destroy({
                where: { roleId: role.id }
            });
        }

        // Supprimer le rôle
        await role.destroy();
        console.log(`✓ Rôle '${roleName}' supprimé avec succès`);

    } catch (error) {
        console.error(`\n❌ Erreur lors de la suppression du rôle '${roleName}':`, error);
        throw error;
    }
};

const listRoles = async () => {
    try {
        console.log('\n=== Liste des rôles ===');
        const roles = await db.Role.findAll();
        roles.forEach(role => {
            console.log(`- ${role.name}: ${role.description}`);
        });
        return roles;
    } catch (error) {
        console.error('\n❌ Erreur lors de la liste des rôles:', error);
        throw error;
    }
};

// Gestion des commandes en ligne
if (import.meta.url === `file://${process.argv[1]}`) {
    const command = process.argv[2];
    const roleName = process.argv[3];

    const main = async () => {
        try {
            switch (command) {
                case 'create':
                    await createRoles();
                    break;
                case 'delete':
                    if (!roleName) {
                        throw new Error('Nom du rôle requis pour la suppression');
                    }
                    await deleteRole(roleName);
                    break;
                case 'list':
                    await listRoles();
                    break;
                default:
                    console.log(`
// Usage:
//   node roleManager.js create         # Créer tous les rôles
//   node roleManager.js delete [role]  # Supprimer un rôle spécifique
//   node roleManager.js list          # Lister tous les rôles
                    `);
            }
            process.exit(0);
        } catch (error) {
            console.error('Erreur fatale:', error);
            process.exit(1);
        }
    };

    main();
}

export { createRoles, deleteRole, listRoles };