import sequelize from "./sequelize.js";
import { initUser } from "../models/User.js";
import { initRole } from "../models/Role.js";
import { initSynthetiser } from "../models/Synthetiser.js";
import { initPost } from "../models/Post.js";
import { initProfile } from "../models/Profile.js";

const syncModels = async () => {
   try {
       // Initialisation des modèles
       const models = {
           User: initUser(sequelize),
           Role: initRole(sequelize),
           Post: initPost(sequelize),
           Synthetiser: initSynthetiser(sequelize),
           Profile: initProfile(sequelize)
       };

       // Définition des associations
       Object.values(models).forEach(model => {
           if (typeof model.associate === 'function') {
               model.associate(models);
           }
       });

       // Synchronisation avec la base de données
       await sequelize.sync({ force: true });
       console.log("Models synchronized successfully");
   } catch (error) {
       console.error("Error synchronizing models:", error);
   } finally {
       await sequelize.close();
   }
};

// Exécution immédiate
syncModels();