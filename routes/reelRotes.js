import express from 'express';
import { getRandomReels } from '../controllers/reelController.js';

const router = express.Router();

router.get('/', getRandomReels);

export default router;
