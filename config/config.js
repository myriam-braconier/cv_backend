import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from 'path';
import path from "path";





const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Détecter l'environnement Vercel
const isVercel = process.env.VERCEL === '1';
const env = process.env.NODE_ENV || 'development';

// Charger les variables d'environnement uniquement en local
if (!isVercel) {
  dotenv.config({
    path: path.resolve(__dirname, `../.env.${env}`)
  });
}

// Debug uniquement en développement
if (env === 'development') {
  console.log('====== Config Debug ======');
  console.log('Environment:', env);
  console.log('Running on Vercel:', isVercel);
  console.log('Config loaded:', {
    username: process.env.DB_USERNAME,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql'
  });
  console.log('========================');
}

// Configuration de base commune
const baseConfig = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  dialect: 'mysql',
  pool: {
    max: 2,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    connectTimeout: 60000,
    requestTimeout: 30000,
    connectionLimit: 10,
    queueLimit: 0,
    keepAlive: true,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    ssl: isVercel ? {  // Configuration SSL spécifique pour AWS RDS
      require: true,
      rejectUnauthorized: false // Permettre les certificats auto-signés en prod
    } : false
  },
  retry: {
    max: 3,
    timeout: 3000
  }
};

// Configuration spécifique par environnement
const config = {
  development: {
    ...baseConfig,
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    logging: console.log,
    pool: {
      ...baseConfig.pool,
      max: 5
    }
  },
  production: {
    ...baseConfig,
    port: process.env.DB_PORT || 3306,
    logging: false,
    pool: {
      ...baseConfig.pool,
      max: 2
    }
  },
  test: {
    ...baseConfig,
    database: process.env.DB_TEST_DATABASE || 'test_database',
    logging: false,
    pool: {
      ...baseConfig.pool,
      max: 1
    }
  }
};

// Validation uniquement si pas sur Vercel CLI (car Vercel gère ses propres variables d'environnement)
if (!isVercel) {
  const requiredEnvVars = ['DB_USERNAME', 'DB_DATABASE', 'DB_HOST'];
  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingEnvVars.length > 0) {
    throw new Error(`Variables d'environnement manquantes: ${missingEnvVars.join(', ')}`);
  }
}

// Vérification de la configuration
const currentConfig = config[env];
if (!currentConfig) {
  throw new Error(`Configuration non trouvée pour l'environnement: ${env}`);
}

export default config;
export const currentEnvConfig = config[env];