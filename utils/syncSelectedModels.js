import db from "../models/index.js";

const syncSelectedModels = async () => {
    try {
        await db.sequelize.authenticate();
        console.log('Connexion à la base de données établie');

        // Désactiver les contraintes une seule fois au début
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

        try {
            // Synchroniser dans l'ordre des dépendances
            console.log("\n1. Synchronisation de la table Roles...");
            await db.role.sync({ force:true });
            console.log("✓ Table Roles synchronisée");

            console.log("\n2. Synchronisation de la table Permissions...");
            await db.permission.sync({ alter: true });
            console.log("✓ Table Permissions synchronisée");

            console.log("\n3. Synchronisation de la table Users...");
            await db.user.sync({ alter: true });
            console.log("✓ Table Users synchronisée");

            console.log("\n4. Synchronisation de la table Posts...");
            await db.post.sync({ alter: true });
            console.log("✓ Table Posts synchronisée");

            console.log("\n5. Synchronisation de la table Synthetisers...");
            await db.synthetiser.sync({ alter: true });
            console.log("✓ Table Synthetisers synchronisée");

            // Forcer la mise à jour des contraintes
            await db.sequelize.sync({ alter: true });

        } finally {
            // Réactiver les contraintes dans le bloc finally
            await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        }

        console.log("\n=== Synchronisation terminée avec succès ===");
    } catch (error) {
        console.error("\nErreur lors de la synchronisation:", error);
        throw error;
    } finally {
        await db.sequelize.close();
    }
};

// Exécution
if (import.meta.url === `file://${process.argv[1]}`) {
    (async () => {
        try {
            await syncSelectedModels();
            process.exit(0);
        } catch (error) {
            console.error("Erreur fatale:", error);
            process.exit(1);
        }
    })();
}

export { syncSelectedModels };
