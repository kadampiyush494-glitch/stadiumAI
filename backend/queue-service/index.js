const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

const db = admin.firestore();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Endpoint to get predictive high-density zones
/**
 * Analyzes venue zones to predict high-density areas using historical data.
 * @route GET /queues/predictive
 * @returns {Array} List of predicted high-density zones and alert status.
 */
app.get('/queues/predictive', async (req, res) => {
  try {
    const venuesSnapshot = await db.collection('venues').get();
    const predictions = [];

    for (const venueDoc of venuesSnapshot.docs) {
      const zonesSnapshot = await venueDoc.ref.collection('zones').get();
      zonesSnapshot.forEach(zoneDoc => {
        const data = zoneDoc.data();
        // Simple growth rate logic: (current - previous) / interval
        // Assuming history is stored in the doc
        const history = data.history || [];
        if (history.length >= 2) {
          const latest = history[history.length - 1];
          const previous = history[history.length - 2];
          const rate = (latest.density - previous.density) / (latest.timestamp - previous.timestamp);
          
          if (rate > 0.05) { // Arbitrary threshold
             predictions.push({
               venueId: venueDoc.id,
               zoneId: zoneDoc.id,
               growthRate: rate,
               alert: true
             });
          }
        }
      });
    }
    
    res.json(predictions);
  } catch (error) {
    console.error('Prediction Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => res.sendStatus(200));

app.listen(port, () => {
  console.log(`Queue Service listening on port ${port}`);
});
