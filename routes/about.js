import express from 'express';
import { models } from '../models/index.js';

const router = express.Router();

router.get('/about', async (req, res) => {
  try {
    const aboutData = await models.About.findAll();
    res.json(aboutData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;