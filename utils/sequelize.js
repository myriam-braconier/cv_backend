import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import mysql2 from "mysql2";
import config from "../config/config.js";

// Charger le bon fichier .env selon NODE_ENV
dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.production" : ".env",
});

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env] || {};

// Priorité aux variables d'environnement directes
const database = process.env.DB_DATABASE || dbConfig.database;
const username = process.env.DB_USERNAME || dbConfig.username;
const password = process.env.DB_PASSWORD || dbConfig.password;
const host = process.env.DB_HOST || dbConfig.host || "127.0.0.1";
const port = Number(process.env.DB_PORT) || dbConfig.port || 3306;

// Debug pour vérifier que les variables sont bien chargées
console.log("Config Debug:", {
  env,
  database,
  username,
  host,
  port,
});

const sequelizeConfig = {
  dialect: "mysql",
  dialectModule: mysql2,
  logging: env === "development" ? console.log : false,
  pool: {
    max: 15,
    min: 0,
    acquire: 60000,
    idle: 10000,
  },
  dialectOptions: {
    connectTimeout: 60000,
    ssl:
      env === "production"
        ? {
            require: true,
            rejectUnauthorized: false,
          }
        : false,
  },
  host,
  port,
};

const sequelize = new Sequelize(database, username, password, sequelizeConfig);

// Gestion propre de fermeture sur signaux
const handleShutdown = async () => {
  try {
    await sequelize.close();
    console.log("Connexions fermées avec succès");
    process.exit(0);
  } catch (err) {
    console.error("Erreur lors de la fermeture des connexions:", err);
    process.exit(1);
  }
};

process.on("SIGTERM", handleShutdown);
process.on("SIGINT", handleShutdown);

const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log(`Base de données connectée avec succès en mode ${env}`);
  } catch (error) {
    console.error("Impossible de se connecter à la base de données:", error);
    if (env === "production") {
      process.exit(1);
    }
  }
};
initializeDatabase();

export default sequelize;
