import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, CheckCircle, Info, X, 
  Wifi, WifiOff, RefreshCw, ExternalLink 
} from 'lucide-react';
import Button from '../ui/Button';
import { AppError, ErrorType } from '../../lib/errorHandling';

interface ErrorToastProps {
  error: AppError;
  onDismiss: () => void;
  onRetry?: () => void;
  autoHide?: boolean;
  duration?: number;
}

const ErrorToast: React.FC<ErrorToastProps> = ({
  error,
  onDismiss,
  onRetry,
  autoHide = true,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!autoHide) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 100) {
          setIsVisible(false);
          setTimeout(onDismiss, 300);
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [autoHide, duration, onDismiss]);

  const getIcon = () => {
    switch (error.severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'medium':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'low':
        return <Info className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (error.severity) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'high':
        return 'bg-orange-50 border-orange-200';
      case 'medium':
        return 'bg-blue-50 border-blue-200';
      case 'low':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  const getProgressColor = () => {
    switch (error.severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-blue-500';
      case 'low':
        return 'bg-gray-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const shouldShowRetry = () => {
    return onRetry && [
      ErrorType.NETWORK,
      ErrorType.API,
      ErrorType.TIMEOUT,
      ErrorType.SERVER
    ].includes(error.code as ErrorType);
  };

  const shouldShowOfflineIndicator = () => {
    return error.code === ErrorType.OFFLINE || !navigator.onLine;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className={`relative max-w-sm w-full border rounded-lg shadow-lg overflow-hidden ${getBackgroundColor()}`}
        >
          {/* Progress bar */}
          {autoHide && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
              <div 
                className={`h-full transition-all duration-100 ease-linear ${getProgressColor()}`}
                style={{ width: `${(timeLeft / duration) * 100}%` }}
              />
            </div>
          )}

          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3 mt-0.5">
                {shouldShowOfflineIndicator() ? (
                  <WifiOff className="w-5 h-5 text-gray-500" />
                ) : (
                  getIcon()
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-gray-900">
                    {error.code === ErrorType.OFFLINE ? 'You\'re offline' : 'Error'}
                  </h4>
                  <button
                    onClick={() => {
                      setIsVisible(false);
                      setTimeout(onDismiss, 300);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-sm text-gray-700 mb-3">
                  {error.userMessage}
                </p>

                {/* Action buttons */}
                <div className="flex items-center space-x-2">
                  {shouldShowRetry() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onRetry}
                      className="text-xs"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Retry
                    </Button>
                  )}

                  {error.severity === 'critical' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.reload()}
                      className="text-xs"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Reload Page
                    </Button>
                  )}

                  {process.env.NODE_ENV === 'development' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => console.error('Error Details:', error)}
                      className="text-xs"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Debug
                    </Button>
                  )}
                </div>

                {/* Additional context for offline */}
                {shouldShowOfflineIndicator() && (
                  <div className="mt-2 text-xs text-gray-600">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        navigator.onLine ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      {navigator.onLine ? 'Back online' : 'No internet connection'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorToast;