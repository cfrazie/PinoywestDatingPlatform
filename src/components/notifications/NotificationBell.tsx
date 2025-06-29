import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationCenter from './NotificationCenter';

interface NotificationBellProps {
  userId: string;
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  userId,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useNotifications(userId);

  return (
    <>
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-6 h-6 text-gray-600" />
          
          {/* Unread badge */}
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                style={{ 
                  minWidth: '18px', 
                  height: '18px',
                  padding: unreadCount > 9 ? '0 4px' : '0'
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      <NotificationCenter
        userId={userId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default NotificationBell;