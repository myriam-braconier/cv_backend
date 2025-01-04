// routes/about.js
import express from 'express';
const router = express.Router();


router.get('/about', async (req, res) => {
  try {
    res.status(200).json({ message: "About page" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;