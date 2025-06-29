import { ChatUser } from './messaging';

export type CallType = 'video' | 'audio';
export type CallStatus = 'pending' | 'ringing' | 'connecting' | 'connected' | 'ended' | 'missed' | 'rejected' | 'completed';
export type CallQuality = 'excellent' | 'good' | 'poor' | 'unknown';
export type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

export interface VideoCallState {
  callId: string;
  status: CallStatus;
  startTime?: string;
  endTime?: string;
  duration?: number;
  participants: string[];
  initiatorId: string;
  callType: CallType;
  quality: CallQuality;
  connectionStatus: ConnectionStatus;
}

export interface CallRecord {
  id: string;
  participantIds: string[];
  initiatorId: string;
  callType: CallType;
  status: CallStatus;
  startTime: string;
  endTime?: string;
  duration?: number;
  quality?: CallQuality;
  participant: ChatUser;
  recordingUrl?: string;
  notes?: string;
}

export interface CallSettings {
  videoEnabled: boolean;
  audioEnabled: boolean;
  speakerEnabled: boolean;
  cameraFacing: 'user' | 'environment';
  videoQuality: 'low' | 'medium' | 'high' | 'hd';
  audioQuality: 'low' | 'medium' | 'high';
  noiseCancellation: boolean;
  echoCancellation: boolean;
  autoAnswer: boolean;
  recordCalls: boolean;
}

export interface CallStatistics {
  totalCalls: number;
  videoCalls: number;
  audioCalls: number;
  missedCalls: number;
  averageDuration: number;
  totalDuration: number;
  callsThisWeek: number;
  callsThisMonth: number;
  longestCall: number;
  shortestCall: number;
  mostFrequentContact?: ChatUser;
}

export interface CallNotification {
  id: string;
  callId: string;
  type: 'incoming' | 'missed' | 'scheduled' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  participant?: ChatUser;
}

export interface ScheduledCall {
  id: string;
  participantIds: string[];
  scheduledBy: string;
  callType: CallType;
  scheduledTime: string;
  timezone: string;
  title?: string;
  description?: string;
  reminderMinutes: number[];
  status: 'scheduled' | 'reminded' | 'started' | 'completed' | 'cancelled' | 'missed';
  createdAt: string;
  updatedAt: string;
  participants: ChatUser[];
}

export interface CallReaction {
  id: string;
  callId: string;
  userId: string;
  emoji: string;
  timestamp: string;
}

export interface CallRecording {
  id: string;
  callId: string;
  url: string;
  duration: number;
  size: number;
  format: 'mp4' | 'webm' | 'mov';
  quality: 'low' | 'medium' | 'high' | 'hd';
  createdAt: string;
  expiresAt?: string;
  isDownloadable: boolean;
  thumbnailUrl?: string;
}

export interface CallAnalytics {
  callId: string;
  duration: number;
  quality: CallQuality;
  averageBitrate: number;
  packetsLost: number;
  jitter: number;
  latency: number;
  resolution?: {
    width: number;
    height: number;
  };
  frameRate?: number;
  audioCodec: string;
  videoCodec?: string;
  networkType: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  deviceInfo: {
    browser: string;
    os: string;
    device: string;
  };
}

export interface CallPermissions {
  camera: boolean;
  microphone: boolean;
  speaker: boolean;
  screenShare: boolean;
  recording: boolean;
}

export interface CallError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  recoverable: boolean;
}

export interface CallInvite {
  id: string;
  callId: string;
  fromUserId: string;
  toUserId: string;
  callType: CallType;
  message?: string;
  scheduledTime?: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
  fromUser: ChatUser;
}

export interface CallFeedback {
  id: string;
  callId: string;
  userId: string;
  rating: number; // 1-5 stars
  qualityRating: number; // 1-5 stars
  audioQuality: number; // 1-5 stars
  videoQuality?: number; // 1-5 stars
  comments?: string;
  issues: string[]; // Array of issue types
  wouldRecommend: boolean;
  createdAt: string;
}

export interface CallBlocking {
  id: string;
  userId: string;
  blockedUserId: string;
  blockType: 'calls' | 'video_calls' | 'audio_calls' | 'all';
  reason?: string;
  blockedAt: string;
  expiresAt?: string;
}

export interface CallLimit {
  userId: string;
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  dailyUsed: number;
  weeklyUsed: number;
  monthlyUsed: number;
  lastReset: string;
  premiumUser: boolean;
}

export interface CallQueue {
  id: string;
  userId: string;
  targetUserId: string;
  callType: CallType;
  priority: number;
  estimatedWaitTime: number;
  position: number;
  createdAt: string;
  status: 'waiting' | 'connecting' | 'connected' | 'cancelled' | 'expired';
}

export interface CallTranscription {
  id: string;
  callId: string;
  language: string;
  transcript: Array<{
    speaker: string;
    text: string;
    timestamp: number;
    confidence: number;
  }>;
  accuracy: number;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

export interface CallTranslation {
  id: string;
  callId: string;
  fromLanguage: string;
  toLanguage: string;
  translations: Array<{
    originalText: string;
    translatedText: string;
    speaker: string;
    timestamp: number;
    confidence: number;
  }>;
  isRealTime: boolean;
  provider: string;
  createdAt: string;
}

export interface CallBackgroundEffect {
  id: string;
  name: string;
  type: 'blur' | 'image' | 'video' | 'virtual';
  url?: string;
  thumbnailUrl: string;
  category: 'professional' | 'casual' | 'fun' | 'romantic' | 'nature';
  isPremium: boolean;
  isDefault: boolean;
}

export interface CallFilter {
  id: string;
  name: string;
  type: 'beauty' | 'color' | 'artistic' | 'fun';
  intensity: number; // 0-100
  parameters: Record<string, any>;
  thumbnailUrl: string;
  isPremium: boolean;
  isDefault: boolean;
}

export interface CallGift {
  id: string;
  name: string;
  type: 'virtual' | 'real';
  category: 'flowers' | 'jewelry' | 'food' | 'experience' | 'custom';
  price: number;
  currency: string;
  imageUrl: string;
  animationUrl?: string;
  description: string;
  isAvailable: boolean;
  isPremium: boolean;
}

export interface CallGiftTransaction {
  id: string;
  callId: string;
  giftId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  message?: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  gift: CallGift;
}

export interface CallModerationReport {
  id: string;
  callId: string;
  reportedBy: string;
  reportedUser: string;
  reason: string;
  description?: string;
  evidence?: string[];
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
  moderatorNotes?: string;
}

export interface CallEmergency {
  id: string;
  callId: string;
  userId: string;
  type: 'safety' | 'technical' | 'harassment' | 'other';
  description: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  timestamp: string;
  status: 'reported' | 'acknowledged' | 'resolved';
  responseTime?: number;
  resolution?: string;
}