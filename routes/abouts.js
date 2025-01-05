import express from 'express';
import { getAllAbouts, getAbout} from '../controllers/aboutController.js';

const router = express.Router();

router.get('/', getAllAbouts);
router.get('/:id', getAbout);

export default router;