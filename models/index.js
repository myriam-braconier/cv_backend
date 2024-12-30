// models/index.js
import { Sequelize } from "sequelize";
import { fileURLToPath } from "url";
import { dirname } from 'path';
import { readdirSync } from 'fs';
import path from "path";
import dotenv from "dotenv";
import config from "../config/config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const env = process.env.NODE_ENV || "development";
dotenv.config();





// Création de l'instance Sequelize
const sequelize = new Sequelize(
    config[env].database,
    config[env].username,
    config[env].password,
    config[env]
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
        console.log(`\nTraitement du fichier: ${file}`);
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
        console.log(`✓ Modèle ${modelName} chargé avec succès`);
    } catch (error) {
        console.error(`❌ Erreur lors du chargement de ${file}:`, error);
    }
}

// Associations
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
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