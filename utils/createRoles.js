// utils/createRolesSimple.js
import db from '../models/index.js';

const createRoles = async () => {
    try {
        // Test de connexion
        console.log('1. Test de la connexion à la base de données...');
        await db.sequelize.authenticate();
        console.log('✓ Connexion réussie\n');

        // Vérification du modèle Role
        console.log('2. Vérification du modèle Role...');
        if (!db.Role) {
            throw new Error('Modèle Role non trouvé dans db !');
        }
        console.log('✓ Modèle Role trouvé\n');

        // Définition des rôles
        const roles = [
            { name: 'user', description: 'Utilisateur standard' },
            { name: 'admin', description: 'Administrateur' },
            { name: 'moderator', description: 'Modérateur' },
            { name: 'creator', description: 'Créateur' },
            { name: 'owner_instr', description: 'Musicien' }
        ];

        // Création des rôles un par un
        console.log('3. Création des rôles...');
        for (const roleData of roles) {
            console.log(`\nTentative de création du rôle: ${roleData.name}`);
            try {
                const [role, created] = await db.Role.findOrCreate({
                    where: { name: roleData.name },
                    defaults: roleData
                });

                if (created) {
                    console.log(`✓ Rôle ${roleData.name} créé avec succès (ID: ${role.id})`);
                } else {
                    console.log(`→ Rôle ${roleData.name} existe déjà (ID: ${role.id})`);
                }
            } catch (roleError) {
                console.error(`✗ Erreur lors de la création du rôle ${roleData.name}:`, roleError);
            }
        }

        // Vérification finale
        console.log('\n4. Vérification des rôles créés...');
        const existingRoles = await db.Role.findAll();
        console.log('Rôles dans la base de données:');
        existingRoles.forEach(role => {
            console.log(`- ${role.name} (ID: ${role.id})`);
        });

    } catch (error) {
        console.error('\nErreur générale:', error);
    } finally {
        console.log('\nFermeture de la connexion...');
        await db.sequelize.close();
        process.exit();
    }
};

// Exécution
console.log('=== Début du script de création des rôles ===\n');
createRoles();