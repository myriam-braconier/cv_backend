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

// Determine environment and handle Vercel specific configuration
const env = process.env.NODE_ENV || "development";
const sequelizeConfig = {
  ...config[env],
  dialectModule: await import('mysql2'), // Important for Vercel deployment
  dialectOptions: {
    ...config[env].dialectOptions,
    ssl: env === "production" ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
};



// Initialize Sequelize with SSL configuration for production en ES6
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 
  `mysql://${sequelizeConfig.username}:${sequelizeConfig.password}@${sequelizeConfig.host}:${sequelizeConfig.port}/${sequelizeConfig.database}`,
  {
      ...sequelizeConfig,
      dialect: 'mysql2',
      dialectModule: mysql2,
      logging: env === "development" ? console.log : false,
      dialectOptions: {
          ssl: {
              require: true,
              rejectUnauthorized: false
          }
      },
      pool: {
          max: 2,
          min: 0,
          idle: 0,
          acquire: 3000,
          evict: 30000
      }
  }
);


// Initialisation de l'objet db
const db = {
    sequelize,    // Important pour les transactions
    Sequelize,    // Important pour les opérateurs
};

// Chargement des modèles
const modelFiles = readdirSync(__dirname)
    .filter(file =>
        file.indexOf('.') !== 0 &&
        file !== 'index.js' &&
        file.slice(-3) === '.js'
    );

// Import et initialisation des modèles
for (const file of modelFiles) {
    try {


        if (env === "development") {
            console.log(`Loading model from file: ${file}`);
          }


        const modelPath = `file://${path.join(__dirname, file)}`;
        const model = await import(modelPath);
        
        const initFunction = model.default || model.initModel;
        
        if (typeof initFunction !== 'function') {
            console.error(`⚠️ Le fichier ${file} n'a pas de fonction d'initialisation valide`);
            continue;
        }

        const modelInstance = initFunction(sequelize, Sequelize.DataTypes);
        
        if (!modelInstance || !modelInstance.name) {
            console.error(`⚠️ Le modèle dans ${file} n'a pas retourné une instance valide`);
            console.log('Instance reçue:', modelInstance);
            continue;
        }

        // Stockage du modèle dans db avec la première lettre en majuscule
        const modelName = modelInstance.name.charAt(0).toUpperCase() + modelInstance.name.slice(1);
        db[modelName] = modelInstance;

        if (env === "development") {
            console.log(`Successfully loaded model: ${modelName}`);
          }



    } catch (error) {
        console.error(`❌ Erreur lors du chargement de ${file}:`, error);
        if (env === "production") {
            throw error;
          }
    }
}

// Associations
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});



// Verify database connection
try {
    await sequelize.authenticate();
    if (env === "development") {
      console.log('Database connection established successfully.');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error; // Critical error, should stop deployment
  }




// Export de l'objet db
export default db;

// Export des modèles individuels si nécessaire
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