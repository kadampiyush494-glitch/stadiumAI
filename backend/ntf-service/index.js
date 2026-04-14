const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

const messaging = admin.messaging();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Subscribe token to topic
/**
 * Subscribes a registration token to a specific Firebase Cloud Messaging topic.
 * @route POST /notifications/subscribe
 * @param {string} req.body.token - The registration token of the device.
 * @param {string} req.body.topic - The topic name to which the token will be subscribed.
 */
app.post('/notifications/subscribe', async (req, res) => {
  try {
    const { token, topic } = req.body;
    if (!token || !topic) {
        return res.status(400).json({ error: 'Token and topic are required' });
    }
    await messaging.subscribeToTopic(token, topic);
    res.json({ success: true, message: `Subscribed to ${topic}` });
  } catch (error) {
    console.error('Subscription Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send notification to topic or token
/**
 * Sends a notification message to a topic or a specific token.
 * @route POST /notifications/send
 * @param {string} [req.body.topic] - Target topic name.
 * @param {string} [req.body.token] - Target registration token.
 * @param {Object} req.body.notification - The notification payload.
 * @param {Object} [req.body.data] - Additional data payload.
 */
app.post('/notifications/send', async (req, res) => {
  try {
    const { topic, token, notification, data } = req.body;
    
    const message = {
      notification: notification || {
        title: 'OmniFlow Alert',
        body: 'Default alert message'
      },
      data: data || {},
    };

    if (topic) {
        message.topic = topic;
    } else if (token) {
        message.token = token;
    } else {
        return res.status(400).json({ error: 'Topic or token is required' });
    }

    const response = await messaging.send(message);
    res.json({ success: true, response });
  } catch (error) {
    console.error('Send Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => res.sendStatus(200));

app.listen(port, () => {
  console.log(`Notification Service listening on port ${port}`);
});
