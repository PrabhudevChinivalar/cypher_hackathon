import express from 'express';
import { chatWithAI, analyzeVideo, generateQuestions, generalChat } from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// AI Chat endpoint (course-specific)
router.post('/chat', authenticate, chatWithAI);

// General chat endpoint (any question)
router.post('/general-chat', authenticate, generalChat);

// Video analysis endpoint
router.post('/analyze-video', authenticate, analyzeVideo);

// Generate study questions endpoint
router.post('/generate-questions', authenticate, generateQuestions);

export default router;
