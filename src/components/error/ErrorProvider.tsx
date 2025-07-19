import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorToast from './ErrorToast';
import OfflineIndicator from './OfflineIndicator';
import { AppError } from '../../lib/errorHandling';
import { useOfflineSupport } from '../../hooks/useOfflineSupport';

interface ErrorContextType {
  showError: (error: AppError, options?: ErrorDisplayOptions) => string;
  hideError: (id: string) => void;
  clearAllErrors: () => void;
  retryAction: (id: string) => void;
  isOnline: boolean;
  queueSize: number;
}

interface ErrorDisplayOptions {
  autoHide?: boolean;
  duration?: number;
  onRetry?: () => void;
  persistent?: boolean;
}

interface ErrorItem extends AppError {
  id: string;
  options: ErrorDisplayOptions;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

interface ErrorProviderProps {
  children: ReactNode;
  maxErrors?: number;
  defaultDuration?: number;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({
  children,
  maxErrors = 5,
  defaultDuration = 5000
}) => {
  const [errors, setErrors] = useState<ErrorItem[]>([]);
  const offlineSupport = useOfflineSupport();

  const showError = useCallback((
    error: AppError,
    options: ErrorDisplayOptions = {}
  ): string => {
    const id = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const errorItem: ErrorItem = {
      ...error,
      id,
      options: {
        autoHide: true,
        duration: defaultDuration,
        persistent: false,
        ...options
      }
    };

    setErrors(prev => {
      const newErrors = [...prev, errorItem];
      
      // Limit number of errors shown
      if (newErrors.length > maxErrors) {
        return newErrors.slice(-maxErrors);
      }
      
      return newErrors;
    });

    return id;
  }, [maxErrors, defaultDuration]);

  const hideError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const retryAction = useCallback((id: string) => {
    const error = errors.find(e => e.id === id);
    if (error?.options.onRetry) {
      error.options.onRetry();
      hideError(id);
    }
  }, [errors, hideError]);

  const contextValue: ErrorContextType = {
    showError,
    hideError,
    clearAllErrors,
    retryAction,
    isOnline: offlineSupport.isOnline,
    queueSize: offlineSupport.queueSize
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
      
      {/* Offline Indicator */}
      <OfflineIndicator onRetry={offlineSupport.sync} />
      
      {/* Error Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {errors.map((error) => (
            <ErrorToast
              key={error.id}
              error={error}
              onDismiss={() => hideError(error.id)}
              onRetry={error.options.onRetry}
              autoHide={error.options.autoHide}
              duration={error.options.duration}
            />
          ))}
        </AnimatePresence>
      </div>
      
      {/* Offline Queue Indicator */}
      {offlineSupport.queueSize > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-lg shadow-lg z-40"
        >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-sm">
              {offlineSupport.queueSize} action{offlineSupport.queueSize !== 1 ? 's' : ''} queued
            </span>
          </div>
        </motion.div>
      )}
    </ErrorContext.Provider>
  );
};