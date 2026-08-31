import express from 'express';
import { smartSearchAI, aiConcierge, personalizationQuiz } from '../controllers/aiController.js';

const router = express.Router();

router.post('/smart-search', smartSearchAI);
router.post('/concierge', aiConcierge);
router.post('/quiz', personalizationQuiz);

export { router as aiRouter };
