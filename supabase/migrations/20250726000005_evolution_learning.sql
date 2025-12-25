/*
  # Compatibility Evolution & Real-Time Learning
  
  1. New Tables
    - `compatibility_evolution` - Track compatibility changes over time
    - `compatibility_milestones` - Track relationship milestones
    - `match_recommendations_cache` - Cache for performance optimization
  
  2. Triggers
    - Trigger to update ML training data from interactions
  
  3. Security
    - Enable RLS on all tables
*/

-- Create compatibility evolution table
CREATE TABLE IF NOT EXISTS compatibility_evolution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  measurement_date TIMESTAMPTZ NOT NULL,
  relationship_stage TEXT CHECK (relationship_stage IN ('talking', 'dating', 'committed', 'engaged', 'married')),
  
  -- Scores at this point in time
  compatibility_score FLOAT,
  communication_score FLOAT,
  trust_score FLOAT,
  intimacy_score FLOAT,
  commitment_score FLOAT,
  
  -- Change indicators
  score_change_rate FLOAT, -- Rate of change since last measurement
  trajectory TEXT CHECK (trajectory IN ('improving', 'stable', 'declining')),
  
  -- Contextual factors
  major_life_events JSONB,
  challenges_faced JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create compatibility milestones table
CREATE TABLE IF NOT EXISTS compatibility_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  milestone_type TEXT CHECK (milestone_type IN (
    'first_message', 'first_video_call', 'first_date', 
    'one_month', 'three_months', 'six_months', 'one_year',
    'meeting_family', 'moving_in', 'engagement', 'marriage'
  )),
  
  milestone_date TIMESTAMPTZ NOT NULL,
  compatibility_score_at_milestone FLOAT,
  success_probability_at_milestone FLOAT,
  
  user_sentiment FLOAT,
  partner_sentiment FLOAT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create recommendation cache table
CREATE TABLE IF NOT EXISTS match_recommendations_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  recommended_users JSONB, -- Array of user IDs with scores
  generation_algorithm TEXT,
  model_version TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
  
  UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_compatibility_evolution_user ON compatibility_evolution(user_id, partner_id, measurement_date DESC);
CREATE INDEX IF NOT EXISTS idx_compatibility_evolution_trajectory ON compatibility_evolution(trajectory);

CREATE INDEX IF NOT EXISTS idx_compatibility_milestones_user ON compatibility_milestones(user_id, partner_id, milestone_date DESC);
CREATE INDEX IF NOT EXISTS idx_compatibility_milestones_type ON compatibility_milestones(milestone_type);

CREATE INDEX IF NOT EXISTS idx_recommendations_cache_user ON match_recommendations_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_cache_expires ON match_recommendations_cache(expires_at);

-- Enable Row Level Security
ALTER TABLE compatibility_evolution ENABLE ROW LEVEL SECURITY;
ALTER TABLE compatibility_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_recommendations_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read their own compatibility evolution" 
  ON compatibility_evolution FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id OR auth.uid() = partner_id);

CREATE POLICY "Users can insert their compatibility evolution" 
  ON compatibility_evolution FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own milestones" 
  ON compatibility_milestones FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id OR auth.uid() = partner_id);

CREATE POLICY "Users can insert their milestones" 
  ON compatibility_milestones FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own recommendations cache" 
  ON match_recommendations_cache FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage recommendations cache" 
  ON match_recommendations_cache FOR ALL 
  TO authenticated 
  WITH CHECK (true);

-- Function to update ML training data from interactions
-- NOTE: This trigger executes on every interaction insert. For high-traffic production
-- environments, consider implementing a background job or batching mechanism instead.
CREATE OR REPLACE FUNCTION update_ml_training_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- When a positive interaction happens, add to training data
  IF NEW.interaction_type IN ('message_replied', 'date_accepted', 'video_call_accepted', 'relationship_started') THEN
    INSERT INTO ml_training_data (user_id, target_user_id, features, label, label_type)
    SELECT 
      NEW.user_id,
      NEW.target_user_id,
      jsonb_build_object(
        'compatibility_score', COALESCE(cs.score, 50),
        'user_engagement', COALESCE(uep.engagement_score, 50),
        'interaction_count', (
          SELECT COUNT(*) 
          FROM user_interactions 
          WHERE user_id = NEW.user_id 
            AND target_user_id = NEW.target_user_id
        ),
        'interaction_type', NEW.interaction_type,
        'timestamp', NEW.created_at
      ),
      1.0, -- Positive label
      CASE 
        WHEN NEW.interaction_type = 'message_replied' THEN 'message'
        WHEN NEW.interaction_type IN ('date_accepted', 'date_completed') THEN 'date'
        WHEN NEW.interaction_type = 'relationship_started' THEN 'relationship'
        ELSE 'match'
      END
    FROM compatibility_scores cs
    LEFT JOIN user_engagement_patterns uep ON uep.user_id = NEW.user_id
    WHERE cs.user_id = NEW.user_id AND cs.target_user_id = NEW.target_user_id
    LIMIT 1;
  END IF;
  
  -- When a negative interaction happens
  IF NEW.interaction_type IN ('profile_skip', 'block', 'date_declined', 'relationship_ended') THEN
    INSERT INTO ml_training_data (user_id, target_user_id, features, label, label_type)
    SELECT 
      NEW.user_id,
      NEW.target_user_id,
      jsonb_build_object(
        'compatibility_score', COALESCE(cs.score, 50),
        'user_engagement', COALESCE(uep.engagement_score, 50),
        'interaction_count', (
          SELECT COUNT(*) 
          FROM user_interactions 
          WHERE user_id = NEW.user_id 
            AND target_user_id = NEW.target_user_id
        ),
        'interaction_type', NEW.interaction_type,
        'timestamp', NEW.created_at
      ),
      0.0, -- Negative label
      CASE 
        WHEN NEW.interaction_type IN ('block', 'profile_skip') THEN 'match'
        WHEN NEW.interaction_type = 'date_declined' THEN 'date'
        WHEN NEW.interaction_type = 'relationship_ended' THEN 'relationship'
        ELSE 'match'
      END
    FROM compatibility_scores cs
    LEFT JOIN user_engagement_patterns uep ON uep.user_id = NEW.user_id
    WHERE cs.user_id = NEW.user_id AND cs.target_user_id = NEW.target_user_id
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for real-time learning
CREATE TRIGGER trigger_update_ml_training_data
AFTER INSERT ON user_interactions
FOR EACH ROW
EXECUTE FUNCTION update_ml_training_data();

-- Function to get fresh recommendations for a user
CREATE OR REPLACE FUNCTION get_ml_recommendations(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_min_score FLOAT DEFAULT 60.0,
  p_use_cache BOOLEAN DEFAULT true
)
RETURNS TABLE (
  target_user_id UUID,
  compatibility_score FLOAT,
  success_probability FLOAT,
  prediction_confidence FLOAT,
  rank INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cached_data JSONB;
  v_cache_valid BOOLEAN;
BEGIN
  -- Check cache if enabled
  IF p_use_cache THEN
    SELECT recommended_users INTO v_cached_data
    FROM match_recommendations_cache
    WHERE user_id = p_user_id
      AND expires_at > NOW();
    
    v_cache_valid := v_cached_data IS NOT NULL;
  END IF;
  
  -- If cache is valid, return cached results
  IF v_cache_valid THEN
    RETURN QUERY
    SELECT 
      (rec->>'user_id')::UUID,
      (rec->>'score')::FLOAT,
      (rec->>'success_probability')::FLOAT,
      (rec->>'confidence')::FLOAT,
      (rec->>'rank')::INTEGER
    FROM jsonb_array_elements(v_cached_data) AS rec
    LIMIT p_limit;
  ELSE
    -- Generate fresh recommendations
    RETURN QUERY
    WITH scored_matches AS (
      SELECT 
        cs.target_user_id,
        cs.score as compatibility_score,
        COALESCE(msp.relationship_success_probability, cs.score * 0.8) as success_probability,
        COALESCE(msp.prediction_confidence, 50) as prediction_confidence,
        ROW_NUMBER() OVER (ORDER BY 
          COALESCE(msp.relationship_success_probability, cs.score * 0.8) DESC,
          cs.score DESC
        ) as rank
      FROM compatibility_scores cs
      LEFT JOIN match_success_predictions msp 
        ON msp.user_id = p_user_id 
        AND msp.target_user_id = cs.target_user_id
      WHERE cs.user_id = p_user_id
        AND cs.score >= p_min_score
        AND cs.target_user_id NOT IN (
          -- Exclude users already interacted with negatively
          SELECT target_user_id 
          FROM user_interactions 
          WHERE user_id = p_user_id 
            AND interaction_type IN ('block', 'report')
        )
      ORDER BY 
        COALESCE(msp.relationship_success_probability, cs.score * 0.8) DESC,
        cs.score DESC
      LIMIT p_limit
    )
    SELECT 
      sm.target_user_id,
      sm.compatibility_score,
      sm.success_probability,
      sm.prediction_confidence,
      sm.rank::INTEGER
    FROM scored_matches sm;
  END IF;
END;
$$;

-- Function to refresh recommendations cache
CREATE OR REPLACE FUNCTION refresh_recommendations_cache(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_recommendations JSONB;
BEGIN
  -- Generate recommendations
  SELECT jsonb_agg(
    jsonb_build_object(
      'user_id', target_user_id,
      'score', compatibility_score,
      'success_probability', success_probability,
      'confidence', prediction_confidence,
      'rank', rank
    )
  ) INTO v_recommendations
  FROM get_ml_recommendations(p_user_id, 50, 60.0, false);
  
  -- Update cache
  INSERT INTO match_recommendations_cache (
    user_id,
    recommended_users,
    generation_algorithm,
    model_version,
    expires_at
  ) VALUES (
    p_user_id,
    v_recommendations,
    'ML-Enhanced Compatibility v2.0',
    'v2.0',
    NOW() + INTERVAL '24 hours'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    recommended_users = v_recommendations,
    generation_algorithm = 'ML-Enhanced Compatibility v2.0',
    model_version = 'v2.0',
    expires_at = NOW() + INTERVAL '24 hours',
    created_at = NOW();
END;
$$;
