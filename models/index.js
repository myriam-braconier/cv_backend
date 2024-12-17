import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import Sequelize from "sequelize";
import dotenv from "dotenv";
import config from "../config/config.js";
import { initPermission } from "./Permission.js";
import { initPost } from "./Post.js";
import { initProfile } from "./Profile.js";
import { initRole } from "./Role.js";
import { initSynthetiser } from "./Synthetiser.js";
import { initUser } from "./User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";

dotenv.config();

const db = {};
let sequelize;

if (config[env].use_env_variable) {
    sequelize = new Sequelize(
        process.env[config[env].use_env_variable],
        config[env]
    );
} else {
    sequelize = new Sequelize(
        config[env].database,
        config[env].username,
        config[env].password,
        config[env]
    );
}

// Initialiser les modèles
db.Permission = initPermission(sequelize);
db.Post = initPost(sequelize);
db.Profile = initProfile(sequelize);
db.Role = initRole(sequelize);
db.Synthetiser = initSynthetiser(sequelize);
db.User = initUser(sequelize);

// Établir les associations
Object.values(db).forEach((model) => {
    if (model.associate) {
        model.associate(db);
    }
});

// Ajouter sequelize à db
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Synchroniser la base de données
const syncDatabase = async () => {
    try {
        await sequelize.sync();
        console.log("Database synchronized successfully");
    } catch (error) {
        console.error("Error synchronizing database:", error);
    }
};

syncDatabase();

export default db;