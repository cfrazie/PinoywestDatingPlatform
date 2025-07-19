import { useState, useCallback, useRef } from 'react';
import { AppError, createAppError, retryWithBackoff } from '../lib/errorHandling';
import { errorLogger } from '../lib/errorLogger';

interface ErrorState {
  error: AppError | null;
  isRetrying: boolean;
  retryCount: number;
}

interface UseErrorHandlerOptions {
  maxRetries?: number;
  showToast?: boolean;
  logError?: boolean;
  onError?: (error: AppError) => void;
  onRetry?: () => void;
  onMaxRetriesReached?: (error: AppError) => void;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const {
    maxRetries = 3,
    showToast = true,
    logError = true,
    onError,
    onRetry,
    onMaxRetriesReached
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isRetrying: false,
    retryCount: 0
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  // Handle error
  const handleError = useCallback((
    error: Error,
    context?: Record<string, any>,
    userId?: string
  ) => {
    const appError = createAppError(error, context, userId);
    
    setErrorState(prev => ({
      ...prev,
      error: appError,
      isRetrying: false
    }));

    // Log error
    if (logError) {
      errorLogger.logError(appError);
    }

    // Call custom error handler
    if (onError) {
      onError(appError);
    }

    return appError;
  }, [logError, onError]);

  // Clear error
  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isRetrying: false,
      retryCount: 0
    });

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
  }, []);

  // Retry function
  const retry = useCallback(async (fn?: () => Promise<void> | void) => {
    if (errorState.retryCount >= maxRetries) {
      if (onMaxRetriesReached && errorState.error) {
        onMaxRetriesReached(errorState.error);
      }
      return;
    }

    setErrorState(prev => ({
      ...prev,
      isRetrying: true,
      retryCount: prev.retryCount + 1
    }));

    if (onRetry) {
      onRetry();
    }

    try {
      if (fn) {
        await fn();
      }
      clearError();
    } catch (error) {
      handleError(error as Error);
    }
  }, [errorState.retryCount, maxRetries, onRetry, onMaxRetriesReached, handleError, clearError]);

  // Execute function with error handling
  const executeWithErrorHandling = useCallback(async <T>(
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T | null> => {
    try {
      clearError();
      return await fn();
    } catch (error) {
      handleError(error as Error, context);
      return null;
    }
  }, [handleError, clearError]);

  // Execute with retry
  const executeWithRetry = useCallback(async <T>(
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T | null> => {
    try {
      clearError();
      return await retryWithBackoff(fn, maxRetries);
    } catch (error) {
      handleError(error as Error, context);
      return null;
    }
  }, [handleError, clearError, maxRetries]);

  // Auto retry with delay
  const autoRetry = useCallback((
    fn: () => Promise<void> | void,
    delay: number = 3000
  ) => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    retryTimeoutRef.current = setTimeout(() => {
      retry(fn);
    }, delay);
  }, [retry]);

  return {
    error: errorState.error,
    isRetrying: errorState.isRetrying,
    retryCount: errorState.retryCount,
    hasError: !!errorState.error,
    canRetry: errorState.retryCount < maxRetries,
    handleError,
    clearError,
    retry,
    autoRetry,
    executeWithErrorHandling,
    executeWithRetry
  };
};

// Hook for network-specific error handling
export const useNetworkErrorHandler = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'poor' | 'offline'>('good');

  const errorHandler = useErrorHandler({
    maxRetries: 5,
    onError: (error) => {
      if (error.code === 'OFFLINE_ERROR') {
        setIsOnline(false);
        setConnectionQuality('offline');
      } else if (error.code === 'NETWORK_ERROR') {
        setConnectionQuality('poor');
      }
    }
  });

  // Monitor online status
  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionQuality('good');
      errorHandler.clearError();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionQuality('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [errorHandler]);

  return {
    ...errorHandler,
    isOnline,
    connectionQuality
  };
};