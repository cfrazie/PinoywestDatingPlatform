import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Minimize2, Maximize2 } from 'lucide-react';
import ChatList from './ChatList';
import ChatInterface from './ChatInterface';
import NewChatModal from './NewChatModal';
import Button from '../ui/Button';
import { Chat, ChatUser } from '../../types/messaging';
import { useMessagingData } from '../../hooks/useMessagingData';

interface MessagingDashboardProps {
  currentUser: ChatUser;
  isMinimized?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
}

const MessagingDashboard: React.FC<MessagingDashboardProps> = ({
  currentUser,
  isMinimized = false,
  onClose,
  onMinimize
}) => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!isMinimized);

  const {
    chats,
    isLoading,
    createNewChat,
    refreshChats
  } = useMessagingData(currentUser.id);

  useEffect(() => {
    // Auto-select first chat if none selected
    if (chats.length > 0 && !selectedChatId) {
      setSelectedChatId(chats[0].id);
    }
  }, [chats, selectedChatId]);

  const selectedChat = chats.find(chat => chat.id === selectedChatId);
  const otherUser = selectedChat?.participants.find(p => p.id !== currentUser.id);

  const handleNewChat = async (userId: string) => {
    try {
      const newChat = await createNewChat(userId);
      setSelectedChatId(newChat.id);
      setShowNewChatModal(false);
    } catch (error) {
      console.error('Failed to create new chat:', error);
    }
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Button
          onClick={() => setIsExpanded(true)}
          className="rounded-full w-14 h-14 shadow-lg"
        >
          <span className="text-lg">💬</span>
        </Button>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-4 md:inset-8 bg-white rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          <div className="flex items-center space-x-2">
            {onMinimize && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMinimize}
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
            )}
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat List */}
          <div className="w-80 border-r border-gray-200 flex-shrink-0">
            <ChatList
              chats={chats}
              selectedChatId={selectedChatId || undefined}
              onChatSelect={setSelectedChatId}
              onNewChat={() => setShowNewChatModal(true)}
              currentUserId={currentUser.id}
            />
          </div>

          {/* Chat Interface */}
          <div className="flex-1">
            {selectedChat && otherUser ? (
              <ChatInterface
                chatId={selectedChat.id}
                currentUser={currentUser}
                otherUser={otherUser}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💬</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Choose a conversation from the list to start messaging
                  </p>
                  <Button onClick={() => setShowNewChatModal(true)}>
                    Start New Conversation
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <NewChatModal
          currentUserId={currentUser.id}
          onCreateChat={handleNewChat}
          onClose={() => setShowNewChatModal(false)}
        />
      )}
    </>
  );
};

export default MessagingDashboard;