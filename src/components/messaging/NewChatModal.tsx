import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Heart, Star, MapPin } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import OptimizedImage from '../ui/OptimizedImage';
import { ChatUser } from '../../types/messaging';

interface NewChatModalProps {
  currentUserId: string;
  onCreateChat: (userId: string) => void;
  onClose: () => void;
}

const NewChatModal: React.FC<NewChatModalProps> = ({
  currentUserId,
  onCreateChat,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ChatUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock users data - in production, this would come from your API
  const mockUsers: ChatUser[] = [
    {
      id: '2',
      name: 'Maria Santos',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
      isOnline: true,
      lastSeen: 'Online',
      location: 'Manila, Philippines',
      age: 28,
      verified: true
    },
    {
      id: '3',
      name: 'David Chen',
      avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg',
      isOnline: false,
      lastSeen: '2 hours ago',
      location: 'Los Angeles, USA',
      age: 32,
      verified: true
    },
    {
      id: '4',
      name: 'Sarah Johnson',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
      isOnline: true,
      lastSeen: 'Online',
      location: 'Toronto, Canada',
      age: 29,
      verified: false
    },
    {
      id: '5',
      name: 'Carlos Rodriguez',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
      isOnline: false,
      lastSeen: '1 day ago',
      location: 'Madrid, Spain',
      age: 35,
      verified: true
    },
    {
      id: '6',
      name: 'Jennifer Kim',
      avatar: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg',
      isOnline: true,
      lastSeen: 'Online',
      location: 'Sydney, Australia',
      age: 26,
      verified: true
    }
  ];

  useEffect(() => {
    // Simulate loading users
    setIsLoading(true);
    setTimeout(() => {
      setUsers(mockUsers);
      setIsLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [users, searchQuery]);

  const handleStartChat = (userId: string) => {
    onCreateChat(userId);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Start New Conversation</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <Input
            type="text"
            placeholder="Search by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4 text-gray-400" />}
          />
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="p-2">
              {filteredUsers.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleStartChat(user.id)}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <OptimizedImage
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-full"
                      width={48}
                      height={48}
                    />
                    {user.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {user.name}
                      </h3>
                      {user.verified && (
                        <Star className="w-4 h-4 text-blue-500 fill-current" />
                      )}
                      <span className="text-sm text-gray-500">
                        {user.age}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{user.location}</span>
                      </div>
                      <span className="text-xs">
                        {user.isOnline ? 'Online' : user.lastSeen}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0"
                  >
                    <Heart className="w-4 h-4 mr-1" />
                    Chat
                  </Button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-6 text-center">
              <Search className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No users found' : 'No users available'}
              </h3>
              <p className="text-gray-500">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Check back later for new matches'
                }
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            Start meaningful conversations with verified members
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NewChatModal;