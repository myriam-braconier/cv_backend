// models/index.js
import { Sequelize, DataTypes } from "sequelize";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { readdirSync } from "fs";
import dotenv from "dotenv";
import mysql2 from "mysql2";

// Charger les variables d'environnement selon l'environnement NODE_ENV
dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.production" : ".env",
});

// Obtention des chemins pour les imports dynamiques
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mode (prod/dev)
const env = process.env.NODE_ENV || "development";

// Log pour debug de la variable d'environnement
console.log("DATABASE_URL:", process.env.DATABASE_URL);

// Vérifier la présence de DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error("La variable d'environnement DATABASE_URL n'est pas définie.");
}

// Configuration par défaut commune
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
    ssl:
      env === "production"
        ? {
            require: true,
            rejectUnauthorized: false,
          }
        : false,
  },
};

// Création de l'instance Sequelize avec la variable d'environnement complète
const sequelize = new Sequelize(process.env.DATABASE_URL, defaultConfig);

// Objet pour stocker les modèles
const models = {};

// Récupération et import dynamique des fichiers modèles dans le dossier
const modelFiles = readdirSync(__dirname).filter(
  (file) => file.indexOf(".") !== 0 && file !== "index.js" && file.endsWith(".js")
);

// Import asynchrone des modèles et initialisation avec Sequelize
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

// Gestion des associations entre modèles
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

// Vérification de la connexion à la base
try {
  await sequelize.authenticate();
  console.log("Base de données connectée avec succès!");
  console.log("Modèles chargés:", Object.keys(models));
} catch (error) {
  console.error("Erreur de connexion:", error);
}

// Création de l'objet db regroupant Sequelize et les modèles
const db = { sequelize, Sequelize, ...models };

// Export nommé des modèles utiles
export const {
  User,
  Role,
  Profile,
  Post,
  Permission,
  AdminActionLog,
  AuctionPrice,
  Synthetiser,
  RolePermission,
} = db;

// Export par défaut
export default db;
