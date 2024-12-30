import express from 'express';
import db from '../models/index.js';

const app = express();
app.use(express.json());

// Vérifier que db est correctement importé
console.log('DB Status:', {
    isConnected: db.sequelize?.authenticate ? true : false,
    models: Object.keys(db)
});

// Configuration des routes
app.get('/api/test', (req, res) => {
    res.json({ message: 'API fonctionne' });
});

// Export pour Vercel
export default async function handler(req, res) {
    try {
        await db.sequelize.authenticate();
        return app(req, res);
    } catch (error) {
        console.error('Database connection failed:', error);
        return res.status(500).json({ error: 'Database connection failed' });
    }
}
