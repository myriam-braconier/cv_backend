// models/index.js
import { Sequelize } from "sequelize";
import { fileURLToPath } from "url";
import { dirname } from 'path';
import { readdirSync } from 'fs';
import path from "path";
import dotenv from "dotenv";
import config from "../config/config.js";
import mysql2 from 'mysql2';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const env = process.env.NODE_ENV || "development";

const defaultConfig = {
    dialect: 'mysql',
    dialectModule: mysql2,
    logging: env === "development" ? console.log : false,
    pool: {
        max: env === "production" ? 2 : 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    dialectOptions: {
        connectTimeout: 60000,
        ssl: env === "production" ? {
            require: true,
            rejectUnauthorized: false
        } : false
    }
};

const sequelize = new Sequelize(
    process.env.DATABASE_URL || 
    `mysql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 3306}/${process.env.DB_DATABASE}`,
    defaultConfig
);

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

try {
    const modelFiles = readdirSync(__dirname).filter(file =>
        file.indexOf('.') !== 0 && 
        file !== 'index.js' && 
        file.slice(-3) === '.js'
    );

    for (const file of modelFiles) {
        const modelPath = new URL(file, import.meta.url).href;
        const model = await import(modelPath);
        const initFunction = model.default || model.initModel;
        
        if (typeof initFunction === 'function') {
            const modelInstance = initFunction(sequelize, Sequelize.DataTypes);
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

    await sequelize.authenticate();
    console.log('Base de données connectée!');
} catch (error) {
    console.error('Erreur de connexion à la base:', error);
    throw error;
}

export default db;
export const models = {
    sequelize,
    User: db.User,
    Role: db.Role,
    Permission: db.Permission,
    Post: db.Post,
    Synthetiser: db.Synthetiser,
    AuctionPrice: db.AuctionPrice,
    Profile: db.Profile
};