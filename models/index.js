// index.js - chargement des modèles
import { DataTypes } from "sequelize";
import { readdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sequelize from "../utils/sequelize.js";  // Import singleton Sequelize

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const models = {};

// Lire tous les fichiers .js sauf index.js dans ce dossier
const modelFiles = readdirSync(__dirname).filter(
  (file) =>
    file.indexOf(".") !== 0 && file !== "index.js" && file.endsWith(".js")
);

for (const file of modelFiles) {
  const modelPath = join(__dirname, file);
  const modelModule = await import(`file://${modelPath}`);
  const initFn = modelModule.default || modelModule.initModel;

  if (typeof initFn === "function") {
    const model = initFn(sequelize, DataTypes);
    if (model?.name) {
      models[model.name] = model;
    }
  }
}

// Gérer les associations entre modèles
Object.values(models).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(models);
  }
});

// Vérifier la connexion (optionnel, déjà fait dans sequelize.js)
try {
  await sequelize.authenticate();
  console.log("Connexion à la base de données réussie!");
  console.log("Modèles chargés:", Object.keys(models));
} catch (error) {
  console.error("Erreur de connexion à la base:", error);
}

const db = { sequelize, ...models };

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

export default db;
