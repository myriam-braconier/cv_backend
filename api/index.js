
import db from '../models/index.js';
import app from '../app.js';
import express from 'express';


// Vérifier que db est correctement importé
console.log('DB Status:', {
    isConnected: db.sequelize?.authenticate ? true : false,
    models: Object.keys(db)
});


// Export pour Vercel
export default function handler(req, res) {
    return app(req, res);
}

