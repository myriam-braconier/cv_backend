import express from 'express';
import db from '../models/index.js';
import app from '../app.js';

const app = express();
app.use(express.json());

// Vérifier que db est correctement importé
console.log('DB Status:', {
    isConnected: db.sequelize?.authenticate ? true : false,
    models: Object.keys(db)
});

// Configuration des routes
app.get('/api', (req, res) => {
    res.json({ message: 'API fonctionne' });
});


// Export pour Vercel
export default function handler(req, res) {
    return app(req, res);
}

