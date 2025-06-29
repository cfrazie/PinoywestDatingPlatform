import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Image as ImageIcon, Clock, Zap } from 'lucide-react';

interface ImageMetrics {
  totalImages: number;
  loadedImages: number;
  failedImages: number;
  averageLoadTime: number;
  totalSize: number;
  largestImage: { url: string; size: number; loadTime: number } | null;
}

const ImagePerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<ImageMetrics>({
    totalImages: 0,
    loadedImages: 0,
    failedImages: 0,
    averageLoadTime: 0,
    totalSize: 0,
    largestImage: null,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const imageEntries = entries.filter(entry => 
        entry.initiatorType === 'img' || 
        entry.initiatorType === 'image'
      );

      if (imageEntries.length === 0) return;

      const loadTimes = imageEntries.map(entry => entry.duration);
      const avgLoadTime = loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;

      // Find largest image
      const largestEntry = imageEntries.reduce((largest, current) => 
        current.transferSize > largest.transferSize ? current : largest
      );

      setMetrics(prev => ({
        totalImages: prev.totalImages + imageEntries.length,
        loadedImages: prev.loadedImages + imageEntries.filter(e => e.duration > 0).length,
        failedImages: prev.failedImages + imageEntries.filter(e => e.duration === 0).length,
        averageLoadTime: avgLoadTime,
        totalSize: prev.totalSize + imageEntries.reduce((sum, e) => sum + e.transferSize, 0),
        largestImage: {
          url: largestEntry.name,
          size: largestEntry.transferSize,
          loadTime: largestEntry.duration,
        },
      }));
    });

    observer.observe({ entryTypes: ['resource'] });

    // Toggle visibility with keyboard shortcut
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      observer.disconnect();
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  if (process.env.NODE_ENV !== 'development' || !isVisible) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    return `${ms.toFixed(0)}ms`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm"
    >
      <div className="flex items-center space-x-2 mb-3">
        <Activity className="w-5 h-5 text-green-400" />
        <h3 className="font-semibold">Image Performance</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-auto text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="flex items-center">
            <ImageIcon className="w-4 h-4 mr-1" />
            Images:
          </span>
          <span>{metrics.loadedImages}/{metrics.totalImages}</span>
        </div>

        <div className="flex justify-between">
          <span className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Avg Load:
          </span>
          <span>{formatTime(metrics.averageLoadTime)}</span>
        </div>

        <div className="flex justify-between">
          <span className="flex items-center">
            <Zap className="w-4 h-4 mr-1" />
            Total Size:
          </span>
          <span>{formatBytes(metrics.totalSize)}</span>
        </div>

        {metrics.failedImages > 0 && (
          <div className="flex justify-between text-red-400">
            <span>Failed:</span>
            <span>{metrics.failedImages}</span>
          </div>
        )}

        {metrics.largestImage && (
          <div className="mt-3 pt-2 border-t border-gray-600">
            <div className="text-xs text-gray-400 mb-1">Largest Image:</div>
            <div className="text-xs">
              <div>{formatBytes(metrics.largestImage.size)}</div>
              <div>{formatTime(metrics.largestImage.loadTime)}</div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 text-xs text-gray-400">
        Press Ctrl+Shift+I to toggle
      </div>
    </motion.div>
  );
};

export default ImagePerformanceMonitor;