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



// Configuration Sequelize optimisée pour Vercel et AWS RDS
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 
  `mysql://${config[env].username}:${config[env].password}@${config[env].host}:${config[env].port}/${config[env].database}`,
  {
      dialect: 'mysql2',
      dialectModule: mysql2,
      logging: env === "development" ? console.log : false,
      dialectOptions: {
        connectTimeout: 60000,
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
      },
      pool: {
          max: 2,
          min: 0,
          acquire: 60000,
          idle: 10000
      }
  }
);


// Initialisation de l'objet db
const db = {
    sequelize,    // Important pour les transactions
    Sequelize,    // Important pour les opérateurs
};

// Chargement des modèles


// Chargement des modèles de manière asynchrone
for (const file of readdirSync(__dirname).filter(file => 
  file.indexOf('.') !== 0 && 
  file !== 'index.js' && 
  file.slice(-3) === '.js'
)) {
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
      if (env === "production") throw error;
      console.error(`Error loading model ${file}:`, error);
  }
}

// Associations
Object.values(db).forEach(model => {
  if (model.associate) model.associate(db);
});



// Verify database connection
// Vérification de la connexion
await sequelize.authenticate()
    .catch(error => {
        console.error('Database connection failed:', error);
        throw error;
    });




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