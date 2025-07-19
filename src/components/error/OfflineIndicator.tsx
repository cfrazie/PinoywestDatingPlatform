import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';

interface OfflineIndicatorProps {
  onRetry?: () => void;
  className?: string;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  onRetry,
  className = ''
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      
      // Hide reconnected message after 3 seconds
      setTimeout(() => {
        setShowReconnected(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {/* Offline indicator */}
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-0 left-0 right-0 z-50 bg-red-500 text-white p-3 ${className}`}
        >
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <WifiOff className="w-5 h-5 mr-2" />
              <span className="font-medium">You're offline</span>
              <span className="ml-2 text-red-100">Some features may not be available</span>
            </div>
            
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="bg-white bg-opacity-20 text-white border-white border-opacity-30 hover:bg-opacity-30"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Retry
              </Button>
            )}
          </div>
        </motion.div>
      )}

      {/* Reconnected indicator */}
      {showReconnected && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-0 left-0 right-0 z-50 bg-green-500 text-white p-3 ${className}`}
        >
          <div className="container mx-auto flex items-center justify-center">
            <Wifi className="w-5 h-5 mr-2" />
            <span className="font-medium">Back online!</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;