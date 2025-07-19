import { useState, useEffect, useCallback } from 'react';
import { AppError, createAppError, OfflineError } from '../lib/errorHandling';

interface OfflineQueueItem {
  id: string;
  action: string;
  data: any;
  timestamp: string;
  retryCount: number;
  maxRetries: number;
}

interface OfflineState {
  isOnline: boolean;
  queueSize: number;
  isProcessingQueue: boolean;
  lastSyncTime: string | null;
}

export const useOfflineSupport = () => {
  const [state, setState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    queueSize: 0,
    isProcessingQueue: false,
    lastSyncTime: localStorage.getItem('lastSyncTime')
  });

  const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>([]);

  // Load queue from localStorage on mount
  useEffect(() => {
    const savedQueue = localStorage.getItem('offlineQueue');
    if (savedQueue) {
      try {
        const queue = JSON.parse(savedQueue);
        setOfflineQueue(queue);
        setState(prev => ({ ...prev, queueSize: queue.length }));
      } catch (error) {
        console.warn('Failed to load offline queue:', error);
      }
    }
  }, []);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('offlineQueue', JSON.stringify(offlineQueue));
    setState(prev => ({ ...prev, queueSize: offlineQueue.length }));
  }, [offlineQueue]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      processQueue();
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Add action to offline queue
  const queueAction = useCallback((
    action: string,
    data: any,
    maxRetries: number = 3
  ): string => {
    const id = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const queueItem: OfflineQueueItem = {
      id,
      action,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      maxRetries
    };

    setOfflineQueue(prev => [...prev, queueItem]);
    return id;
  }, []);

  // Remove action from queue
  const removeFromQueue = useCallback((id: string) => {
    setOfflineQueue(prev => prev.filter(item => item.id !== id));
  }, []);

  // Process offline queue
  const processQueue = useCallback(async () => {
    if (!navigator.onLine || offlineQueue.length === 0) {
      return;
    }

    setState(prev => ({ ...prev, isProcessingQueue: true }));

    const processedItems: string[] = [];
    const failedItems: OfflineQueueItem[] = [];

    for (const item of offlineQueue) {
      try {
        // Execute the queued action
        await executeQueuedAction(item);
        processedItems.push(item.id);
      } catch (error) {
        console.warn(`Failed to process queued action ${item.action}:`, error);
        
        // Increment retry count
        const updatedItem = {
          ...item,
          retryCount: item.retryCount + 1
        };

        // If max retries reached, remove from queue
        if (updatedItem.retryCount >= updatedItem.maxRetries) {
          processedItems.push(item.id);
        } else {
          failedItems.push(updatedItem);
        }
      }
    }

    // Update queue - remove processed items and update failed items
    setOfflineQueue(prev => {
      const remaining = prev.filter(item => !processedItems.includes(item.id));
      return [...remaining.filter(item => !failedItems.find(f => f.id === item.id)), ...failedItems];
    });

    setState(prev => ({
      ...prev,
      isProcessingQueue: false,
      lastSyncTime: new Date().toISOString()
    }));

    localStorage.setItem('lastSyncTime', new Date().toISOString());
  }, [offlineQueue]);

  // Execute a queued action (this would be customized based on your app's needs)
  const executeQueuedAction = async (item: OfflineQueueItem): Promise<void> => {
    switch (item.action) {
      case 'SUBMIT_CONTACT_FORM':
        const { submitContactFormSecure } = await import('../services/secureApi');
        await submitContactFormSecure(item.data);
        break;
      
      case 'SUBSCRIBE_NEWSLETTER':
        const { subscribeToNewsletterSecure } = await import('../services/secureApi');
        await subscribeToNewsletterSecure(item.data);
        break;
      
      case 'TRACK_EVENT':
        const { trackEventSecure } = await import('../services/secureApi');
        await trackEventSecure(item.data.eventType, item.data.eventData);
        break;
      
      case 'SEND_MESSAGE':
        // Implement message sending logic
        console.log('Sending queued message:', item.data);
        break;
      
      default:
        throw new Error(`Unknown action type: ${item.action}`);
    }
  };

  // Execute action with offline support
  const executeWithOfflineSupport = useCallback(async <T>(
    action: string,
    fn: () => Promise<T>,
    data?: any,
    fallbackData?: any
  ): Promise<T | null> => {
    if (!navigator.onLine) {
      // Queue the action for later
      queueAction(action, data || fallbackData);
      throw new OfflineError('Action queued for when you\'re back online');
    }

    try {
      return await fn();
    } catch (error) {
      // If it's a network error and we have data to queue, queue it
      if (error instanceof Error && error.name === 'NetworkError' && data) {
        queueAction(action, data);
        throw new OfflineError('Action queued due to network error');
      }
      throw error;
    }
  }, [queueAction]);

  // Get cached data for offline use
  const getCachedData = useCallback((key: string): any => {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('Failed to get cached data:', error);
      return null;
    }
  }, []);

  // Cache data for offline use
  const setCachedData = useCallback((key: string, data: any, ttl?: number): void => {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
        ttl: ttl || 24 * 60 * 60 * 1000 // 24 hours default
      };
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }, []);

  // Check if cached data is still valid
  const isCacheValid = useCallback((key: string): boolean => {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      if (!cached) return false;
      
      const cacheItem = JSON.parse(cached);
      return Date.now() - cacheItem.timestamp < cacheItem.ttl;
    } catch (error) {
      return false;
    }
  }, []);

  // Clear expired cache
  const clearExpiredCache = useCallback(() => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache_') && !isCacheValid(key.replace('cache_', ''))) {
        localStorage.removeItem(key);
      }
    });
  }, [isCacheValid]);

  // Manual sync
  const sync = useCallback(async () => {
    await processQueue();
    clearExpiredCache();
  }, [processQueue, clearExpiredCache]);

  return {
    ...state,
    queueAction,
    removeFromQueue,
    processQueue,
    executeWithOfflineSupport,
    getCachedData,
    setCachedData,
    isCacheValid,
    clearExpiredCache,
    sync,
    offlineQueue: offlineQueue.map(item => ({
      id: item.id,
      action: item.action,
      timestamp: item.timestamp,
      retryCount: item.retryCount,
      maxRetries: item.maxRetries
    }))
  };
};