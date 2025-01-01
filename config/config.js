import { fileURLToPath } from "url";
import { dirname } from 'path';
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger le bon fichier .env selon l'environnement
const env = process.env.NODE_ENV || 'development';
dotenv.config({
    path: path.resolve(__dirname, `../.env.${env}`)
});

// Configuration Debug
console.log('====== Config Debug ======');
console.log('Environment:', env);
console.log('Config loaded:', {
    username: process.env.DB_USERNAME,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql'
});
console.log('========================');

// Configuration de base commune
const baseConfig = {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    pool: {
        max: 2,         // Limite le nombre de connexions
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    dialectOptions: {
        connectTimeout: 60000,
        // Ajout d'une gestion des timeouts de requête
        requestTimeout: 30000,
        // Paramètres de connexion plus stricts
        connectionLimit: 10,
        queueLimit: 0,
        // Gestion des déconnexions
        keepAlive: true,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000
    },
    retry: {
        max: 3,         // Nombre maximum de tentatives de reconnexion
        timeout: 3000   // Délai entre les tentatives
    }
};

// Configuration d'export
const config = {
    development: {
        ...baseConfig,
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 3306,
        logging: console.log,
        pool: {
            ...baseConfig.pool,
            max: 5      // Plus de connexions en développement
        }
    },
    production: {
        ...baseConfig,
        port: process.env.DB_PORT || 3306,
        logging: false, // Désactive les logs en production
        pool: {
            ...baseConfig.pool,
            max: 2      // Limite stricte en production
        },
        dialectOptions: {
            ...baseConfig.dialectOptions,
            ssl: {
                require: true,
                rejectUnauthorized: false // À ajuster selon votre configuration SSL
            }
        }
    },
    test: {
        ...baseConfig,
        database: process.env.DB_TEST_DATABASE || 'test_database',
        logging: false,
        pool: {
            ...baseConfig.pool,
            max: 1      // Connexion unique pour les tests
        }
    }
};

// Validation de la configuration
const currentConfig = config[env];
if (!currentConfig) {
    throw new Error(`Configuration non trouvée pour l'environnement: ${env}`);
}

// Vérification des variables d'environnement requises
const requiredEnvVars = ['DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE', 'DB_HOST'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    throw new Error(`Variables d'environnement manquantes: ${missingEnvVars.join(', ')}`);
}

export default config;

// Export de la configuration courante pour un accès facile
export const currentEnvConfig = config[env];