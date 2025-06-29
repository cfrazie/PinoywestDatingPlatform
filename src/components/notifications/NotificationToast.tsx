import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, MessageCircle, Heart, Shield, 
  X, ArrowRight, Star, Video
} from 'lucide-react';
import { Notification } from '../../hooks/useNotifications';

interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
  onClick: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  onClick,
  autoClose = true,
  autoCloseDelay = 5000
}) => {
  // Auto close after delay
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onClose]);

  // Get icon based on notification type
  const getNotificationIcon = () => {
    switch (notification.notificationType) {
      case 'new_message':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'new_match':
        return <Heart className="w-5 h-5 text-pink-500" />;
      case 'profile_view':
        return <User className="w-5 h-5 text-purple-500" />;
      case 'profile_like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'verification_complete':
      case 'verification_request':
        return <Shield className="w-5 h-5 text-green-500" />;
      case 'compatibility_update':
        return <Star className="w-5 h-5 text-yellow-500" />;
      case 'video_call_invitation':
        return <Video className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-lg overflow-hidden max-w-md w-full border border-gray-200"
    >
      <div className="p-4">
        <div className="flex">
          <div className="flex-shrink-0 mr-3 p-2 rounded-full bg-blue-100">
            {getNotificationIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h4 className="text-sm font-medium text-gray-900">
                {notification.title}
              </h4>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="ml-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mt-1">
              {notification.body}
            </p>
            
            <button
              onClick={onClick}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center"
            >
              View details
              <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress bar for auto-close */}
      {autoClose && (
        <div className="h-1 bg-gray-100">
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: autoCloseDelay / 1000, ease: 'linear' }}
            className="h-full bg-blue-500"
          />
        </div>
      )}
    </motion.div>
  );
};

export default NotificationToast;