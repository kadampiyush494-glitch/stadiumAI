importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
firebase.initializeApp({
  messagingSenderId: "YOUR_SENDER_ID" // Ideally this is injected or hardcoded correctly for SW
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title || 'OmniFlow Update';
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/notif-icon.png',
    badge: '/favicon.svg',
    data: payload.data, // Custom data including routing info
    tag: payload.data?.type || 'general'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const type = event.notification.data?.type;
  let targetUrl = '/dashboard';

  if (type === 'CONGESTION_ALERT') targetUrl = '/dashboard?tab=map';
  if (type === 'QUEUE_UPDATE') targetUrl = '/dashboard?tab=queues';
  if (type === 'EXIT_REMINDER') targetUrl = '/dashboard?tab=exit';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a tab is already open, focus it and navigate
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus().then(() => client.navigate(targetUrl));
        }
      }
      // If no tab is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
