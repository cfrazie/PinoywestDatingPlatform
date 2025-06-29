/*
  # Video Calling System Database Schema

  1. New Tables
    - `call_records` - Store video/audio call records
    - `scheduled_calls` - Store scheduled video calls
    - `call_participants` - Many-to-many relationship for call participants
    - `call_reactions` - Store reactions sent during calls
    - `call_recordings` - Store call recording metadata
    - `call_settings` - User call preferences and settings
    - `call_feedback` - User feedback and ratings for calls
    - `call_analytics` - Call quality and performance metrics

  2. Security
    - Enable RLS on all tables
    - Add policies for user access control
    - Ensure privacy and security for call data

  3. Indexes
    - Add performance indexes for common queries
    - Add foreign key constraints
*/

-- Create call_records table
CREATE TABLE IF NOT EXISTS call_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  initiator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  call_type TEXT NOT NULL CHECK (call_type IN ('video', 'audio')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'ringing', 'connecting', 'connected', 'ended', 'missed', 'rejected', 'completed')),
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  duration INTEGER, -- in seconds
  quality TEXT CHECK (quality IN ('excellent', 'good', 'poor', 'unknown')),
  connection_status TEXT CHECK (connection_status IN ('connecting', 'connected', 'reconnecting', 'disconnected')),
  recording_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create scheduled_calls table
CREATE TABLE IF NOT EXISTS scheduled_calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scheduled_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  call_type TEXT NOT NULL CHECK (call_type IN ('video', 'audio')),
  scheduled_time TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL,
  title TEXT,
  description TEXT,
  reminder_minutes INTEGER[] DEFAULT ARRAY[15, 60], -- reminder times in minutes
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'reminded', 'started', 'completed', 'cancelled', 'missed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create call_participants table (for group calls)
CREATE TABLE IF NOT EXISTS call_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id UUID REFERENCES call_records(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  role TEXT DEFAULT 'participant' CHECK (role IN ('host', 'participant')),
  is_muted BOOLEAN DEFAULT false,
  is_video_enabled BOOLEAN DEFAULT true,
  UNIQUE(call_id, user_id)
);

-- Create call_reactions table
CREATE TABLE IF NOT EXISTS call_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id UUID REFERENCES call_records(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create call_recordings table
CREATE TABLE IF NOT EXISTS call_recordings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id UUID REFERENCES call_records(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  duration INTEGER NOT NULL, -- in seconds
  file_size BIGINT, -- in bytes
  format TEXT DEFAULT 'mp4' CHECK (format IN ('mp4', 'webm', 'mov')),
  quality TEXT DEFAULT 'medium' CHECK (quality IN ('low', 'medium', 'high', 'hd')),
  thumbnail_url TEXT,
  is_downloadable BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create call_settings table
CREATE TABLE IF NOT EXISTS call_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  video_enabled BOOLEAN DEFAULT true,
  audio_enabled BOOLEAN DEFAULT true,
  speaker_enabled BOOLEAN DEFAULT false,
  camera_facing TEXT DEFAULT 'user' CHECK (camera_facing IN ('user', 'environment')),
  video_quality TEXT DEFAULT 'medium' CHECK (video_quality IN ('low', 'medium', 'high', 'hd')),
  audio_quality TEXT DEFAULT 'medium' CHECK (audio_quality IN ('low', 'medium', 'high')),
  noise_cancellation BOOLEAN DEFAULT true,
  echo_cancellation BOOLEAN DEFAULT true,
  auto_answer BOOLEAN DEFAULT false,
  record_calls BOOLEAN DEFAULT false,
  allow_incoming_calls BOOLEAN DEFAULT true,
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create call_feedback table
CREATE TABLE IF NOT EXISTS call_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id UUID REFERENCES call_records(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  audio_quality INTEGER CHECK (audio_quality >= 1 AND audio_quality <= 5),
  video_quality INTEGER CHECK (video_quality >= 1 AND video_quality <= 5),
  comments TEXT,
  issues TEXT[], -- array of issue types
  would_recommend BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(call_id, user_id)
);

-- Create call_analytics table
CREATE TABLE IF NOT EXISTS call_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id UUID REFERENCES call_records(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  duration INTEGER NOT NULL, -- in seconds
  quality TEXT NOT NULL CHECK (quality IN ('excellent', 'good', 'poor', 'unknown')),
  average_bitrate INTEGER, -- in kbps
  packets_lost INTEGER DEFAULT 0,
  jitter FLOAT DEFAULT 0, -- in milliseconds
  latency FLOAT DEFAULT 0, -- in milliseconds
  resolution_width INTEGER,
  resolution_height INTEGER,
  frame_rate INTEGER,
  audio_codec TEXT,
  video_codec TEXT,
  network_type TEXT CHECK (network_type IN ('wifi', 'cellular', 'ethernet', 'unknown')),
  browser TEXT,
  os TEXT,
  device TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create call_invites table
CREATE TABLE IF NOT EXISTS call_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id UUID REFERENCES call_records(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  call_type TEXT NOT NULL CHECK (call_type IN ('video', 'audio')),
  message TEXT,
  scheduled_time TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create call_blocking table
CREATE TABLE IF NOT EXISTS call_blocking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  block_type TEXT DEFAULT 'all' CHECK (block_type IN ('calls', 'video_calls', 'audio_calls', 'all')),
  reason TEXT,
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id, blocked_user_id)
);

-- Enable Row Level Security
ALTER TABLE call_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_blocking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for call_records
CREATE POLICY "Users can view their own call records" ON call_records
  FOR SELECT TO authenticated USING (
    auth.uid() = initiator_id OR auth.uid() = target_id
  );

CREATE POLICY "Users can create call records" ON call_records
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = initiator_id
  );

CREATE POLICY "Users can update their own call records" ON call_records
  FOR UPDATE TO authenticated USING (
    auth.uid() = initiator_id OR auth.uid() = target_id
  );

-- Create RLS policies for scheduled_calls
CREATE POLICY "Users can view their scheduled calls" ON scheduled_calls
  FOR SELECT TO authenticated USING (
    auth.uid() = scheduled_by OR auth.uid() = participant_id
  );

CREATE POLICY "Users can create scheduled calls" ON scheduled_calls
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = scheduled_by
  );

CREATE POLICY "Users can update their scheduled calls" ON scheduled_calls
  FOR UPDATE TO authenticated USING (
    auth.uid() = scheduled_by OR auth.uid() = participant_id
  );

-- Create RLS policies for call_participants
CREATE POLICY "Users can view call participants for their calls" ON call_participants
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM call_records 
      WHERE call_records.id = call_participants.call_id 
      AND (call_records.initiator_id = auth.uid() OR call_records.target_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage their own participation" ON call_participants
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Create RLS policies for call_reactions
CREATE POLICY "Users can view reactions in their calls" ON call_reactions
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM call_records 
      WHERE call_records.id = call_reactions.call_id 
      AND (call_records.initiator_id = auth.uid() OR call_records.target_id = auth.uid())
    )
  );

CREATE POLICY "Users can add reactions to their calls" ON call_reactions
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM call_records 
      WHERE call_records.id = call_reactions.call_id 
      AND (call_records.initiator_id = auth.uid() OR call_records.target_id = auth.uid())
    )
  );

-- Create RLS policies for call_recordings
CREATE POLICY "Users can view recordings of their calls" ON call_recordings
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM call_records 
      WHERE call_records.id = call_recordings.call_id 
      AND (call_records.initiator_id = auth.uid() OR call_records.target_id = auth.uid())
    )
  );

-- Create RLS policies for call_settings
CREATE POLICY "Users can manage their own call settings" ON call_settings
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Create RLS policies for call_feedback
CREATE POLICY "Users can view feedback for their calls" ON call_feedback
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM call_records 
      WHERE call_records.id = call_feedback.call_id 
      AND (call_records.initiator_id = auth.uid() OR call_records.target_id = auth.uid())
    )
  );

CREATE POLICY "Users can provide feedback for their calls" ON call_feedback
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM call_records 
      WHERE call_records.id = call_feedback.call_id 
      AND (call_records.initiator_id = auth.uid() OR call_records.target_id = auth.uid())
    )
  );

-- Create RLS policies for call_analytics
CREATE POLICY "Users can view analytics for their calls" ON call_analytics
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM call_records 
      WHERE call_records.id = call_analytics.call_id 
      AND (call_records.initiator_id = auth.uid() OR call_records.target_id = auth.uid())
    )
  );

CREATE POLICY "System can insert call analytics" ON call_analytics
  FOR INSERT TO authenticated WITH CHECK (true);

-- Create RLS policies for call_invites
CREATE POLICY "Users can view their call invites" ON call_invites
  FOR SELECT TO authenticated USING (
    auth.uid() = from_user_id OR auth.uid() = to_user_id
  );

CREATE POLICY "Users can create call invites" ON call_invites
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = from_user_id
  );

CREATE POLICY "Users can update call invites they received" ON call_invites
  FOR UPDATE TO authenticated USING (
    auth.uid() = to_user_id
  );

-- Create RLS policies for call_blocking
CREATE POLICY "Users can manage their call blocking" ON call_blocking
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_call_records_initiator_id ON call_records(initiator_id);
CREATE INDEX IF NOT EXISTS idx_call_records_target_id ON call_records(target_id);
CREATE INDEX IF NOT EXISTS idx_call_records_start_time ON call_records(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_call_records_status ON call_records(status);
CREATE INDEX IF NOT EXISTS idx_call_records_call_type ON call_records(call_type);

CREATE INDEX IF NOT EXISTS idx_scheduled_calls_scheduled_by ON scheduled_calls(scheduled_by);
CREATE INDEX IF NOT EXISTS idx_scheduled_calls_participant_id ON scheduled_calls(participant_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_calls_scheduled_time ON scheduled_calls(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_scheduled_calls_status ON scheduled_calls(status);

CREATE INDEX IF NOT EXISTS idx_call_participants_call_id ON call_participants(call_id);
CREATE INDEX IF NOT EXISTS idx_call_participants_user_id ON call_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_call_reactions_call_id ON call_reactions(call_id);
CREATE INDEX IF NOT EXISTS idx_call_reactions_user_id ON call_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_call_reactions_timestamp ON call_reactions(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_call_recordings_call_id ON call_recordings(call_id);
CREATE INDEX IF NOT EXISTS idx_call_recordings_created_at ON call_recordings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_call_feedback_call_id ON call_feedback(call_id);
CREATE INDEX IF NOT EXISTS idx_call_feedback_user_id ON call_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_call_feedback_overall_rating ON call_feedback(overall_rating);

CREATE INDEX IF NOT EXISTS idx_call_analytics_call_id ON call_analytics(call_id);
CREATE INDEX IF NOT EXISTS idx_call_analytics_user_id ON call_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_call_analytics_quality ON call_analytics(quality);

CREATE INDEX IF NOT EXISTS idx_call_invites_from_user_id ON call_invites(from_user_id);
CREATE INDEX IF NOT EXISTS idx_call_invites_to_user_id ON call_invites(to_user_id);
CREATE INDEX IF NOT EXISTS idx_call_invites_status ON call_invites(status);
CREATE INDEX IF NOT EXISTS idx_call_invites_expires_at ON call_invites(expires_at);

CREATE INDEX IF NOT EXISTS idx_call_blocking_user_id ON call_blocking(user_id);
CREATE INDEX IF NOT EXISTS idx_call_blocking_blocked_user_id ON call_blocking(blocked_user_id);

-- Create triggers for updating timestamps
CREATE TRIGGER update_call_records_updated_at 
  BEFORE UPDATE ON call_records 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_calls_updated_at 
  BEFORE UPDATE ON scheduled_calls 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_call_settings_updated_at 
  BEFORE UPDATE ON call_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to get call statistics
CREATE OR REPLACE FUNCTION get_call_statistics(user_id_param UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_calls', COUNT(*),
        'video_calls', COUNT(*) FILTER (WHERE call_type = 'video'),
        'audio_calls', COUNT(*) FILTER (WHERE call_type = 'audio'),
        'missed_calls', COUNT(*) FILTER (WHERE status = 'missed'),
        'average_duration', AVG(duration),
        'total_duration', SUM(duration),
        'calls_this_week', COUNT(*) FILTER (WHERE start_time >= NOW() - INTERVAL '7 days'),
        'calls_this_month', COUNT(*) FILTER (WHERE start_time >= NOW() - INTERVAL '30 days')
    )
    INTO result
    FROM call_records
    WHERE initiator_id = user_id_param OR target_id = user_id_param;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user can make calls
CREATE OR REPLACE FUNCTION can_user_make_call(caller_id UUID, target_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if target user has blocked the caller
    IF EXISTS (
        SELECT 1 FROM call_blocking 
        WHERE user_id = target_id 
        AND blocked_user_id = caller_id 
        AND (expires_at IS NULL OR expires_at > NOW())
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Check if target user allows incoming calls
    IF EXISTS (
        SELECT 1 FROM call_settings 
        WHERE user_id = target_id 
        AND allow_incoming_calls = FALSE
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Check quiet hours
    IF EXISTS (
        SELECT 1 FROM call_settings 
        WHERE user_id = target_id 
        AND quiet_hours_enabled = TRUE
        AND CURRENT_TIME BETWEEN quiet_hours_start AND quiet_hours_end
    ) THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to clean up expired call invites
CREATE OR REPLACE FUNCTION cleanup_expired_call_invites()
RETURNS VOID AS $$
BEGIN
    UPDATE call_invites 
    SET status = 'expired' 
    WHERE status = 'pending' 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to send call reminders
CREATE OR REPLACE FUNCTION send_call_reminders()
RETURNS VOID AS $$
BEGIN
    -- This would integrate with your notification system
    -- For now, just update the status
    UPDATE scheduled_calls 
    SET status = 'reminded' 
    WHERE status = 'scheduled' 
    AND scheduled_time - INTERVAL '15 minutes' <= NOW()
    AND scheduled_time > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;