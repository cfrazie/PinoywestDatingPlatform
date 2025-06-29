import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, X, Check, CheckCheck, Settings, 
  Trash2, RefreshCw, Clock, Calendar, Heart,
  MessageCircle, Shield, CreditCard, Zap, Video
} from 'lucide-react';
import Button from '../ui/Button';
import { useNotifications, Notification } from '../../hooks/useNotifications';
import NotificationItem from './NotificationItem';
import NotificationPreferences from './NotificationPreferences';

interface NotificationCenterProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  userId,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'settings'>('all');
  const [showPreferences, setShowPreferences] = useState(false);
  
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications
  } = useNotifications(userId);

  // Filter notifications based on active tab
  const filteredNotifications = activeTab === 'unread'
    ? notifications.filter(notification => !notification.isRead)
    : notifications;

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    
    // Handle navigation based on notification type
    switch (notification.notificationType) {
      case 'new_message':
        console.log('Navigate to messages', notification.data);
        break;
      case 'new_match':
        console.log('Navigate to match profile', notification.data);
        break;
      case 'verification_complete':
        console.log('Navigate to verification report', notification.data);
        break;
      default:
        console.log('Handle notification click', notification);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  // Group notifications by date
  const groupNotificationsByDate = (notifications: Notification[]) => {
    const groups: Record<string, Notification[]> = {};
    
    notifications.forEach(notification => {
      const date = new Date(notification.createdAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
    });
    
    return groups;
  };

  const notificationGroups = groupNotificationsByDate(filteredNotifications);

  // Format date for display
  const formatGroupDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="bg-white w-full max-w-md h-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreferences(true)}
                >
                  <Settings className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-3 text-sm font-medium ${
                  activeTab === 'all'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`flex-1 py-3 text-sm font-medium ${
                  activeTab === 'unread'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Unread
                {unreadCount > 0 && (
                  <span className="ml-1 bg-blue-100 text-blue-800 text-xs rounded-full px-2 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between p-3 bg-gray-50">
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshNotifications}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Mark all as read
              </Button>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto h-[calc(100%-8rem)]">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
              ) : error ? (
                <div className="p-4 text-center text-red-600">
                  {error}
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                  <Bell className="w-12 h-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
                  <p className="text-gray-500">
                    {activeTab === 'unread'
                      ? "You've read all your notifications"
                      : "You don't have any notifications yet"}
                  </p>
                </div>
              ) : (
                <div>
                  {Object.entries(notificationGroups).map(([date, notifications]) => (
                    <div key={date}>
                      <div className="sticky top-0 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600">
                        {formatGroupDate(date)}
                      </div>
                      <div>
                        {notifications.map(notification => (
                          <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onClick={() => handleNotificationClick(notification)}
                            onMarkAsRead={() => markAsRead(notification.id)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Preferences Modal */}
          {showPreferences && (
            <NotificationPreferences
              userId={userId}
              onClose={() => setShowPreferences(false)}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationCenter;