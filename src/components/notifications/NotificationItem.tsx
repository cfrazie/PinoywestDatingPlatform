import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, Heart, Shield, Bell, Key,
  User, Star, Video, Calendar, CreditCard, 
  Check, MoreVertical, Trash2, Clock
} from 'lucide-react';
import { Notification } from '../../hooks/useNotifications';
import { formatDistanceToNow } from '../../utils/dateUtils';

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  onMarkAsRead: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick,
  onMarkAsRead
}) => {
  const [showActions, setShowActions] = useState(false);

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
      case 'account_update':
        return <User className="w-5 h-5 text-gray-500" />;
      case 'password_reset':
        return <Key className="w-5 h-5 text-orange-500" />;
      case 'subscription_expiring':
      case 'payment_failed':
        return <CreditCard className="w-5 h-5 text-yellow-500" />;
      case 'compatibility_update':
        return <Star className="w-5 h-5 text-yellow-500" />;
      case 'video_call_invitation':
        return <Video className="w-5 h-5 text-blue-500" />;
      case 'scheduled_call_reminder':
        return <Calendar className="w-5 h-5 text-purple-500" />;
      case 'new_message_reaction':
        return <Heart className="w-5 h-5 text-pink-500" />;
      case 'system_announcement':
        return <Bell className="w-5 h-5 text-gray-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer relative ${
        !notification.isRead ? 'bg-blue-50' : ''
      }`}
      onClick={onClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex">
        <div className={`flex-shrink-0 mr-3 p-2 rounded-full ${
          !notification.isRead ? 'bg-blue-100' : 'bg-gray-100'
        }`}>
          {getNotificationIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h4 className={`text-sm font-medium ${
              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
            }`}>
              {notification.title}
            </h4>
            <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
              {formatDistanceToNow(new Date(notification.createdAt))}
            </span>
          </div>
          
          <p className={`text-sm ${
            !notification.isRead ? 'text-gray-800' : 'text-gray-600'
          }`}>
            {notification.body}
          </p>
          
          {/* Notification data preview */}
          {notification.data && (
            <div className="mt-1">
              {notification.notificationType === 'new_message' && notification.data.message_preview && (
                <div className="text-xs text-gray-500 italic">
                  "{notification.data.message_preview.substring(0, 50)}
                  {notification.data.message_preview.length > 50 ? '...' : ''}"
                </div>
              )}
              
              {notification.notificationType === 'new_match' && notification.data.compatibility_score && (
                <div className="text-xs text-green-600">
                  {notification.data.compatibility_score}% compatibility match
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Action buttons */}
      <AnimatePresence>
        {showActions && !notification.isRead && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-2 right-2 bg-white shadow-md rounded-lg p-1 flex space-x-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead();
              }}
              className="p-1 text-gray-500 hover:text-blue-600 rounded-md hover:bg-blue-50"
              title="Mark as read"
            >
              <Check className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NotificationItem;