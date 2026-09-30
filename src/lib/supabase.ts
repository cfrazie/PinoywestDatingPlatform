import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fail-fast approach: throw an error during startup if Supabase is not configured.
// This prevents runtime TypeErrors when code assumes a non-null Supabase client.
// To configure Supabase, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase configuration missing: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in environment variables. ' +
    'Please check your .env file or environment configuration.'
  );
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