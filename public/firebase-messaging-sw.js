// Firebase Cloud Messaging Service Worker

importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

// Store Firebase config
let firebaseConfig = null;
let firebaseInitialized = false;

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    firebaseConfig = event.data.config;
    console.log('Received Firebase config in service worker');
    
    // Initialize Firebase if not already initialized
    if (!firebaseInitialized) {
      try {
        firebase.initializeApp(firebaseConfig);
        firebaseInitialized = true;
        console.log('Firebase initialized in service worker');
        
        // Get Firebase Messaging instance
        const messaging = firebase.messaging();
        
        // Set up background message handler
        setupBackgroundMessageHandler(messaging);
        
        // Acknowledge receipt of config
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ type: 'FIREBASE_CONFIG_RECEIVED' });
        }
      } catch (error) {
        console.error('Failed to initialize Firebase in service worker:', error);
      }
    }
  }
});
    
// Initialize with default config if available from environment (fallback)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // If Firebase wasn't initialized via message, try with self variables
      if (!firebaseInitialized && self.FIREBASE_CONFIG) {
        try {
          const config = JSON.parse(self.FIREBASE_CONFIG);
          firebase.initializeApp(config);
          firebaseInitialized = true;
          console.log('Firebase initialized in service worker from self variables');
          
          const messaging = firebase.messaging();
          setupBackgroundMessageHandler(messaging);
        } catch (error) {
          console.error('Failed to initialize Firebase from self variables:', error);
        }
      }
    })()
  );
});

// Fallback initialization if needed
if (!firebaseInitialized && self.firebase) {
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
    firebaseInitialized = true;
    setupBackgroundMessageHandler(messaging);
  } catch (error) {
    console.error('Failed to initialize Firebase in service worker:', error);
  }
}

// Function to set up background message handler
function setupBackgroundMessageHandler(messaging) {
  messaging.onBackgroundMessage((payload) => {
    console.log('[Firebase] Received background message:', payload);

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
  const action = event.action;
  
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
      
      if (notificationData && notificationData.type) {
        const type = notificationData.type;
        
        if (type === 'new_message') {
          targetUrl = `/messages/${notificationData.senderId}`;
        } else if (type === 'new_match') {
          targetUrl = `/matches/${notificationData.matchId}`;
        } else if (type === 'verification_complete') {
          targetUrl = `/verification/${notificationData.reportId}`;
        } else if (type === 'video_call_invitation') {
          targetUrl = `/calls/${notificationData.callId}`;
        }
      } else if (action === 'view' && event.notification.data) {
        // Handle action-specific navigation
        const actionData = event.notification.data;
        if (actionData.url) {
          targetUrl = actionData.url;
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

// Handle push event directly
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    console.log('[Service Worker] Push received:', data);
    
    // If we have notification data in the push message
    if (data.notification) {
      const notificationTitle = data.notification.title || 'New Notification';
      const notificationOptions = {
        body: data.notification.body || '',
        icon: data.notification.icon || '/vite.svg',
        badge: data.notification.badge || '/vite.svg',
        data: data.data || {},
        tag: data.data?.notificationId || 'default'
      };
      
      event.waitUntil(
        self.registration.showNotification(notificationTitle, notificationOptions)
      );
    }
  } catch (error) {
    console.error('[Service Worker] Error handling push event:', error);
  }
});