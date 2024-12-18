import getDb from './seeder-wrapper.mjs';

export const up = async (queryInterface, Sequelize) => {
  const db = await getDb();

  try {
    // Liste des permissions par catégorie
    const permissions = [
      // Permissions utilisateurs
      { name: 'users:read', description: 'Voir les utilisateurs' },
      { name: 'users:create', description: 'Créer des utilisateurs' },
      { name: 'users:update', description: 'Modifier les utilisateurs' },
      { name: 'users:delete', description: 'Supprimer des utilisateurs' },

      // Permissions posts
      { name: 'posts:read', description: 'Voir les posts' },
      { name: 'posts:create', description: 'Créer des posts' },
      { name: 'posts:update', description: 'Modifier les posts' },
      { name: 'posts:delete', description: 'Supprimer des posts' },
      
      // Permissions synthétiseurs
      { name: 'synths:read', description: 'Voir les synthétiseurs' },
      { name: 'synths:create', description: 'Créer des synthétiseurs' },
      { name: 'synths:update', description: 'Modifier les synthétiseurs' },
      { name: 'synths:delete', description: 'Supprimer des synthétiseurs' },
      
      // Permissions rôles
      { name: 'roles:read', description: 'Voir les rôles' },
      { name: 'roles:assign', description: 'Assigner des rôles' },
      { name: 'roles:create', description: 'Créer des rôles' },
      { name: 'roles:delete', description: 'Supprimer des rôles' },

      // Permissions admin
      { name: 'admin:access', description: 'Accès au panel admin' },
      { name: 'admin:full', description: 'Accès complet admin' }
    ];

    console.log('Début de la création des permissions...');

    for (const permission of permissions) {
      const [perm, created] = await db.Permission.findOrCreate({
        where: { name: permission.name },
        defaults: permission
      });

      if (created) {
        console.log(`Permission créée: ${permission.name}`);
      } else {
        console.log(`Permission existante: ${permission.name}`);
      }
    }

    // Attribuer toutes les permissions au rôle admin
    const adminRole = await db.Role.findOne({ where: { name: 'admin' } });
    if (adminRole) {
      const allPermissions = await db.Permission.findAll();

      
      await db.Permission.bulkCreate(
        allPermissions.map(permission => ({
          roleId: adminRole.id,
          permissionId: permission.id
        }))
      );
      console.log('Toutes les permissions ont été attribuées au rôle admin');
    }

    console.log('Création des permissions terminée avec succès!');

  } catch (error) {
    console.error('Erreur lors de la création des permissions:', error);
  }
};

export const down = async (queryInterface, Sequelize) => {
  const db = await getDb();
  // Code pour annuler le seeding si nécessaire
  await db.Permission.destroy({ where: {} });
  console.log('Toutes les permissions ont été supprimées');
};
