import express from 'express';
import { getRandomReels,addReel } from '../controllers/reelsController.js';

const router = express.Router();

router.get('/', getRandomReels);
router.post('/', addReel);

export default router;
