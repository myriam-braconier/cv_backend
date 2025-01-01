import dotenv from "dotenv";
dotenv.config();

const env = process.env.NODE_ENV || 'development';

// Configuration Debug
console.log('====== Config Debug ======');
console.log('Environment:', env);
console.log('Config loaded:', {
    username: process.env.DB_USERNAME,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: env === 'development' ? 4000 : 3306, // Simplifié la condition
    dialect: process.env.DB_DIALECT
});
console.log('========================');

// Configuration d'export
const config = {
    development: {
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE || 'concrete_database',
        host: process.env.DB_HOST || '127.0.0.1',
        port: 3306,
        dialect: process.env.DB_DIALECT || 'mysql',
        dialectOptions: {
            connectTimeout: 60000 // Timeout augmenté pour la connexion
        }
    },
    production: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        host: process.env.DB_HOST,
        port: 3306,
        dialect: process.env.DB_DIALECT || 'mysql',
        dialectOptions: {
            connectTimeout: 30000
        }
    }
};

export default config;