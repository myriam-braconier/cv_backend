import express from 'express';
import About from '../models/about.js';

const router = express.Router();

router.get('/about', async (req, res) => {
  try {
    const aboutData = await About.findAll();
    res.status(200).json(aboutData);
  } catch (error) {
    console.error('Erreur lors de la récupération des données About:', error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;