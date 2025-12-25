/*
  # Behavioral Tracking System
  
  1. New Tables
    - `user_interactions` - Track all user behaviors
    - `user_engagement_patterns` - Aggregate engagement metrics
    - `learned_user_preferences` - AI-learned preferences from behavior
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create user interactions tracking table
CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (
    interaction_type IN (
      'profile_view', 'profile_like', 'profile_skip', 'profile_superlike',
      'message_sent', 'message_received', 'message_replied',
      'video_call_initiated', 'video_call_accepted', 'video_call_declined',
      'gift_sent', 'gift_received',
      'date_requested', 'date_accepted', 'date_declined', 'date_completed',
      'relationship_started', 'relationship_ended',
      'report', 'block', 'unmatch'
    )
  ),
  interaction_context JSONB, -- Additional context (duration, location, etc.)
  sentiment FLOAT, -- -1 to 1 (negative to positive)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  session_id UUID -- Track session context
);

-- Create user engagement patterns table
CREATE TABLE IF NOT EXISTS user_engagement_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  avg_session_duration INTEGER, -- seconds
  sessions_per_week FLOAT,
  avg_profiles_viewed_per_session INTEGER,
  like_rate FLOAT, -- % of profiles liked
  skip_rate FLOAT,
  message_response_rate FLOAT,
  message_response_time_avg INTEGER, -- seconds
  preferred_activity_times JSONB, -- Time-of-day preferences
  preferred_days JSONB, -- Day-of-week preferences
  swipe_velocity FLOAT, -- Profiles per minute
  engagement_score FLOAT, -- 0-100
  last_calculated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create learned user preferences table
CREATE TABLE IF NOT EXISTS learned_user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  preference_type TEXT NOT NULL, -- 'age_preference', 'height_preference', 'cultural_preference', etc.
  preference_value JSONB NOT NULL,
  confidence FLOAT, -- 0-1, how confident we are about this preference
  sample_size INTEGER, -- Number of interactions used to learn this
  learned_from TEXT, -- 'likes', 'messages', 'dates', etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, preference_type)
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_interactions_user ON user_interactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_interactions_target ON user_interactions(target_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_interactions_session ON user_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_positive ON user_interactions(user_id, interaction_type) 
  WHERE interaction_type IN ('profile_like', 'profile_superlike', 'message_replied', 'date_accepted');

CREATE INDEX IF NOT EXISTS idx_engagement_patterns_score ON user_engagement_patterns(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_engagement_patterns_active ON user_engagement_patterns(sessions_per_week DESC);

CREATE INDEX IF NOT EXISTS idx_learned_preferences_user ON learned_user_preferences(user_id, preference_type);
CREATE INDEX IF NOT EXISTS idx_learned_preferences_confidence ON learned_user_preferences(confidence DESC) 
  WHERE confidence > 0.7;

-- Enable Row Level Security
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_engagement_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE learned_user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_interactions
CREATE POLICY "Users can insert their own interactions" 
  ON user_interactions FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own interactions" 
  ON user_interactions FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id OR auth.uid() = target_user_id);

CREATE POLICY "Admins can read all interactions" 
  ON user_interactions FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() 
      AND is_active = true
    )
  );

-- RLS Policies for user_engagement_patterns
CREATE POLICY "Users can read their own engagement patterns" 
  ON user_engagement_patterns FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "System can update engagement patterns" 
  ON user_engagement_patterns FOR ALL 
  TO authenticated 
  WITH CHECK (true);

-- RLS Policies for learned_user_preferences
CREATE POLICY "Users can read their own learned preferences" 
  ON learned_user_preferences FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "System can update learned preferences" 
  ON learned_user_preferences FOR ALL 
  TO authenticated 
  WITH CHECK (true);

-- Function to calculate engagement score
CREATE OR REPLACE FUNCTION calculate_engagement_score(p_user_id UUID)
RETURNS FLOAT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sessions_per_week FLOAT;
  v_avg_session_duration INTEGER;
  v_like_rate FLOAT;
  v_message_response_rate FLOAT;
  v_engagement_score FLOAT;
BEGIN
  -- Get engagement metrics
  SELECT 
    sessions_per_week,
    avg_session_duration,
    like_rate,
    message_response_rate
  INTO 
    v_sessions_per_week,
    v_avg_session_duration,
    v_like_rate,
    v_message_response_rate
  FROM user_engagement_patterns
  WHERE user_id = p_user_id;
  
  -- Calculate weighted engagement score (0-100)
  v_engagement_score := LEAST(100, GREATEST(0,
    (COALESCE(v_sessions_per_week, 0) * 10) + -- Max 30 points for 3+ sessions/week
    (COALESCE(v_avg_session_duration, 0) / 60.0 * 2) + -- Max 20 points for 10+ min sessions
    (COALESCE(v_like_rate, 0) * 25) + -- Max 25 points for high like rate
    (COALESCE(v_message_response_rate, 0) * 25) -- Max 25 points for high response rate
  ));
  
  RETURN v_engagement_score;
END;
$$;

-- Function to update engagement patterns
CREATE OR REPLACE FUNCTION update_engagement_patterns(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_avg_session_duration INTEGER;
  v_sessions_per_week FLOAT;
  v_avg_profiles_viewed INTEGER;
  v_like_rate FLOAT;
  v_skip_rate FLOAT;
  v_message_response_rate FLOAT;
  v_message_response_time INTEGER;
  v_swipe_velocity FLOAT;
  v_engagement_score FLOAT;
BEGIN
  -- Calculate sessions per week (last 30 days)
  SELECT 
    COUNT(DISTINCT session_id)::FLOAT / 4.0
  INTO v_sessions_per_week
  FROM user_interactions
  WHERE user_id = p_user_id 
    AND created_at > NOW() - INTERVAL '30 days'
    AND session_id IS NOT NULL;
  
  -- Calculate like and skip rates
  SELECT 
    COUNT(*) FILTER (WHERE interaction_type IN ('profile_like', 'profile_superlike'))::FLOAT / 
      NULLIF(COUNT(*) FILTER (WHERE interaction_type IN ('profile_view', 'profile_like', 'profile_superlike', 'profile_skip'))::FLOAT, 0),
    COUNT(*) FILTER (WHERE interaction_type = 'profile_skip')::FLOAT / 
      NULLIF(COUNT(*) FILTER (WHERE interaction_type IN ('profile_view', 'profile_like', 'profile_superlike', 'profile_skip'))::FLOAT, 0)
  INTO v_like_rate, v_skip_rate
  FROM user_interactions
  WHERE user_id = p_user_id 
    AND created_at > NOW() - INTERVAL '30 days';
  
  -- Calculate message response rate
  SELECT 
    COUNT(*) FILTER (WHERE interaction_type = 'message_replied')::FLOAT / 
      NULLIF(COUNT(*) FILTER (WHERE interaction_type = 'message_received')::FLOAT, 0)
  INTO v_message_response_rate
  FROM user_interactions
  WHERE user_id = p_user_id 
    AND created_at > NOW() - INTERVAL '30 days';
  
  -- Calculate engagement score
  v_engagement_score := calculate_engagement_score(p_user_id);
  
  -- Update or insert engagement patterns
  INSERT INTO user_engagement_patterns (
    user_id,
    avg_session_duration,
    sessions_per_week,
    like_rate,
    skip_rate,
    message_response_rate,
    engagement_score,
    last_calculated
  ) VALUES (
    p_user_id,
    v_avg_session_duration,
    v_sessions_per_week,
    v_like_rate,
    v_skip_rate,
    v_message_response_rate,
    v_engagement_score,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    sessions_per_week = v_sessions_per_week,
    like_rate = v_like_rate,
    skip_rate = v_skip_rate,
    message_response_rate = v_message_response_rate,
    engagement_score = v_engagement_score,
    last_calculated = NOW(),
    updated_at = NOW();
END;
$$;
