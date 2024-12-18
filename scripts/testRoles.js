// utils/testRoles.js
import db from '../models/index.js';

const testRoleCreation = async () => {
  try {
    console.log('Début du test de création des rôles...');

    // Test de connexion
    await db.sequelize.authenticate();
    console.log('✓ Connexion à la base de données établie');

    // Synchronisation des tables
    await db.sequelize.sync({ alter: true });
    console.log('✓ Tables synchronisées');

    // Création des rôles
    const roles = [
      { name: 'user', description: 'Utilisateur standard' },
      { name: 'moderator', description: 'Modérateur' },
      { name: 'admin', description: 'Administrateur' }
    ];

    for (const roleData of roles) {
      const [role, created] = await db.Role.findOrCreate({
        where: { name: roleData.name },
        defaults: roleData
      });

      console.log(`${created ? '✓ Créé:' : '→ Existant:'} ${roleData.name}`);
    }

    // Vérification
    const allRoles = await db.Role.findAll();
    console.log('\nRôles dans la base de données:');
    console.log(allRoles.map(role => role.toJSON()));

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await db.sequelize.close();
    process.exit();
  }
};

// Exécution directe en ES6
if (import.meta.url === `file://${process.argv[1]}`) {
  testRoleCreation();
}

export { testRoleCreation };