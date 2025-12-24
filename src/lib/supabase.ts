import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail fast: ensure developers know env vars are missing instead of letting runtime errors occur later.
  // This prevents runtime TypeErrors when code assumes `supabase` is a client instance.
  throw new Error('Missing Supabase env vars: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    };
  };
}