// Firebase Cloud Messaging Service Worker

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Store Firebase config
let firebaseConfig = null;

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    firebaseConfig = event.data.config;
    
    // Initialize Firebase with the received config
    firebase.initializeApp(firebaseConfig);
    
    // Get Firebase Messaging instance
    const messaging = firebase.messaging();
    
    // Set up background message handler
    setupBackgroundMessageHandler(messaging);
  }
});

// Initialize with default config if available from environment
if (!firebaseConfig && self.firebase) {
  try {
    // Fallback initialization with environment variables
    // This is a backup in case the message-based approach fails
    firebase.initializeApp({
      apiKey: self.FIREBASE_API_KEY,
      authDomain: self.FIREBASE_AUTH_DOMAIN,
      projectId: self.FIREBASE_PROJECT_ID,
      storageBucket: self.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID,
      appId: self.FIREBASE_APP_ID,
      measurementId: self.FIREBASE_MEASUREMENT_ID
    });
    
    const messaging = firebase.messaging();
    setupBackgroundMessageHandler(messaging);
  } catch (error) {
    console.error('Failed to initialize Firebase in service worker:', error);
  }
}

// Function to set up background message handler
function setupBackgroundMessageHandler(messaging) {
  messaging.onBackgroundMessage((payload) => {
    console.log('Received background message:', payload);

    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: '/vite.svg',
      badge: '/vite.svg',
      data: payload.data,
      tag: payload.data?.notificationId || 'default',
      actions: [
        {
          action: 'view',
          title: 'View'
        }
      ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then((clientList) => {
      // Get notification data
      const notificationData = event.notification.data;
      
      // Determine target URL based on notification type
      let targetUrl = '/';
      
      if (notificationData) {
        if (notificationData.type === 'new_message') {
          targetUrl = `/messages/${notificationData.senderId}`;
        } else if (notificationData.type === 'new_match') {
          targetUrl = `/matches/${notificationData.matchId}`;
        } else if (notificationData.type === 'verification_complete') {
          targetUrl = `/verification/${notificationData.reportId}`;
        } else if (notificationData.type === 'video_call_invitation') {
          targetUrl = `/calls/${notificationData.callId}`;
        }
      }
      
      // If we already have a window open, focus it and navigate
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});