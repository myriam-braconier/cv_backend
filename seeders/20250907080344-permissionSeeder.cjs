'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log('Début du seeding des permissions...');

      // 1. Supprimer toutes les associations existantes dans la table de liaison
      console.log('Suppression des associations rôle-permission existantes...');
      await queryInterface.bulkDelete('RolePermissions', {}, {});

      // 2. Supprimer toutes les permissions existantes
      console.log('Suppression des permissions existantes...');
      await queryInterface.bulkDelete('Permissions', {}, {});

      // 3. Liste complète des permissions par catégorie
      const permissions = [
        // Permissions utilisateurs
        { name: 'users:read', description: 'Voir les utilisateurs', createdAt: new Date(), updatedAt: new Date() },
        { name: 'users:create', description: 'Créer des utilisateurs', createdAt: new Date(), updatedAt: new Date() },
        { name: 'users:update', description: 'Modifier les utilisateurs', createdAt: new Date(), updatedAt: new Date() },
        { name: 'users:delete', description: 'Supprimer des utilisateurs', createdAt: new Date(), updatedAt: new Date() },

        // Permissions posts
        { name: 'posts:read', description: 'Voir les posts', createdAt: new Date(), updatedAt: new Date() },
        { name: 'posts:create', description: 'Créer des posts', createdAt: new Date(), updatedAt: new Date() },
        { name: 'posts:update', description: 'Modifier les posts', createdAt: new Date(), updatedAt: new Date() },
        { name: 'posts:delete', description: 'Supprimer des posts', createdAt: new Date(), updatedAt: new Date() },
        
        // Permissions synthétiseurs
        { name: 'synths:read', description: 'Voir les synthétiseurs', createdAt: new Date(), updatedAt: new Date() },
        { name: 'synths:create', description: 'Créer des synthétiseurs', createdAt: new Date(), updatedAt: new Date() },
        { name: 'synths:update', description: 'Modifier les synthétiseurs', createdAt: new Date(), updatedAt: new Date() },
        { name: 'synths:delete', description: 'Supprimer des synthétiseurs', createdAt: new Date(), updatedAt: new Date() },
        { name: 'synths:bid', description: 'Enchérir sur des synthétiseurs', createdAt: new Date(), updatedAt: new Date() },

        // Permissions auctions
        { name: 'auctions:create', description: "Créer une enchère", createdAt: new Date(), updatedAt: new Date() },
        { name: 'auctions:read', description: 'Voir les enchères', createdAt: new Date(), updatedAt: new Date() },
        { name: 'auctions:update', description: 'Modifier les enchères', createdAt: new Date(), updatedAt: new Date() },
        { name: 'auctions:delete', description: 'Supprimer les enchères', createdAt: new Date(), updatedAt: new Date() },
        
        // Permissions rôles
        { name: 'roles:read', description: 'Voir les rôles', createdAt: new Date(), updatedAt: new Date() },
        { name: 'roles:assign', description: 'Assigner des rôles', createdAt: new Date(), updatedAt: new Date() },
        { name: 'roles:create', description: 'Créer des rôles', createdAt: new Date(), updatedAt: new Date() },
        { name: 'roles:delete', description: 'Supprimer des rôles', createdAt: new Date(), updatedAt: new Date() },

        // Permissions admin
        { name: 'admin:access', description: 'Accès au panel admin', createdAt: new Date(), updatedAt: new Date() },
        { name: 'admin:full', description: 'Accès complet admin', createdAt: new Date(), updatedAt: new Date() }
      ];

      // 4. Créer toutes les permissions
      console.log('Création des nouvelles permissions...');
      await queryInterface.bulkInsert('Permissions', permissions, {});
      console.log(`${permissions.length} permissions créées`);

      // 5. Configuration des rôles et leurs permissions
      const rolePermissions = {
        admin: [
          'users:read', 'users:create', 'users:update', 'users:delete',
          'posts:read', 'posts:create', 'posts:update', 'posts:delete',
          'synths:read', 'synths:create', 'synths:update', 'synths:delete', 'synths:bid',
          'auctions:create', 'auctions:read', 'auctions:update', 'auctions:delete',
          'roles:read', 'roles:assign', 'roles:create', 'roles:delete',
          'admin:access', 'admin:full'
        ],
        moderator: [
          'users:read', 'users:update',
          'posts:read', 'posts:create', 'posts:update',
          'synths:read', 'synths:create', 'synths:update',
          'auctions:read'
        ],
        owner_instr: [
          'auctions:create', 'synths:bid',
          'users:read', 'users:create', 'users:update', 'users:delete',
          'synths:read', 'synths:create', 'synths:update',
          'posts:read', 'posts:create', 'posts:update'
        ],
        creator: [
          'synths:read', 'synths:create', 'synths:update',
          'posts:read', 'posts:create', 'posts:update'
        ],
        user: [
          'users:read',
          'synths:read',
          'posts:read'
        ]
      };

      // 6. Créer les associations rôles-permissions
      console.log('Attribution des permissions aux rôles...');
      
      for (const [roleName, permissionNames] of Object.entries(rolePermissions)) {
        console.log(`Traitement du rôle: ${roleName}`);
        
        // Récupérer l'ID du rôle
        const roleQuery = `SELECT id FROM Roles WHERE name = '${roleName}'`;
        const [roleResults] = await queryInterface.sequelize.query(roleQuery);

        if (!roleResults || roleResults.length === 0) {
          console.warn(`⚠️  Rôle '${roleName}' non trouvé`);
          continue;
        }

        const roleId = roleResults[0].id;
        console.log(`   Rôle ID: ${roleId}`);

        // Récupérer les IDs des permissions
        const permissionQuery = `SELECT id, name FROM Permissions WHERE name IN (${permissionNames.map(name => `'${name}'`).join(',')})`;
        const [permissionResults] = await queryInterface.sequelize.query(permissionQuery);

        if (permissionResults.length !== permissionNames.length) {
          console.warn(`⚠️  Certaines permissions pour '${roleName}' n'ont pas été trouvées`);
          console.log(`   Trouvées: ${permissionResults.map(p => p.name).join(', ')}`);
          console.log(`   Attendues: ${permissionNames.join(', ')}`);
        }

        // Créer les associations
        const associations = permissionResults.map(permission => ({
          RoleId: roleId,
          PermissionId: permission.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }));

        if (associations.length > 0) {
          await queryInterface.bulkInsert('RolePermissions', associations, {});
          console.log(`✅ ${associations.length} permissions attribuées au rôle '${roleName}'`);
        }
      }

      // 7. Vérification finale
      console.log('\n=== VÉRIFICATION FINALE ===');
      for (const roleName of Object.keys(rolePermissions)) {
        const verificationQuery = `
          SELECT p.name as permission_name 
          FROM Roles r 
          JOIN RolePermissions rp ON r.id = rp.RoleId 
          JOIN Permissions p ON p.id = rp.PermissionId 
          WHERE r.name = '${roleName}'
        `;
        const [results] = await queryInterface.sequelize.query(verificationQuery);
        
        console.log(`${roleName}: ${results.length} permissions`);
        if (results.length > 0) {
          console.log(`  - ${results.map(r => r.permission_name).join(', ')}`);
        }
      }

      console.log('\n✅ Seeding des permissions terminé avec succès!');

    } catch (error) {
      console.error('❌ Erreur lors du seeding des permissions:', error);
      console.error('Stack trace:', error.stack);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      console.log('Rollback du seeding des permissions...');
      
      // Supprimer les associations rôle-permission
      await queryInterface.bulkDelete('RolePermissions', {}, {});
      console.log('Associations rôle-permission supprimées');
      
      // Supprimer toutes les permissions
      await queryInterface.bulkDelete('Permissions', {}, {});
      console.log('Toutes les permissions ont été supprimées');
      
    } catch (error) {
      console.error('Erreur lors du rollback:', error);
      throw error;
    }
  }
};