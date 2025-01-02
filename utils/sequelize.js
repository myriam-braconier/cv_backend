import { Sequelize } from "sequelize";
import config from "../config/config.js";
import dotenv from "dotenv";

dotenv.config();

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host || '127.0.0.1',
        dialect: dbConfig.dialect || 'mysql',
        port: process.env.DB_PORT || 3306,  // Ajout du port par défaut
        pool: {
            max: 15,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        logging: env === "development" ? console.log : false,
        dialectOptions: {
            connectTimeout: 60000,
            ssl: env === "production" ? {
                require: true,
                rejectUnauthorized: false
            } : false
        }
    }
);

// Gestion de la fermeture propre
const handleShutdown = async () => {
    try {
        await sequelize.close();
        console.log('Connexions fermées avec succès');
        process.exit(0);
    } catch (err) {
        console.error('Erreur lors de la fermeture des connexions:', err);
        process.exit(1);
    }
};

process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);

// Initialisation de la base de données
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
