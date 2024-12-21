import db from "../models/index.js";

const syncSelectedModels = async () => {
    try {
        await db.sequelize.authenticate();
        console.log('Connexion à la base de données établie');

        // Désactiver les contraintes une seule fois au début
        await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

        try {


        // Ajout des commandes SQL spécifiques pour mettre à jour la table Synthetiser
        console.log("Application des modifications à la table Synthetisers...");
        await db.sequelize.query(`
            ALTER TABLE synthetisers 
            ADD COLUMN IF NOT EXISTS userId INTEGER,
            ADD COLUMN IF NOT EXISTS isOwner BOOLEAN DEFAULT false,
            ADD FOREIGN KEY (userId) REFERENCES users(id)
        `);
        console.log("✓ Table Synthetisers mise à jour");

            // Synchroniser dans l'ordre des dépendances
            console.log("\n1. Synchronisation de la table Roles...");
            await db.Role.sync({ alter:true });
            console.log("✓ Table Roles synchronisée");

            console.log("\n2. Synchronisation de la table Permissions...");
            await db.Permission.sync({ alter: true });
            console.log("✓ Table Permissions synchronisée");

            console.log("\n3. Synchronisation de la table Users...");
            await db.User.sync({ alter: true });
            console.log("✓ Table Users synchronisée");

            console.log("\n4. Synchronisation de la table Posts...");
            await db.Post.sync({ alter: true });
            console.log("✓ Table Posts synchronisée");

  

            console.log("\n5. Synchronisation de la table profiles...");
            await db.Profile.sync({ alter: true });
            console.log("✓ Table profiles synchronisée");

            console.log("\n5. Synchronisation de la table auctionPrices...");
            await db.AuctionPrice.sync({ alter: true });
            console.log("✓ Table auctionprice synchronisée");

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
