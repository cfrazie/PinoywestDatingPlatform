// Live Stream Types for TikTok-style multi-participant streaming
import SimplePeer from 'simple-peer';

export type StreamStatus = 'idle' | 'starting' | 'live' | 'ended' | 'error';
export type ParticipantRole = 'host' | 'participant';
export type LayoutType = 'grid' | 'spotlight';

export interface LiveStream {
  id: string;
  host_id: string;
  title: string;
  status: StreamStatus;
  created_at: string;
  ended_at?: string;
  max_participants: number;
  viewer_count: number;
  layout_type: LayoutType;
  spotlight_user_id?: string;
}

export interface StreamParticipant {
  id: string;
  stream_id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  role: ParticipantRole;
  is_muted: boolean;
  is_video_enabled: boolean;
  is_minimized: boolean;
  joined_at: string;
  left_at?: string;
  is_speaking?: boolean;
  connection_quality?: 'excellent' | 'good' | 'poor';
}

export interface StreamLayoutState {
  stream_id: string;
  spotlight_user_id?: string;
  layout_type: LayoutType;
  updated_at: string;
}

export interface PeerConnection {
  peer_id: string;
  user_id: string;
  peer: SimplePeer.Instance; // SimplePeer instance
  stream?: MediaStream;
}

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join' | 'leave' | 'layout-change' | 'control';
  from: string;
  to?: string;
  stream_id: string;
  data: any;
  timestamp: string;
}

export interface HostControl {
  type: 'spotlight' | 'minimize' | 'unmute' | 'remove' | 'layout-change';
  target_user_id?: string;
  value?: any;
}

export interface GridLayoutConfig {
  columns: number;
  rows: number;
  maxParticipants: number;
}

export interface StreamStats {
  stream_id: string;
  duration: number;
  peak_viewers: number;
  total_participants: number;
  messages_count: number;
  started_at: string;
}

export interface ChatMessage {
  id: string;
  stream_id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  message: string;
  timestamp: string;
  is_host: boolean;
}

export interface StreamPermissions {
  can_stream: boolean;
  can_join: boolean;
  can_chat: boolean;
  can_use_video: boolean;
  can_use_audio: boolean;
}
