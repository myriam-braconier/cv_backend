// syncModels.js
import { sequelize } from "./sequelize.js";

import userModel from "../models/User.js";
import roleModel from "../models/Role.js";
import synthetiserModel from "../models/Synthetiser.js";
import postModel from "../models/Post.js";
import profileModel from "../models/Profile.js"; 

async function syncModels() {
    try {
        // Initialisation des modèles
        const models = {
            User: userModel(sequelize),
            Role: roleModel(sequelize),
            Post: postModel(sequelize),
            Synthetiser: synthetiserModel(sequelize),
            Profile: profileModel(sequelize) 
        };

        // Définition des associations
        Object.values(models).forEach(model => {
            if (typeof model.associate === 'function') {
                model.associate(models);
            }
        });

        // Synchronisation des modèles avec la base de données
        await sequelize.sync({ force: false });
        console.log("Models synchronized successfully");
    } catch (error) {
        console.error("Error synchronizing models:", error);
    } finally {
        await sequelize.close();
    }
}

syncModels();
