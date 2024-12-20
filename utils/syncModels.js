import sequelize from "./sequelize.js";
import initUser from "../models/user.js";
import initRole from "../models/role.js";
import initSynthetiser from "../models/synthetiser.js";
import initPost from "../models/post.js";
import initProfile from "../models/profile.js";
import initPermission from "../models/permission.js";
import { DataTypes } from "sequelize";

const syncModels = async () => {
    try {
        // Vérification de la connexion
        await sequelize.authenticate();
        console.log('Connexion établie');

        // Initialisation des modèles avec DataTypes
        const models = {
            user: initUser(sequelize, DataTypes),
            role: initRole(sequelize, DataTypes),
            post: initPost(sequelize, DataTypes),
            synthetiser: initSynthetiser(sequelize, DataTypes),
            profile: initProfile(sequelize, DataTypes),
            permission: initPermission(sequelize, DataTypes)
        };

        // Désactiver les contraintes
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

        // Définition des associations
        Object.values(models).forEach(model => {
            if (typeof model.associate === 'function') {
                model.associate(models);
            }
        });

        // Synchronisation avec la base de données
        await sequelize.sync({ alter: true });
        
        // Réactiver les contraintes
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log("Models synchronized successfully");

    } catch (error) {
        console.error("Error synchronizing models:", error);
        throw error;
    } finally {
        await sequelize.close();
    }
};

// Exécution avec gestion d'erreur
(async () => {
    try {
        await syncModels();
        process.exit(0);
    } catch (error) {
        console.error("Fatal error:", error);
        process.exit(1);
    }
})();
