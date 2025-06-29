import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Smile, Paperclip, MoreVertical, Phone, Video, 
  Heart, Image as ImageIcon, Mic, MicOff, Camera
} from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import OptimizedImage from '../ui/OptimizedImage';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import EmojiPicker from './EmojiPicker';
import { useMessaging } from '../../hooks/useMessaging';
import { Message, ChatUser } from '../../types/messaging';

interface ChatInterfaceProps {
  chatId: string;
  currentUser: ChatUser;
  otherUser: ChatUser;
  onClose?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  chatId,
  currentUser,
  otherUser,
  onClose
}) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout>();

  const {
    messages,
    isTyping,
    isOnline,
    sendMessage,
    sendTypingIndicator,
    markAsRead,
    uploadFile,
    sendVoiceMessage,
    isLoading
  } = useMessaging(chatId, currentUser.id);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Mark messages as read when chat is opened
    markAsRead();
  }, [chatId, markAsRead]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    await sendMessage({
      type: 'text',
      content: message,
      recipientId: otherUser.id
    });

    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (value: string) => {
    setMessage(value);
    sendTypingIndicator();
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileUrl = await uploadFile(file);
      await sendMessage({
        type: file.type.startsWith('image/') ? 'image' : 'file',
        content: fileUrl,
        fileName: file.name,
        fileSize: file.size,
        recipientId: otherUser.id
      });
    } catch (error) {
      console.error('File upload failed:', error);
    }
  };

  const startVoiceRecording = async () => {
    try {
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Start actual recording logic here
      console.log('Starting voice recording...');
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
    }
  };

  const stopVoiceRecording = async () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }

    setIsRecording(false);
    setRecordingTime(0);

    try {
      // Stop recording and send voice message
      const audioBlob = new Blob([], { type: 'audio/wav' }); // Placeholder
      const audioUrl = await sendVoiceMessage(audioBlob);
      
      await sendMessage({
        type: 'voice',
        content: audioUrl,
        duration: recordingTime,
        recipientId: otherUser.id
      });
    } catch (error) {
      console.error('Failed to send voice message:', error);
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <OptimizedImage
              src={otherUser.avatar}
              alt={otherUser.name}
              className="w-10 h-10 rounded-full"
              width={40}
              height={40}
            />
            {isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{otherUser.name}</h3>
            <p className="text-sm text-gray-500">
              {isOnline ? 'Online' : `Last seen ${otherUser.lastSeen}`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.senderId === currentUser.id}
              senderAvatar={msg.senderId === currentUser.id ? currentUser.avatar : otherUser.avatar}
            />
          ))}
        </AnimatePresence>

        {isTyping && (
          <TypingIndicator
            user={otherUser}
            isVisible={true}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-3 mb-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-700 font-medium">Recording...</span>
              <span className="text-red-600">{formatRecordingTime(recordingTime)}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={stopVoiceRecording}
              className="text-red-600 hover:text-red-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </motion.div>
        )}

        <div className="flex items-end space-x-2">
          {/* Attachment Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0"
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="pr-20"
              disabled={isRecording}
            />
            
            {/* Emoji Button */}
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Voice/Send Button */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {message.trim() ? (
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={isLoading}
                  className="p-2"
                >
                  <Send className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onMouseDown={startVoiceRecording}
                  onMouseUp={stopVoiceRecording}
                  onMouseLeave={stopVoiceRecording}
                  className="p-2"
                >
                  {isRecording ? (
                    <MicOff className="w-4 h-4 text-red-500" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Emoji Picker */}
        <AnimatePresence>
          {showEmojiPicker && (
            <EmojiPicker
              onEmojiSelect={handleEmojiSelect}
              onClose={() => setShowEmojiPicker(false)}
            />
          )}
        </AnimatePresence>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ChatInterface;