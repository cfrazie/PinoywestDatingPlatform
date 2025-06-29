import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { notificationService } from '../services/notificationService';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let firebaseApp;
let messaging;

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

if (isBrowser) {
  try {
    firebaseApp = initializeApp(firebaseConfig);
    
    // Initialize Firebase Cloud Messaging
    if ('serviceWorker' in navigator) {
      messaging = getMessaging(firebaseApp);
      
      // Register service worker with dynamic configuration
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service worker registered:', registration);
          
          // Pass Firebase config to service worker
          navigator.serviceWorker.ready.then((serviceWorkerRegistration) => {
            // Create a message channel
            const messageChannel = new MessageChannel();
            
            // Send Firebase config to the service worker
            serviceWorkerRegistration.active.postMessage({
              type: 'FIREBASE_CONFIG',
              config: firebaseConfig
            }, [messageChannel.port2]);
          });
        })
        .catch((error) => {
          console.error('Service worker registration failed:', error);
        });
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

/**
 * Request permission and get FCM token
 */
export const requestNotificationPermission = async (userId: string): Promise<string | null> => {
  if (!messaging) return null;
  
  try {
    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.log('Notification permission not granted');
      return null;
    }
    
    // Get token
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
    });
    
    if (token) {
      console.log('FCM Token:', token);
      
      // Register token with backend
      await notificationService.registerDeviceToken(
        userId,
        token,
        'web',
        navigator.userAgent
      );
      
      return token;
    } else {
      console.log('No registration token available');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

/**
 * Set up foreground message handler
 */
export const setupForegroundNotifications = (callback: (payload: any) => void) => {
  if (!messaging) return;
  
  // Handle foreground messages
  onMessage(messaging, (payload) => {
    console.log('Message received in foreground:', payload);
    callback(payload);
  });
};

/**
 * Unregister FCM token
 */
export const unregisterNotifications = async (userId: string, token: string): Promise<boolean> => {
  try {
    return await notificationService.unregisterDeviceToken(userId, token);
  } catch (error) {
    console.error('Error unregistering FCM token:', error);
    return false;
  }
};

export default { requestNotificationPermission, setupForegroundNotifications, unregisterNotifications };