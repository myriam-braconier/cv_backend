import { Sequelize, DataTypes } from 'sequelize';
import { fileURLToPath } from "url";
import { dirname } from "path";
import { readdirSync } from "fs";
import path from "path";
import dotenv from "dotenv";
// Supprimé l'import de ../utils/sequelize.js car on crée l'instance ici
import mysql2 from "mysql2";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();

const env = process.env.NODE_ENV || "development";

const defaultConfig = {
    dialect: "mysql",
    dialectModule: mysql2,
    logging: env === "development" ? console.log : false,
    pool: {
        max: env === "production" ? 2 : 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    dialectOptions: {
        connectTimeout: 60000,
        ssl: env === "production" ? {
            require: true,
            rejectUnauthorized: false,
        } : false,
    },
};

// Une seule déclaration de sequelize
let dbInstance;
try {
    dbInstance = new Sequelize(
        process.env.DATABASE_URL ||
        `mysql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${
            process.env.DB_HOST
        }:${process.env.DB_PORT || 3306}/${process.env.DB_DATABASE}`,
        defaultConfig
    );
} catch (error) {
    console.error("Erreur lors de la création de l'instance Sequelize:", error);
    throw error;
}

const db = {};
db.sequelize = dbInstance;
db.Sequelize = Sequelize;

try {
    const modelFiles = readdirSync(__dirname).filter(
        (file) =>
            file.indexOf(".") !== 0 &&
            file !== "index.js" &&
            file.slice(-3) === ".js"
    );

    for (const file of modelFiles) {
        const modelPath = new URL(file, import.meta.url).href;
        const model = await import(modelPath);
        const initFunction = model.default || model.initAboutModel || model.initModel;
       
        if (typeof initFunction === "function") {
            const modelInstance = initFunction(dbInstance, DataTypes);
            if (modelInstance?.name) {
                const modelName = modelInstance.name.charAt(0).toUpperCase() +
                                modelInstance.name.slice(1);
                db[modelName] = modelInstance;
            }
        }
    }

    Object.keys(db).forEach((modelName) => {
        if (db[modelName].associate) {
            db[modelName].associate(db);
        }
    });

    await dbInstance.authenticate();
    console.log("Base de données connectée!");
} catch (error) {
    console.error("Erreur de connexion à la base:", error);
    throw error;
}

export default db;
export const models = {
    sequelize: dbInstance,
    About: db.About,
    AdminActionLog: db.AdminActionLog,
    AuctionPrice: db.AuctionPrice,
    Permission: db.Permission,
    Post: db.Post,
    Profile: db.Profile,
    Role: db.Role,
    Synthetiser: db.Synthetiser,
    User: db.User
};