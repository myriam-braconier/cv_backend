console.log('Début du script de synchronisation');
import db from '../models/index.js';

const syncSelectedModels = async () => {
    try {
        console.log('=== Début de la synchronisation des modèles (mode alter) ===\n');

        
 // Désactiver temporairement les logs de Sequelize
 db.sequelize.options.logging = false;


        // Vérification de l'état actuel
        console.log('1. Vérification des tables existantes...');
        const queryInterface = db.sequelize.getQueryInterface();
        const tables = await queryInterface.showAllTables();
        console.log('Tables trouvées:', tables);

        // Synchronisation de User
        console.log('\n2. Synchronisation de la table User...');
        await db.User.sync({ alter: true });
        console.log('✓ Table User synchronisée');

        // Synchronisation de Role
        console.log('\n3. Synchronisation de la table Role...');
        await db.Role.sync({ alter: true });
        console.log('✓ Table Role synchronisée');

        // Synchronisation de UserRoles
        console.log('\n4. Synchronisation de la table UserRoles...');
        await db.sequelize.model('UserRoles').sync({ force: true });
        console.log('✓ Table UserRoles synchronisée');

        console.log('\n=== Synchronisation terminée avec succès ===');
    } catch (error) {
        console.error('\nErreur lors de la synchronisation:', error);
        throw error;
    } finally {
        await db.sequelize.close();
    }
};

// Exécution si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
    syncSelectedModels()
        .then(() => {
            process.exit(0);
        })
        .catch(error => {
            console.error('Erreur fatale:', error);
            process.exit(1);
        });
}

export { syncSelectedModels };