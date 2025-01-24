// models/index.js
import { Sequelize, DataTypes } from 'sequelize';
import { fileURLToPath } from "url";
import { dirname } from "path";
import { readdirSync } from "fs";
import dotenv from "dotenv";
import mysql2 from "mysql2";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

const sequelize = new Sequelize(
   process.env.DATABASE_URL ||
   `mysql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${
       process.env.DB_HOST
   }:${process.env.DB_PORT || 3306}/${process.env.DB_DATABASE}`,
   defaultConfig
);

const models = {};

const modelFiles = readdirSync(__dirname).filter(
   (file) =>
       file.indexOf(".") !== 0 &&
       file !== "index.js" &&
       file.slice(-3) === ".js"
);

for (const file of modelFiles) {
   const modelPath = new URL(file, import.meta.url).href;
   const model = await import(modelPath);
   const initFunction = model.default || model.initModel;
   
   if (typeof initFunction === "function") {
       const modelInstance = initFunction(sequelize, DataTypes);
       if (modelInstance?.name) {
           models[modelInstance.name] = modelInstance;
       }
   }
}

Object.values(models).forEach((model) => {
   if (model.associate) {
       model.associate(models);
   }
});

try {
   await sequelize.authenticate();
   console.log("Base de données connectée avec succès!");
   console.log("Modèles chargés:", Object.keys(models));
} catch (error) {
   console.error("Erreur de connexion:", error);
}

const db = { sequelize, Sequelize, ...models };

export const {
   User,
   Role,
   Profile,
   Post,
   Permission,
   AdminActionLog,  
   AuctionPrice,
   Synthetiser,
   RolePermission
} = db;

export default db;