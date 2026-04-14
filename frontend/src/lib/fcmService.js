import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, app } from './firebase';

const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export const NOTIFICATION_TYPES = {
  CONGESTION_ALERT: 'CONGESTION_ALERT',
  QUEUE_UPDATE: 'QUEUE_UPDATE',
  EXIT_REMINDER: 'EXIT_REMINDER',
  EMERGENCY: 'EMERGENCY'
};

/**
 * Requests notification permission and registers for FCM.
 * @param {string} userId - Current user ID to link token.
 */
export const initNotifications = async (userId) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return;
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
    });

    if (token) {
      // Register token in Firestore
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        fcmTokens: arrayUnion(token),
        updatedAt: new Date().toISOString()
      });
      console.log('FCM Token registered');
    }
  } catch (error) {
    console.error('Error initializing notifications:', error);
  }
};

/**
 * Subscribes user to a venue-specific topic.
 * (Usually handled via backend or Client SDK Topic management if configured)
 */
export const subscribeToVenue = async (venueId) => {
  // Logic to call backend endpoint to subscribe the token to a topic
  // Since Client SDK doesn't support subscribeToTopic directly for web for security reasons
  const endpoint = `${import.meta.env.VITE_API_BASE_URL}/notifications/subscribe`;
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ venueId, topic: `venue_${venueId}` })
    });
  } catch (err) {
    console.error('Topic subscription failed:', err);
  }
};

/**
 * Sends notification (Client-side helper to trigger backend notification)
 */
export const sendNotification = async (payload) => {
  const endpoint = `${import.meta.env.VITE_API_BASE_URL}/notifications/send`;
  try {
    if (payload.type === NOTIFICATION_TYPES.EMERGENCY && navigator.vibrate) {
       navigator.vibrate([200, 100, 200, 100, 400]);
    }

    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error('Notification dispatch failed:', err);
  }
};

/**
 * Listen for foreground messages
 */
export const onForegroundMessage = (callback) => {
  if (!messaging) return;
  return onMessage(messaging, (payload) => {
    if (payload.data?.type === NOTIFICATION_TYPES.EMERGENCY && navigator.vibrate) {
        navigator.vibrate([300, 100, 300]);
    }
    callback(payload);
  });
};
