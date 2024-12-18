// utils/debugDatabase.js
import db from '../models/index.js';

const debugDatabase = async () => {
    try {
        // 1. Test de connexion
        console.log('\n1. Test de connexion à la base de données...');
        await db.sequelize.authenticate();
        console.log('✓ Connexion réussie');

        // 2. Afficher les modèles chargés
        console.log('\n2. Modèles disponibles dans db:');
        console.log(Object.keys(db));

        // 3. Vérifier si le modèle Role existe
        console.log('\n3. Vérification du modèle Role:');
        if (db.Role) {
            console.log('✓ Modèle Role trouvé');
        } else {
            console.log('✗ Modèle Role non trouvé');
        }

        // 4. Test de création d'un rôle
        console.log('Test de création d\'un rôle:');
        try {
            const testRole = await db.Role.create({
                name: 'test_role',
                description: 'Role de test pour debug'
            });
            console.log('✓ Rôle créé avec succès:', testRole.toJSON());
        } catch (error) {
            console.error('✗ Erreur lors de la création du rôle:', error.message);
        }

        // 5. Vérification des tables
        console.log('\n5. Tables existantes dans la base de données:');
        const tables = await db.sequelize.getQueryInterface().showAllTables();
        console.log(tables);

        // 6. Si la table roles existe, afficher sa structure
        if (tables.includes('roles') || tables.includes('Roles')) {
            console.log('\n6. Structure de la table roles:');
            const description = await db.sequelize.getQueryInterface().describeTable('roles');
            console.log(description);
        }

    } catch (error) {
        console.error('\nErreur lors du diagnostic:', error);
    } finally {
        await db.sequelize.close();
        process.exit();
    }
};

if (import.meta.url === `file://${process.argv[1]}`) {
    debugDatabase();
}

export { debugDatabase };