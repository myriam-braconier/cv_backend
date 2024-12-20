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

const db = {};

const sequelize = new Sequelize(
    config[env].database,
    config[env].username,
    config[env].password,
    config[env]
);

// Chargement des modèles
const modelFiles = readdirSync(__dirname)
    .filter(file => 
        file.indexOf('.') !== 0 && 
        file !== 'index.js' && 
        file.slice(-3) === '.js'
    );

// Import et initialisation des modèles avec gestion des erreurs
for (const file of modelFiles) {
    try {
        console.log(`\nTraitement du fichier: ${file}`);
        const modelPath = `file://${path.join(__dirname, file)}`;
        const model = await import(modelPath);
        
        console.log('Module importé:', model);
        
        // Vérifie si le modèle a un export par défaut
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

        db[modelInstance.name] = modelInstance;
        console.log(`✓ Modèle ${modelInstance.name} chargé avec succès`);

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
// ajout de sequelize à db
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Export de l'objet db complet et des modèles individuels
export const models = {
    sequelize,
    user: db.user,
    role: db.role,
    permission: db.permission,
    userRole: db.userRole,
    synthetisers: db.synthetiser,
    
};

export default db;