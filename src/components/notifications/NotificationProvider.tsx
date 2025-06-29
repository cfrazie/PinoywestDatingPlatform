import React, { createContext, useContext, useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNotifications, Notification } from '../../hooks/useNotifications';
import NotificationToast from './NotificationToast';

interface NotificationContextType {
  showNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => Promise<boolean>;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType>({
  showNotification: () => {},
  markAsRead: async () => false,
  unreadCount: 0
});

export const useNotificationContext = () => useContext(NotificationContext);

interface NotificationProviderProps {
  userId?: string;
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  userId,
  children
}) => {
  const [activeToast, setActiveToast] = useState<Notification | null>(null);
  const [isToastVisible, setIsToastVisible] = useState(false);
  
  const {
    notifications,
    unreadCount,
    markAsRead
  } = useNotifications(userId);

  // Show notification toast
  const showNotification = (notification: Notification) => {
    setActiveToast(notification);
    setIsToastVisible(true);
  };

  // Handle notification click
  const handleNotificationClick = async () => {
    if (activeToast) {
      await markAsRead(activeToast.id);
      setIsToastVisible(false);
      
      // Handle navigation based on notification type
      switch (activeToast.notificationType) {
        case 'new_message':
          console.log('Navigate to messages', activeToast.data);
          break;
        case 'new_match':
          console.log('Navigate to match profile', activeToast.data);
          break;
        case 'verification_complete':
          console.log('Navigate to verification report', activeToast.data);
          break;
        default:
          console.log('Handle notification click', activeToast);
      }
    }
  };

  // Show toast for new notifications
  useEffect(() => {
    if (notifications.length > 0 && !activeToast) {
      // Find first unread notification
      const firstUnread = notifications.find(n => !n.isRead);
      if (firstUnread) {
        showNotification(firstUnread);
      }
    }
  }, [notifications, activeToast]);

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        markAsRead,
        unreadCount
      }}
    >
      {children}
      
      {/* Notification Toast */}
      <div className="fixed top-4 right-4 z-50">
        <AnimatePresence>
          {isToastVisible && activeToast && (
            <NotificationToast
              notification={activeToast}
              onClose={() => setIsToastVisible(false)}
              onClick={handleNotificationClick}
            />
          )}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};