import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from 'path';

dotenv.config(); // Charger les variables d'environnement

const env = process.env.NODE_ENV || "development";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (env === 'development') {
  console.log('====== Config Debug ======');
  console.log('Environment:', env);
  console.log('Config loaded:', {
    username: process.env.DB_USERNAME,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
  });
  console.log('========================');
}

const baseConfig = {
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  retry: {
    max: 3,
    timeout: 3000
  },
};

// Configuration par environnement
const config = {
  development: {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'ma_base_locale',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: console.log,
    pool: { ...baseConfig.pool },
    retry: { ...baseConfig.retry },
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: process.env.DB_DIALECT || 'mysql', // ou 'postgres' si prod postgres
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
    pool: { ...baseConfig.pool },
    retry: { ...baseConfig.retry },
  },
  test: {
    username: process.env.DB_TEST_USERNAME || 'root',
    password: process.env.DB_TEST_PASSWORD || null,
    database: process.env.DB_TEST_DATABASE || 'test_database',
    host: process.env.DB_TEST_HOST || '127.0.0.1',
    port: process.env.DB_TEST_PORT || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false,
    pool: { max: 1, min: 0, acquire: 30000, idle: 10000 },
  }
};

const currentConfig = config[env];
if (!currentConfig) {
  throw new Error(`Configuration non trouvée pour l'environnement: ${env}`);
}

export default config;
export const currentEnvConfig = currentConfig;
