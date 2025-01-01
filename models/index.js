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

// Configuration de base optimisée
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

// Création de l'instance Sequelize
const sequelize = new Sequelize(
    process.env.DATABASE_URL || 
    `mysql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 3306}/${process.env.DB_DATABASE}`,
    defaultConfig
);

// Initialisation de l'objet db
const db = {
    sequelize,
    Sequelize
};

// Chargement des modèles
try {
    const modelFiles = readdirSync(__dirname).filter(file =>
        file.indexOf('.') !== 0 &&
        file !== 'index.js' &&
        file.slice(-3) === '.js'
    );

    console.log('Modèles disponibles:', modelFiles);

    for (const file of modelFiles) {
        try {
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
        } catch (error) {
            console.error(`Erreur de chargement du modèle ${file}:`, error);
            if (env === "production") throw error;
        }
    }

    // Associations
    Object.values(db).forEach(model => {
        if (model.associate) {
            try {
                model.associate(db);
            } catch (error) {
                console.error(`Erreur d'association pour le modèle ${model.name}:`, error);
                if (env === "production") throw error;
            }
        }
    });

    // Vérification de la connexion avec retry
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
        try {
            await sequelize.authenticate();
            console.log('Connexion à la base de données établie avec succès');
            break;
        } catch (error) {
            retryCount++;
            console.error(`Tentative ${retryCount}/${maxRetries} échouée:`, error);
            if (retryCount === maxRetries) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
    }

} catch (error) {
    console.error('Erreur d'initialisation de la base de données:', error);
    throw error;
}

// Gestion de la fermeture propre des connexions
if (env === "production") {
    process.on('SIGTERM', async () => {
        try {
            await sequelize.close();
            console.log('Connexions à la base de données fermées');
        } catch (err) {
            console.error('Erreur lors de la fermeture des connexions:', err);
        } finally {
            process.exit(0);
        }
    });
}

// Exports
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