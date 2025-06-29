import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Plus, MoreVertical, Archive, 
  Pin, Delete, MessageCircle, Heart
} from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import OptimizedImage from '../ui/OptimizedImage';
import { Chat } from '../../types/messaging';
import { formatMessageTime, truncateMessage } from '../../utils/messageUtils';

interface ChatListProps {
  chats: Chat[];
  selectedChatId?: string;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  currentUserId: string;
}

const ChatList: React.FC<ChatListProps> = ({
  chats,
  selectedChatId,
  onChatSelect,
  onNewChat,
  currentUserId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState(chats);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'archived'>('all');

  useEffect(() => {
    let filtered = chats;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(chat =>
        chat.participants.some(p => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        chat.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by tab
    switch (activeTab) {
      case 'unread':
        filtered = filtered.filter(chat => chat.unreadCount > 0);
        break;
      case 'archived':
        filtered = filtered.filter(chat => chat.isArchived);
        break;
      default:
        filtered = filtered.filter(chat => !chat.isArchived);
    }

    // Sort by last message time
    filtered.sort((a, b) => {
      const aTime = a.lastMessage?.timestamp || a.createdAt;
      const bTime = b.lastMessage?.timestamp || b.createdAt;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

    setFilteredChats(filtered);
  }, [chats, searchQuery, activeTab]);

  const getOtherParticipant = (chat: Chat) => {
    return chat.participants.find(p => p.id !== currentUserId);
  };

  const renderChatItem = (chat: Chat) => {
    const otherUser = getOtherParticipant(chat);
    if (!otherUser) return null;

    const isSelected = chat.id === selectedChatId;
    const hasUnread = chat.unreadCount > 0;

    return (
      <motion.div
        key={chat.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ backgroundColor: '#f9fafb' }}
        className={`p-4 cursor-pointer border-b border-gray-100 transition-colors ${
          isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
        }`}
        onClick={() => onChatSelect(chat.id)}
      >
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <OptimizedImage
              src={otherUser.avatar}
              alt={otherUser.name}
              className="w-12 h-12 rounded-full"
              width={48}
              height={48}
            />
            {otherUser.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
            {hasUnread && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
              </div>
            )}
          </div>

          {/* Chat Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className={`font-medium truncate ${
                hasUnread ? 'text-gray-900' : 'text-gray-700'
              }`}>
                {otherUser.name}
              </h3>
              <div className="flex items-center space-x-1">
                {chat.isPinned && (
                  <Pin className="w-3 h-3 text-gray-400" />
                )}
                <span className="text-xs text-gray-500">
                  {chat.lastMessage && formatMessageTime(chat.lastMessage.timestamp)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                {chat.lastMessage?.type === 'image' && (
                  <div className="flex items-center text-gray-500">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    <span className="text-sm">Photo</span>
                  </div>
                )}
                {chat.lastMessage?.type === 'voice' && (
                  <div className="flex items-center text-gray-500">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    <span className="text-sm">Voice message</span>
                  </div>
                )}
                {chat.lastMessage?.type === 'text' && (
                  <p className={`text-sm truncate ${
                    hasUnread ? 'text-gray-900 font-medium' : 'text-gray-500'
                  }`}>
                    {truncateMessage(chat.lastMessage.content, 40)}
                  </p>
                )}
                {!chat.lastMessage && (
                  <p className="text-sm text-gray-400 italic">No messages yet</p>
                )}
              </div>

              {chat.lastMessage?.senderId === currentUserId && (
                <div className="flex-shrink-0 ml-2">
                  {chat.lastMessage.status === 'read' && (
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                      <Heart className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Messages</h2>
          <Button
            variant="primary"
            size="sm"
            onClick={onNewChat}
            className="flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>New</span>
          </Button>
        </div>

        {/* Search */}
        <Input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-4 h-4 text-gray-400" />}
          className="mb-4"
        />

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'All' },
            { key: 'unread', label: 'Unread' },
            { key: 'archived', label: 'Archived' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              {tab.key === 'unread' && (
                <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                  {chats.filter(c => c.unreadCount > 0).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length > 0 ? (
          <div>
            {filteredChats.map(renderChatItem)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <MessageCircle className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Start a conversation with someone you like'
              }
            </p>
            {!searchQuery && (
              <Button onClick={onNewChat}>
                Start New Conversation
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;