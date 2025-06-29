import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, CheckCheck, Download, Play, Pause, 
  Heart, Reply, MoreHorizontal, Copy, Delete
} from 'lucide-react';
import OptimizedImage from '../ui/OptimizedImage';
import Button from '../ui/Button';
import { Message } from '../../types/messaging';
import { formatMessageTime, formatFileSize } from '../../utils/messageUtils';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  senderAvatar: string;
  onReply?: (message: Message) => void;
  onReact?: (messageId: string, reaction: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  senderAvatar,
  onReply,
  onReact
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleReaction = (reaction: string) => {
    onReact?.(message.id, reaction);
  };

  const handleCopyMessage = () => {
    if (message.type === 'text') {
      navigator.clipboard.writeText(message.content);
    }
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case 'text':
        return (
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        );

      case 'image':
        return (
          <div className="relative">
            <OptimizedImage
              src={message.content}
              alt="Shared image"
              className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              width={300}
              height={200}
            />
            {message.caption && (
              <div className="mt-2 text-sm">{message.caption}</div>
            )}
          </div>
        );

      case 'voice':
        return (
          <div className="flex items-center space-x-3 min-w-48">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex-shrink-0"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            
            <div className="flex-1">
              <div className="flex items-center space-x-1">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 bg-current rounded-full ${
                      i < 8 ? 'h-2' : i < 12 ? 'h-3' : i < 16 ? 'h-4' : 'h-3'
                    }`}
                    style={{ opacity: isPlaying && i < 10 ? 1 : 0.3 }}
                  />
                ))}
              </div>
            </div>
            
            <span className="text-xs opacity-70">
              {message.duration ? `${message.duration}s` : '0:00'}
            </span>
          </div>
        );

      case 'file':
        return (
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg max-w-xs">
            <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">
                {message.fileName || 'File'}
              </div>
              <div className="text-xs text-gray-500">
                {message.fileSize ? formatFileSize(message.fileSize) : 'Unknown size'}
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        );

      default:
        return <div>Unsupported message type</div>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-end space-x-2 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {!isOwn && (
        <OptimizedImage
          src={senderAvatar}
          alt="Sender"
          className="w-8 h-8 rounded-full flex-shrink-0"
          width={32}
          height={32}
        />
      )}

      {/* Message Container */}
      <div className={`flex flex-col max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Reply Reference */}
        {message.replyTo && (
          <div className={`mb-1 p-2 bg-gray-100 rounded-lg text-xs ${
            isOwn ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            <div className="font-medium text-gray-600">Replying to:</div>
            <div className="text-gray-500 truncate">
              {message.replyTo.content.substring(0, 50)}...
            </div>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`relative px-4 py-2 rounded-2xl ${
            isOwn
              ? 'bg-blue-600 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-900 rounded-bl-md'
          }`}
        >
          {renderMessageContent()}

          {/* Message Actions */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: showActions ? 1 : 0, scale: showActions ? 1 : 0.8 }}
            className={`absolute top-0 ${
              isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'
            } flex items-center space-x-1 bg-white shadow-lg rounded-lg p-1`}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction('❤️')}
              className="p-1"
            >
              <Heart className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReply?.(message)}
              className="p-1"
            >
              <Reply className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyMessage}
              className="p-1"
            >
              <Copy className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-1"
            >
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </motion.div>
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex items-center space-x-1 mt-1">
            {message.reactions.map((reaction, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center space-x-1 bg-white border border-gray-200 rounded-full px-2 py-1 text-xs"
              >
                <span>{reaction.emoji}</span>
                <span className="text-gray-500">{reaction.count}</span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Message Info */}
        <div className={`flex items-center space-x-1 mt-1 text-xs text-gray-500 ${
          isOwn ? 'flex-row-reverse space-x-reverse' : ''
        }`}>
          <span>{formatMessageTime(message.timestamp)}</span>
          {isOwn && (
            <div className="flex items-center">
              {message.status === 'sent' && <Check className="w-3 h-3" />}
              {message.status === 'delivered' && <CheckCheck className="w-3 h-3" />}
              {message.status === 'read' && <CheckCheck className="w-3 h-3 text-blue-500" />}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;