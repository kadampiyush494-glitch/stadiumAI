import DOMPurify from 'dompurify';

const MAX_QUERIES = 10;
const TIME_WINDOW_MS = 60000;
let requestTimestamps = [];

export const buildContextString = (context) => {
  const { zone, time, densityMap, facilities } = context || {};
  return `Context: User is in zone ${zone || 'unknown'}. Time: ${time || 'unknown'}. Density: ${densityMap || 'unknown'}. Facilities: ${JSON.stringify(facilities || {})}.`;
};

export const sanitizeInput = (input) => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
};

export const resetRateLimit = () => {
  requestTimestamps = [];
};

export const callAssistant = async (query, context) => {
  const now = Date.now();
  requestTimestamps = requestTimestamps.filter(t => now - t < TIME_WINDOW_MS);
  
  if (requestTimestamps.length >= MAX_QUERIES) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }
  
  const cleanQuery = sanitizeInput(query);
  if (!cleanQuery.trim()) {
    throw new Error('Invalid or empty query after sanitization.');
  }

  requestTimestamps.push(now);

  const systemPrompt = "You are OmniFlow, a stadium navigation assistant. Answer only about stadium navigation, crowd flow, and facilities. Be concise (max 2 sentences). Always suggest the least crowded option.";
  const contextString = buildContextString(context);
  
  // Endpoint URL, fall back to environment variable
  const endpoint = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8080/ai/chat';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: `${systemPrompt}\n${contextString}` },
          { role: 'user', content: cleanQuery }
        ]
      })
    });
    
    if (!response.ok) {
       throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.reply;
  } catch (error) {
    throw new Error(`AI Service Error: ${error.message}`);
  }
};
