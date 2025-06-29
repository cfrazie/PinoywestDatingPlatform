export interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: string;
  location?: string;
  age?: number;
  verified?: boolean;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  recipientId: string;
  type: 'text' | 'image' | 'voice' | 'file' | 'video';
  content: string;
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  replyTo?: {
    id: string;
    content: string;
    senderId: string;
  };
  reactions?: MessageReaction[];
  fileName?: string;
  fileSize?: number;
  duration?: number; // for voice/video messages
  caption?: string; // for media messages
  isEdited?: boolean;
  editedAt?: string;
}

export interface Chat {
  id: string;
  participants: ChatUser[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  isPinned: boolean;
  isBlocked: boolean;
  chatType: 'direct' | 'group';
  groupName?: string;
  groupAvatar?: string;
}

export interface TypingStatus {
  userId: string;
  chatId: string;
  isTyping: boolean;
  timestamp: string;
}

export interface MessageDraft {
  chatId: string;
  content: string;
  timestamp: string;
}

export interface ChatSettings {
  notifications: boolean;
  soundEnabled: boolean;
  readReceipts: boolean;
  typingIndicators: boolean;
  autoDownloadMedia: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export interface VoiceRecording {
  blob: Blob;
  duration: number;
  waveform?: number[];
}

export interface FileUpload {
  file: File;
  progress: number;
  url?: string;
  error?: string;
}

export interface MessageFilter {
  chatId?: string;
  senderId?: string;
  type?: Message['type'];
  dateFrom?: string;
  dateTo?: string;
  hasAttachments?: boolean;
  isUnread?: boolean;
}

export interface ChatListFilter {
  query?: string;
  isUnread?: boolean;
  isArchived?: boolean;
  isPinned?: boolean;
  hasUnreadMessages?: boolean;
}

export interface MessageSearchResult {
  message: Message;
  chat: Chat;
  highlights: string[];
}

export interface ChatAnalytics {
  totalMessages: number;
  messagesThisWeek: number;
  averageResponseTime: number;
  mostActiveHour: number;
  messageTypes: Record<Message['type'], number>;
  topContacts: Array<{
    user: ChatUser;
    messageCount: number;
  }>;
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  showPreview: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface MessageEncryption {
  isEncrypted: boolean;
  keyId?: string;
  algorithm?: string;
}

export interface MessageDeliveryStatus {
  messageId: string;
  status: Message['status'];
  timestamp: string;
  recipientId: string;
}

export interface ChatInvite {
  id: string;
  chatId: string;
  inviterId: string;
  inviteeId: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
  expiresAt: string;
}

export interface BlockedUser {
  id: string;
  userId: string;
  blockedUserId: string;
  reason?: string;
  blockedAt: string;
}

export interface ReportedMessage {
  id: string;
  messageId: string;
  reporterId: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  isDefault: boolean;
  usageCount: number;
  createdAt: string;
}

export interface ChatBackup {
  id: string;
  chatId: string;
  userId: string;
  messages: Message[];
  createdAt: string;
  size: number;
  format: 'json' | 'txt' | 'pdf';
}

export interface MessageSchedule {
  id: string;
  chatId: string;
  senderId: string;
  message: Omit<Message, 'id' | 'timestamp' | 'status'>;
  scheduledFor: string;
  status: 'scheduled' | 'sent' | 'cancelled' | 'failed';
  createdAt: string;
}

export interface ChatModerationSettings {
  autoModeration: boolean;
  profanityFilter: boolean;
  spamDetection: boolean;
  linkBlocking: boolean;
  imageModeration: boolean;
  allowedFileTypes: string[];
  maxFileSize: number;
  maxMessageLength: number;
}

export interface MessageTranslation {
  messageId: string;
  originalLanguage: string;
  targetLanguage: string;
  translatedContent: string;
  confidence: number;
  provider: string;
  timestamp: string;
}

export interface VoiceTranscription {
  messageId: string;
  transcription: string;
  language: string;
  confidence: number;
  provider: string;
  timestamp: string;
}

export interface ChatTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    messageOwn: string;
    messageOther: string;
    text: string;
    textSecondary: string;
  };
  wallpaper?: string;
  isDefault: boolean;
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  timestamp: string;
}

export interface ChatPermissions {
  canSendMessages: boolean;
  canSendMedia: boolean;
  canSendVoice: boolean;
  canSendFiles: boolean;
  canDeleteMessages: boolean;
  canEditMessages: boolean;
  canReactToMessages: boolean;
  canForwardMessages: boolean;
  canInviteUsers: boolean;
  canChangeSettings: boolean;
}

export interface MessageForward {
  id: string;
  originalMessageId: string;
  forwardedBy: string;
  forwardedTo: string[];
  timestamp: string;
  preserveAttribution: boolean;
}

export interface ChatStatistics {
  messageCount: number;
  participantCount: number;
  mediaCount: number;
  averageResponseTime: number;
  peakActivityHour: number;
  totalSize: number;
  oldestMessage: string;
  newestMessage: string;
}

export interface MessageEdit {
  id: string;
  messageId: string;
  originalContent: string;
  newContent: string;
  editedBy: string;
  editedAt: string;
  reason?: string;
}

export interface ChatExport {
  id: string;
  chatId: string;
  userId: string;
  format: 'json' | 'csv' | 'txt' | 'pdf' | 'html';
  dateRange: {
    from: string;
    to: string;
  };
  includeMedia: boolean;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  createdAt: string;
  completedAt?: string;
  fileSize?: number;
}