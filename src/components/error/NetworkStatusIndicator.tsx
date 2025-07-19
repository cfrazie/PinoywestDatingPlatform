import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Signal, AlertTriangle } from 'lucide-react';

interface NetworkStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

interface NetworkStatus {
  isOnline: boolean;
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  className = '',
  showDetails = false
}) => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    saveData: false
  });

  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection || 
                       (navigator as any).mozConnection || 
                       (navigator as any).webkitConnection;

      setNetworkStatus({
        isOnline: navigator.onLine,
        effectiveType: connection?.effectiveType || 'unknown',
        downlink: connection?.downlink || 0,
        rtt: connection?.rtt || 0,
        saveData: connection?.saveData || false
      });
    };

    const handleOnline = () => updateNetworkStatus();
    const handleOffline = () => updateNetworkStatus();
    const handleConnectionChange = () => updateNetworkStatus();

    // Initial update
    updateNetworkStatus();

    // Event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  const getConnectionQuality = () => {
    if (!networkStatus.isOnline) return 'offline';
    
    switch (networkStatus.effectiveType) {
      case 'slow-2g':
      case '2g':
        return 'poor';
      case '3g':
        return 'fair';
      case '4g':
        return 'good';
      default:
        return 'unknown';
    }
  };

  const getIcon = () => {
    const quality = getConnectionQuality();
    
    switch (quality) {
      case 'offline':
        return <WifiOff className="w-4 h-4 text-red-500" />;
      case 'poor':
        return <Signal className="w-4 h-4 text-red-500" />;
      case 'fair':
        return <Signal className="w-4 h-4 text-yellow-500" />;
      case 'good':
        return <Wifi className="w-4 h-4 text-green-500" />;
      default:
        return <Wifi className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    if (!networkStatus.isOnline) return 'Offline';
    
    switch (networkStatus.effectiveType) {
      case 'slow-2g':
        return 'Very slow connection';
      case '2g':
        return 'Slow connection';
      case '3g':
        return 'Moderate connection';
      case '4g':
        return 'Fast connection';
      default:
        return 'Online';
    }
  };

  const shouldShowWarning = () => {
    return networkStatus.isOnline && 
           ['slow-2g', '2g'].includes(networkStatus.effectiveType);
  };

  return (
    <div 
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex items-center space-x-1">
        {getIcon()}
        
        {shouldShowWarning() && (
          <AlertTriangle className="w-3 h-3 text-yellow-500" />
        )}
        
        {showDetails && (
          <span className="text-xs text-gray-600">
            {getStatusText()}
          </span>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-3 bg-white rounded-lg shadow-lg border border-gray-200 text-xs z-10"
        >
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${
                networkStatus.isOnline ? 'text-green-600' : 'text-red-600'
              }`}>
                {networkStatus.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            
            {networkStatus.isOnline && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Connection:</span>
                  <span className="font-medium">{networkStatus.effectiveType}</span>
                </div>
                
                {networkStatus.downlink > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Speed:</span>
                    <span className="font-medium">{networkStatus.downlink} Mbps</span>
                  </div>
                )}
                
                {networkStatus.rtt > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Latency:</span>
                    <span className="font-medium">{networkStatus.rtt}ms</span>
                  </div>
                )}
                
                {networkStatus.saveData && (
                  <div className="text-yellow-600 text-center mt-2">
                    Data Saver Mode Active
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-white border-r border-b border-gray-200"></div>
        </motion.div>
      )}
    </div>
  );
};

export default NetworkStatusIndicator;