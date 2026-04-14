const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

// Initialize DOMPurify
const window = new JSDOM('').window;
const dompurify = createDOMPurify(window);

// Security Middleware (adapted from shared middleware)
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self' *.googleapis.com *.firebaseio.com *.firebase.com;");
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Main AI Endpoint
/**
 * Handles AI chat queries using Gemini 1.5 Pro.
 * @route POST /ai/chat
 * @param {Object} req - Express request object.
 * @param {Array} req.body.messages - Chat messages history.
 */
app.post('/ai/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Format messages for Gemini (simplistic mapping)
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    const systemInstruction = messages.find(m => m.role === 'system')?.content || '';

    if (!lastUserMessage) {
      return res.status(400).json({ error: 'No user message found' });
    }

    const sanitizedQuery = dompurify.sanitize(lastUserMessage.content);

    const prompt = `${systemInstruction}\n\nUser: ${sanitizedQuery}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error('AI Service Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.get('/health', (req, res) => res.sendStatus(200));

app.listen(port, () => {
  console.log(`AI Service listening on port ${port}`);
});
