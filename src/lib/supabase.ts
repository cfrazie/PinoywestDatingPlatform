import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not configured. Some features may not work.');
  console.log('To configure Supabase, visit: http://localhost:5173/#admin');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database types
export interface Database {
  public: {
    Tables: {
      contact_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          created_at: string;
          status: 'new' | 'read' | 'responded';
        };
        Insert: {
          name: string;
          email: string;
          subject: string;
          message: string;
          status?: 'new' | 'read' | 'responded';
        };
        Update: {
          name?: string;
          email?: string;
          subject?: string;
          message?: string;
          status?: 'new' | 'read' | 'responded';
        };
      };
      newsletter_subscriptions: {
        Row: {
          id: string;
          email: string;
          subscribed_at: string;
          active: boolean;
        };
        Insert: {
          email: string;
          active?: boolean;
        };
        Update: {
          email?: string;
          active?: boolean;
        };
      };
      analytics_events: {
        Row: {
          id: string;
          event_type: string;
          event_data: any;
          user_agent: string;
          ip_address: string;
          created_at: string;
        };
        Insert: {
          event_type: string;
          event_data?: any;
          user_agent?: string;
          ip_address?: string;
        };
        Update: {
          event_type?: string;
          event_data?: any;
          user_agent?: string;
          ip_address?: string;
        };
      };
      live_streams: {
        Row: {
          id: string;
          host_id: string;
          title: string;
          status: 'idle' | 'starting' | 'live' | 'ended' | 'error';
          created_at: string;
          ended_at: string | null;
          max_participants: number;
          viewer_count: number;
          layout_type: 'grid' | 'spotlight';
          spotlight_user_id: string | null;
        };
        Insert: {
          host_id: string;
          title: string;
          status?: 'idle' | 'starting' | 'live' | 'ended' | 'error';
          max_participants?: number;
          viewer_count?: number;
          layout_type?: 'grid' | 'spotlight';
          spotlight_user_id?: string | null;
        };
        Update: {
          title?: string;
          status?: 'idle' | 'starting' | 'live' | 'ended' | 'error';
          ended_at?: string | null;
          max_participants?: number;
          viewer_count?: number;
          layout_type?: 'grid' | 'spotlight';
          spotlight_user_id?: string | null;
        };
      };
      stream_participants: {
        Row: {
          id: string;
          stream_id: string;
          user_id: string;
          username: string;
          avatar_url: string | null;
          role: 'host' | 'participant';
          is_muted: boolean;
          is_video_enabled: boolean;
          is_minimized: boolean;
          joined_at: string;
          left_at: string | null;
        };
        Insert: {
          stream_id: string;
          user_id: string;
          username: string;
          avatar_url?: string | null;
          role?: 'host' | 'participant';
          is_muted?: boolean;
          is_video_enabled?: boolean;
          is_minimized?: boolean;
        };
        Update: {
          is_muted?: boolean;
          is_video_enabled?: boolean;
          is_minimized?: boolean;
          left_at?: string | null;
        };
      };
      stream_layout_state: {
        Row: {
          stream_id: string;
          spotlight_user_id: string | null;
          layout_type: 'grid' | 'spotlight';
          updated_at: string;
        };
        Insert: {
          stream_id: string;
          spotlight_user_id?: string | null;
          layout_type?: 'grid' | 'spotlight';
        };
        Update: {
          spotlight_user_id?: string | null;
          layout_type?: 'grid' | 'spotlight';
          updated_at?: string;
        };
      };
      stream_chat: {
        Row: {
          id: string;
          stream_id: string;
          user_id: string;
          username: string;
          avatar_url: string | null;
          message: string;
          timestamp: string;
          is_host: boolean;
        };
        Insert: {
          stream_id: string;
          user_id: string;
          username: string;
          avatar_url?: string | null;
          message: string;
          is_host?: boolean;
        };
        Update: {
          message?: string;
        };
      };
    };
  };
}