/*
  # Cultural Do's and Don'ts System
  
  1. New Tables
    - cultural_guidelines: Wikipedia-sourced do's and don'ts
    - user_cultural_insights: Personalized cultural recommendations
    - content_moderation_logs: Content safety tracking
  
  2. Features
    - Automated Wikipedia integration
    - Category-based organization
    - Importance levels
    - User feedback (helpful/not helpful)
    - Personalized insights based on user locations
  
  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Cultural do's and don'ts
CREATE TABLE IF NOT EXISTS cultural_guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  country TEXT NOT NULL,
  region TEXT,
  category TEXT NOT NULL CHECK (category IN ('greetings', 'dining', 'dating', 'family', 'religion', 'communication', 'business', 'public_behavior', 'gifts', 'taboos')),
  
  guideline_type TEXT NOT NULL CHECK (guideline_type IN ('do', 'dont', 'tip', 'warning', 'custom')),
  
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  importance_level TEXT CHECK (importance_level IN ('critical', 'important', 'good_to_know', 'optional')),
  
  -- Source tracking
  source TEXT DEFAULT 'wikipedia',
  source_url TEXT,
  last_updated TIMESTAMPTZ,
  
  -- Engagement
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cultural_guidelines_country ON cultural_guidelines(country, category);
CREATE INDEX idx_cultural_guidelines_category ON cultural_guidelines(category, importance_level);
CREATE INDEX idx_cultural_guidelines_type ON cultural_guidelines(guideline_type);

-- User-specific cultural insights
CREATE TABLE IF NOT EXISTS user_cultural_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  home_country TEXT NOT NULL,
  current_country TEXT,
  partner_country TEXT,
  
  -- Auto-generated insights
  cultural_differences JSONB,
  communication_tips JSONB,
  dating_guidelines JSONB,
  family_expectations JSONB,
  
  last_generated TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

CREATE INDEX idx_cultural_insights_user ON user_cultural_insights(user_id);

-- Guideline feedback tracking
CREATE TABLE IF NOT EXISTS cultural_guideline_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guideline_id UUID REFERENCES cultural_guidelines(id) ON DELETE CASCADE,
  
  is_helpful BOOLEAN NOT NULL,
  comment TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, guideline_id)
);

CREATE INDEX idx_guideline_feedback_guideline ON cultural_guideline_feedback(guideline_id);

-- Content moderation logs
CREATE TABLE IF NOT EXISTS content_moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES culture_wall_posts(id),
  comment_id UUID REFERENCES culture_wall_comments(id),
  
  moderation_type TEXT CHECK (moderation_type IN ('ai_auto', 'manual_review', 'user_report')),
  
  -- AI detection results
  inappropriate_content_score FLOAT,
  hate_speech_score FLOAT,
  spam_score FLOAT,
  cultural_insensitivity_score FLOAT,
  
  action_taken TEXT CHECK (action_taken IN ('approved', 'flagged', 'removed', 'shadowban', 'warning')),
  moderator_id UUID REFERENCES auth.users(id),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_moderation_logs_post ON content_moderation_logs(post_id);
CREATE INDEX idx_moderation_logs_action ON content_moderation_logs(action_taken, created_at DESC);

-- Enable Row Level Security
ALTER TABLE cultural_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cultural_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultural_guideline_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_moderation_logs ENABLE ROW LEVEL SECURITY;

-- Policies for cultural_guidelines
CREATE POLICY "Cultural guidelines are viewable by everyone"
  ON cultural_guidelines FOR SELECT
  USING (true);

-- Policies for user_cultural_insights
CREATE POLICY "Users can view their own cultural insights"
  ON user_cultural_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cultural insights"
  ON user_cultural_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cultural insights"
  ON user_cultural_insights FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies for cultural_guideline_feedback
CREATE POLICY "Users can view their own feedback"
  ON cultural_guideline_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can submit feedback"
  ON cultural_guideline_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback"
  ON cultural_guideline_feedback FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies for content_moderation_logs (admin only viewing)
CREATE POLICY "Moderation logs viewable by admins"
  ON content_moderation_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Function to fetch cultural guidelines for location
CREATE OR REPLACE FUNCTION fetch_cultural_guidelines_for_location(
  p_country TEXT,
  p_region TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_guidelines JSONB;
BEGIN
  -- In production, this would call Wikipedia API or scrape articles
  -- Example: https://en.wikipedia.org/wiki/Culture_of_the_Philippines
  
  -- Mock data structure (real implementation would parse Wikipedia)
  v_guidelines := jsonb_build_object(
    'country', p_country,
    'guidelines', jsonb_build_array(
      jsonb_build_object(
        'category', 'greetings',
        'type', 'do',
        'title', 'Use "Mano Po" gesture',
        'description', 'Show respect to elders by taking their hand and placing it on your forehead',
        'importance', 'important'
      ),
      jsonb_build_object(
        'category', 'dining',
        'type', 'dont',
        'title', 'Don''t leave rice on your plate',
        'description', 'Leaving rice unfinished is considered wasteful and disrespectful',
        'importance', 'good_to_know'
      ),
      jsonb_build_object(
        'category', 'dating',
        'type', 'do',
        'title', 'Meet the family early',
        'description', 'Filipino dating often involves early family introductions',
        'importance', 'critical'
      )
    )
  );
  
  RETURN v_guidelines;
END;
$$;

-- Function to generate personalized cultural insights
CREATE OR REPLACE FUNCTION generate_cultural_insights(
  p_user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_home_location RECORD;
  v_current_location RECORD;
  v_insights JSONB;
BEGIN
  -- Get user's home location
  SELECT country INTO v_home_location
  FROM user_locations
  WHERE user_id = p_user_id AND location_type = 'home'
  LIMIT 1;
  
  -- Get user's current location
  SELECT country INTO v_current_location
  FROM user_locations
  WHERE user_id = p_user_id AND location_type = 'current'
  LIMIT 1;
  
  -- Generate insights based on location differences
  v_insights := jsonb_build_object(
    'has_cultural_difference', v_home_location.country != v_current_location.country,
    'home_country', v_home_location.country,
    'current_country', v_current_location.country,
    'recommendations', jsonb_build_array(
      'Learn about local dining customs',
      'Understand family expectations in relationships',
      'Study common greetings and social etiquette'
    )
  );
  
  RETURN v_insights;
END;
$$;

-- Function to update guideline feedback counts
CREATE OR REPLACE FUNCTION update_guideline_feedback_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_helpful THEN
      UPDATE cultural_guidelines
      SET helpful_count = helpful_count + 1
      WHERE id = NEW.guideline_id;
    ELSE
      UPDATE cultural_guidelines
      SET not_helpful_count = not_helpful_count + 1
      WHERE id = NEW.guideline_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Remove old vote
    IF OLD.is_helpful THEN
      UPDATE cultural_guidelines
      SET helpful_count = GREATEST(helpful_count - 1, 0)
      WHERE id = OLD.guideline_id;
    ELSE
      UPDATE cultural_guidelines
      SET not_helpful_count = GREATEST(not_helpful_count - 1, 0)
      WHERE id = OLD.guideline_id;
    END IF;
    -- Add new vote
    IF NEW.is_helpful THEN
      UPDATE cultural_guidelines
      SET helpful_count = helpful_count + 1
      WHERE id = NEW.guideline_id;
    ELSE
      UPDATE cultural_guidelines
      SET not_helpful_count = not_helpful_count + 1
      WHERE id = NEW.guideline_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.is_helpful THEN
      UPDATE cultural_guidelines
      SET helpful_count = GREATEST(helpful_count - 1, 0)
      WHERE id = OLD.guideline_id;
    ELSE
      UPDATE cultural_guidelines
      SET not_helpful_count = GREATEST(not_helpful_count - 1, 0)
      WHERE id = OLD.guideline_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_guideline_feedback
  AFTER INSERT OR UPDATE OR DELETE ON cultural_guideline_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_guideline_feedback_counts();

-- Trigger to update timestamps
CREATE TRIGGER update_guidelines_timestamp
  BEFORE UPDATE ON cultural_guidelines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insights_timestamp
  BEFORE UPDATE ON user_cultural_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample cultural guidelines
INSERT INTO cultural_guidelines (country, category, guideline_type, title, description, importance_level, source_url) VALUES
('Philippines', 'greetings', 'do', 'Use "Mano Po" gesture', 'Show respect to elders by taking their hand and placing it on your forehead. This is called "pagmamano" and is a sign of respect.', 'important', 'https://en.wikipedia.org/wiki/Mano_(gesture)'),
('Philippines', 'dining', 'dont', 'Don''t leave rice on your plate', 'Leaving rice unfinished is considered wasteful and disrespectful in Filipino culture.', 'good_to_know', 'https://en.wikipedia.org/wiki/Filipino_cuisine'),
('Philippines', 'dating', 'do', 'Meet the family early', 'Filipino dating culture often involves early family introductions. Be prepared to meet parents and extended family.', 'critical', 'https://en.wikipedia.org/wiki/Culture_of_the_Philippines'),
('Philippines', 'family', 'do', 'Show respect to elders', 'Always use "po" and "opo" when speaking to elders. Address them with proper titles like Ate, Kuya, Tito, Tita.', 'critical', 'https://en.wikipedia.org/wiki/Filipino_values'),
('Philippines', 'communication', 'tip', 'Understand indirect communication', 'Filipinos often use indirect communication to avoid confrontation. "Maybe" often means "no" in a polite way.', 'important', 'https://en.wikipedia.org/wiki/Filipino_psychology'),
('Philippines', 'public_behavior', 'dont', 'Avoid public displays of anger', 'Showing strong emotions in public, especially anger, is considered inappropriate in Filipino culture.', 'important', 'https://en.wikipedia.org/wiki/Culture_of_the_Philippines'),
('Philippines', 'gifts', 'do', 'Bring pasalubong when visiting', 'It''s customary to bring gifts (pasalubong) when visiting someone''s home or returning from travel.', 'good_to_know', 'https://en.wikipedia.org/wiki/Pasalubong'),
('Philippines', 'religion', 'do', 'Respect religious practices', 'The Philippines is predominantly Catholic. Respect religious holidays, church attendance, and family prayers.', 'important', 'https://en.wikipedia.org/wiki/Religion_in_the_Philippines'),
('United States', 'greetings', 'do', 'Offer a firm handshake', 'A firm handshake with eye contact is the standard greeting in American business and social contexts.', 'important', 'https://en.wikipedia.org/wiki/Culture_of_the_United_States'),
('United States', 'communication', 'do', 'Be direct and clear', 'Americans value direct communication. Say what you mean clearly and concisely.', 'important', 'https://en.wikipedia.org/wiki/Communication_in_the_United_States'),
('United States', 'dating', 'tip', 'Dating is often casual at first', 'American dating culture often starts casually. Multiple dates don''t necessarily mean exclusivity.', 'good_to_know', 'https://en.wikipedia.org/wiki/Dating'),
('United States', 'public_behavior', 'do', 'Maintain personal space', 'Americans value personal space. Stand at least an arm''s length away in conversations.', 'important', 'https://en.wikipedia.org/wiki/Proxemics');
