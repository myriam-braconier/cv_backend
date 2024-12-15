// syncModels.js
import { sequelize } from "./sequelize.js";

import User from "../models/user.js";
import Role from "../models/role.js";
import Synthetiser from "../models/synthetiser.js";
import Post from "../models/post.js";

async function syncModels() {
    try {
        // Initialisation des modèles
        User.init(sequelize);
        Role.init(sequelize);
        Post.init(sequelize);
        Synthetiser.init(sequelize);

        // Synchronisation des modèles avec la base de données
        await sequelize.sync({ force: false }); // Utilisez { force: true } pour recréer les tables (attention aux données existantes)
        console.log("Models synchronized successfully");
    } catch (error) {
        console.error("Error synchronizing models:", error);
    } finally {
        await sequelize.close();
    }
}

syncModels();
