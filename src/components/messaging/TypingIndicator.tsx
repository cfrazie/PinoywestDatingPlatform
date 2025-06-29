import React from 'react';
import { motion } from 'framer-motion';
import OptimizedImage from '../ui/OptimizedImage';
import { ChatUser } from '../../types/messaging';

interface TypingIndicatorProps {
  user: ChatUser;
  isVisible: boolean;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ user, isVisible }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-end space-x-2"
    >
      <OptimizedImage
        src={user.avatar}
        alt={user.name}
        className="w-8 h-8 rounded-full flex-shrink-0"
        width={32}
        height={32}
      />
      
      <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-600 mr-2">{user.name} is typing</span>
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-gray-400 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;