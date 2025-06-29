import { Message } from '../types/messaging';

export const formatMessageTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export const formatDetailedTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = new Date(now.getTime() - 86400000).toDateString() === date.toDateString();

  const timeString = date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });

  if (isToday) {
    return `Today at ${timeString}`;
  } else if (isYesterday) {
    return `Yesterday at ${timeString}`;
  } else {
    return `${date.toLocaleDateString()} at ${timeString}`;
  }
};

export const truncateMessage = (content: string, maxLength: number = 50): string => {
  if (content.length <= maxLength) {
    return content;
  }
  return content.substring(0, maxLength).trim() + '...';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `0:${remainingSeconds.toString().padStart(2, '0')}`;
  }
};

export const getMessagePreview = (message: Message): string => {
  switch (message.type) {
    case 'text':
      return message.content;
    case 'image':
      return message.caption || '📷 Photo';
    case 'voice':
      return '🎵 Voice message';
    case 'file':
      return `📎 ${message.fileName || 'File'}`;
    case 'video':
      return '🎥 Video';
    default:
      return 'Message';
  }
};

export const isMessageFromToday = (timestamp: string): boolean => {
  const messageDate = new Date(timestamp);
  const today = new Date();
  return messageDate.toDateString() === today.toDateString();
};

export const isMessageFromYesterday = (timestamp: string): boolean => {
  const messageDate = new Date(timestamp);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return messageDate.toDateString() === yesterday.toDateString();
};

export const groupMessagesByDate = (messages: Message[]): Record<string, Message[]> => {
  const grouped: Record<string, Message[]> = {};
  
  messages.forEach(message => {
    const date = new Date(message.timestamp);
    const dateKey = date.toDateString();
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(message);
  });
  
  return grouped;
};

export const getDateSeparatorText = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString([], { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
};

export const shouldShowTimestamp = (
  currentMessage: Message, 
  previousMessage?: Message
): boolean => {
  if (!previousMessage) return true;
  
  const currentTime = new Date(currentMessage.timestamp);
  const previousTime = new Date(previousMessage.timestamp);
  const timeDiff = currentTime.getTime() - previousTime.getTime();
  
  // Show timestamp if more than 5 minutes apart
  return timeDiff > 5 * 60 * 1000;
};

export const shouldGroupMessages = (
  currentMessage: Message,
  previousMessage?: Message
): boolean => {
  if (!previousMessage) return false;
  
  // Don't group if different senders
  if (currentMessage.senderId !== previousMessage.senderId) return false;
  
  // Don't group if too much time has passed (5 minutes)
  const currentTime = new Date(currentMessage.timestamp);
  const previousTime = new Date(previousMessage.timestamp);
  const timeDiff = currentTime.getTime() - previousTime.getTime();
  
  return timeDiff <= 5 * 60 * 1000;
};

export const getMessageStatusIcon = (status: Message['status']): string => {
  switch (status) {
    case 'sending':
      return '⏳';
    case 'sent':
      return '✓';
    case 'delivered':
      return '✓✓';
    case 'read':
      return '✓✓';
    default:
      return '';
  }
};

export const searchMessages = (
  messages: Message[], 
  query: string
): Message[] => {
  if (!query.trim()) return messages;
  
  const lowercaseQuery = query.toLowerCase();
  
  return messages.filter(message => {
    if (message.type === 'text') {
      return message.content.toLowerCase().includes(lowercaseQuery);
    } else if (message.caption) {
      return message.caption.toLowerCase().includes(lowercaseQuery);
    } else if (message.fileName) {
      return message.fileName.toLowerCase().includes(lowercaseQuery);
    }
    return false;
  });
};

export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

export const validateMessageContent = (content: string, type: Message['type']): boolean => {
  switch (type) {
    case 'text':
      return content.trim().length > 0 && content.length <= 4000;
    case 'image':
    case 'voice':
    case 'file':
    case 'video':
      return content.length > 0; // URL or file path
    default:
      return false;
  }
};

export const sanitizeMessageContent = (content: string): string => {
  // Basic HTML sanitization
  return content
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const detectUrls = (text: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};

export const linkifyText = (text: string): string => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
};

export const extractMentions = (text: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
};

export const formatMentions = (text: string): string => {
  const mentionRegex = /@(\w+)/g;
  return text.replace(mentionRegex, '<span class="mention">@$1</span>');
};

export const getMessageReactionSummary = (message: Message): string => {
  if (!message.reactions || message.reactions.length === 0) {
    return '';
  }
  
  const totalReactions = message.reactions.reduce((sum, reaction) => sum + reaction.count, 0);
  const topReaction = message.reactions.reduce((top, current) => 
    current.count > top.count ? current : top
  );
  
  if (totalReactions === 1) {
    return `${topReaction.emoji} 1`;
  } else if (message.reactions.length === 1) {
    return `${topReaction.emoji} ${totalReactions}`;
  } else {
    return `${topReaction.emoji} ${totalReactions}`;
  }
};

export const canEditMessage = (message: Message, currentUserId: string): boolean => {
  // Can only edit own text messages
  if (message.senderId !== currentUserId || message.type !== 'text') {
    return false;
  }
  
  // Can only edit messages sent within the last 15 minutes
  const messageTime = new Date(message.timestamp);
  const now = new Date();
  const timeDiff = now.getTime() - messageTime.getTime();
  const fifteenMinutes = 15 * 60 * 1000;
  
  return timeDiff <= fifteenMinutes;
};

export const canDeleteMessage = (message: Message, currentUserId: string): boolean => {
  // Can only delete own messages
  return message.senderId === currentUserId;
};

export const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateChatId = (): string => {
  return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};