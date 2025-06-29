import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed,
  Calendar, Clock, MoreVertical, Trash2, MessageCircle,
  Filter, Search
} from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import OptimizedImage from '../ui/OptimizedImage';
import { CallRecord, CallType, CallStatus } from '../../types/video';
import { formatMessageTime, formatDuration } from '../../utils/messageUtils';

interface CallHistoryProps {
  userId: string;
  onStartCall?: (userId: string, callType: CallType) => void;
  onSendMessage?: (userId: string) => void;
}

const CallHistory: React.FC<CallHistoryProps> = ({
  userId,
  onStartCall,
  onSendMessage
}) => {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<CallRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'video' | 'audio' | 'missed'>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Mock call history data
  const mockCalls: CallRecord[] = [
    {
      id: 'call_1',
      participantIds: [userId, 'user_2'],
      initiatorId: userId,
      callType: 'video',
      status: 'completed',
      startTime: new Date(Date.now() - 3600000).toISOString(),
      endTime: new Date(Date.now() - 3300000).toISOString(),
      duration: 300,
      quality: 'excellent',
      participant: {
        id: 'user_2',
        name: 'Maria Santos',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
        isOnline: true,
        lastSeen: 'Online'
      }
    },
    {
      id: 'call_2',
      participantIds: [userId, 'user_3'],
      initiatorId: 'user_3',
      callType: 'audio',
      status: 'missed',
      startTime: new Date(Date.now() - 7200000).toISOString(),
      participant: {
        id: 'user_3',
        name: 'David Chen',
        avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg',
        isOnline: false,
        lastSeen: '2 hours ago'
      }
    },
    {
      id: 'call_3',
      participantIds: [userId, 'user_4'],
      initiatorId: userId,
      callType: 'video',
      status: 'completed',
      startTime: new Date(Date.now() - 86400000).toISOString(),
      endTime: new Date(Date.now() - 85800000).toISOString(),
      duration: 600,
      quality: 'good',
      participant: {
        id: 'user_4',
        name: 'Sarah Johnson',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
        isOnline: true,
        lastSeen: 'Online'
      }
    },
    {
      id: 'call_4',
      participantIds: [userId, 'user_5'],
      initiatorId: 'user_5',
      callType: 'audio',
      status: 'completed',
      startTime: new Date(Date.now() - 172800000).toISOString(),
      endTime: new Date(Date.now() - 172200000).toISOString(),
      duration: 600,
      quality: 'excellent',
      participant: {
        id: 'user_5',
        name: 'Carlos Rodriguez',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
        isOnline: false,
        lastSeen: '1 day ago'
      }
    }
  ];

  useEffect(() => {
    // Load call history
    setIsLoading(true);
    setTimeout(() => {
      setCalls(mockCalls);
      setIsLoading(false);
    }, 500);
  }, [userId]);

  useEffect(() => {
    // Filter calls based on search and filter type
    let filtered = calls;

    if (searchQuery) {
      filtered = filtered.filter(call =>
        call.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      if (filterType === 'missed') {
        filtered = filtered.filter(call => call.status === 'missed');
      } else {
        filtered = filtered.filter(call => call.callType === filterType);
      }
    }

    setFilteredCalls(filtered);
  }, [calls, searchQuery, filterType]);

  const getCallIcon = (call: CallRecord) => {
    if (call.status === 'missed') {
      return <PhoneMissed className="w-4 h-4 text-red-500" />;
    }
    
    const isOutgoing = call.initiatorId === userId;
    const IconComponent = call.callType === 'video' ? Video : Phone;
    
    if (isOutgoing) {
      return <PhoneOutgoing className="w-4 h-4 text-green-500" />;
    } else {
      return <PhoneIncoming className="w-4 h-4 text-blue-500" />;
    }
  };

  const getCallStatusText = (call: CallRecord) => {
    if (call.status === 'missed') {
      return 'Missed call';
    }
    
    const isOutgoing = call.initiatorId === userId;
    const callTypeText = call.callType === 'video' ? 'Video call' : 'Voice call';
    
    return isOutgoing ? `Outgoing ${callTypeText}` : `Incoming ${callTypeText}`;
  };

  const handleDeleteCall = (callId: string) => {
    setCalls(prev => prev.filter(call => call.id !== callId));
  };

  const handleCallBack = (call: CallRecord) => {
    onStartCall?.(call.participant.id, call.callType);
  };

  const handleSendMessage = (call: CallRecord) => {
    onSendMessage?.(call.participant.id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Call History</h2>
        <div className="text-sm text-gray-500">
          {filteredCalls.length} {filteredCalls.length === 1 ? 'call' : 'calls'}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <Input
          type="text"
          placeholder="Search call history..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-4 h-4 text-gray-400" />}
        />

        <div className="flex space-x-2">
          {[
            { key: 'all', label: 'All Calls' },
            { key: 'video', label: 'Video' },
            { key: 'audio', label: 'Audio' },
            { key: 'missed', label: 'Missed' }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setFilterType(filter.key as any)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filterType === filter.key
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Call List */}
      <div className="space-y-2">
        {filteredCalls.length > 0 ? (
          filteredCalls.map((call) => (
            <motion.div
              key={call.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <OptimizedImage
                  src={call.participant.avatar}
                  alt={call.participant.name}
                  className="w-12 h-12 rounded-full"
                  width={48}
                  height={48}
                />
                {call.participant.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>

              {/* Call Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  {getCallIcon(call)}
                  <h3 className="font-medium text-gray-900 truncate">
                    {call.participant.name}
                  </h3>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{getCallStatusText(call)}</span>
                  {call.duration && (
                    <span>{formatDuration(call.duration)}</span>
                  )}
                  <span>{formatMessageTime(call.startTime)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCallBack(call)}
                  className="p-2"
                >
                  {call.callType === 'video' ? (
                    <Video className="w-4 h-4" />
                  ) : (
                    <Phone className="w-4 h-4" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSendMessage(call)}
                  className="p-2"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>

                <div className="relative group">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button
                      onClick={() => handleDeleteCall(call.id)}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || filterType !== 'all' ? 'No calls found' : 'No call history'}
            </h3>
            <p className="text-gray-500">
              {searchQuery || filterType !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Your call history will appear here'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallHistory;