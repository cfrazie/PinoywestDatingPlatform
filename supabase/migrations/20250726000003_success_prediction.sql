/*
  # Success Prediction System
  
  1. New Tables
    - `relationship_outcomes` - Track relationship outcomes for learning
    - `match_success_predictions` - Predicted success scores for matches
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create relationship outcomes tracking table
CREATE TABLE IF NOT EXISTS relationship_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship_type TEXT CHECK (relationship_type IN ('talking', 'dating', 'committed', 'engaged', 'married')),
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_days INTEGER,
  outcome TEXT CHECK (outcome IN ('ongoing', 'ended_mutual', 'ended_breakup', 'married', 'engaged')),
  satisfaction_rating FLOAT, -- 0-5 from both parties
  compatibility_factors_rating JSONB, -- Rating of each factor
  success_indicators JSONB,
  failure_indicators JSONB,
  user_feedback TEXT,
  partner_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create success prediction scores table
CREATE TABLE IF NOT EXISTS match_success_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Prediction scores (0-100)
  message_success_probability FLOAT,
  date_success_probability FLOAT,
  relationship_success_probability FLOAT,
  long_term_compatibility_score FLOAT,
  
  -- Detailed predictions
  predicted_relationship_duration_days INTEGER,
  predicted_satisfaction_rating FLOAT,
  
  -- Risk factors
  ghosting_risk FLOAT,
  conflict_likelihood FLOAT,
  compatibility_concerns JSONB,
  
  -- Confidence metrics
  prediction_confidence FLOAT,
  data_sufficiency FLOAT, -- Do we have enough data?
  
  model_version TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_relationship_outcomes_user ON relationship_outcomes(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_relationship_outcomes_ongoing ON relationship_outcomes(user_id) 
  WHERE outcome = 'ongoing';
CREATE INDEX IF NOT EXISTS idx_relationship_outcomes_successful ON relationship_outcomes(satisfaction_rating DESC) 
  WHERE satisfaction_rating >= 4.0;

CREATE INDEX IF NOT EXISTS idx_match_predictions_user ON match_success_predictions(user_id, relationship_success_probability DESC);
CREATE INDEX IF NOT EXISTS idx_match_predictions_high_success ON match_success_predictions(user_id) 
  WHERE relationship_success_probability >= 0.7;
CREATE INDEX IF NOT EXISTS idx_match_predictions_high_confidence ON match_success_predictions(prediction_confidence DESC);

-- Enable Row Level Security
ALTER TABLE relationship_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_success_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for relationship_outcomes
CREATE POLICY "Users can manage their own relationship outcomes" 
  ON relationship_outcomes FOR ALL 
  TO authenticated 
  USING (auth.uid() = user_id OR auth.uid() = partner_id)
  WITH CHECK (auth.uid() = user_id OR auth.uid() = partner_id);

CREATE POLICY "Admins can read all outcomes" 
  ON relationship_outcomes FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() 
      AND is_active = true
    )
  );

-- RLS Policies for match_success_predictions
CREATE POLICY "Users can read their own predictions" 
  ON match_success_predictions FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "System can update predictions" 
  ON match_success_predictions FOR ALL 
  TO authenticated 
  WITH CHECK (true);

-- Function to predict match success
CREATE OR REPLACE FUNCTION predict_match_success(
  p_user_id UUID,
  p_target_user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_compatibility_score FLOAT;
  v_interaction_score FLOAT;
  v_behavioral_score FLOAT;
  v_user_engagement FLOAT;
  v_target_engagement FLOAT;
  v_interaction_count INTEGER;
  v_message_success FLOAT;
  v_date_success FLOAT;
  v_relationship_success FLOAT;
  v_confidence FLOAT;
BEGIN
  -- Get compatibility score
  SELECT score INTO v_compatibility_score
  FROM compatibility_scores
  WHERE user_id = p_user_id AND target_user_id = p_target_user_id;
  
  -- Get engagement scores
  SELECT engagement_score INTO v_user_engagement
  FROM user_engagement_patterns
  WHERE user_id = p_user_id;
  
  SELECT engagement_score INTO v_target_engagement
  FROM user_engagement_patterns
  WHERE user_id = p_target_user_id;
  
  -- Count existing interactions
  SELECT COUNT(*) INTO v_interaction_count
  FROM user_interactions
  WHERE (user_id = p_user_id AND target_user_id = p_target_user_id)
     OR (user_id = p_target_user_id AND target_user_id = p_user_id);
  
  -- Calculate interaction quality score
  SELECT AVG(
    CASE 
      WHEN interaction_type IN ('message_sent', 'message_replied') THEN 0.8
      WHEN interaction_type IN ('video_call_accepted', 'date_accepted') THEN 1.0
      WHEN interaction_type IN ('gift_sent') THEN 0.9
      WHEN interaction_type IN ('profile_like', 'profile_superlike') THEN 0.6
      WHEN interaction_type IN ('profile_skip', 'block') THEN 0.0
      ELSE 0.5
    END
  ) INTO v_interaction_score
  FROM user_interactions
  WHERE (user_id = p_user_id AND target_user_id = p_target_user_id)
     OR (user_id = p_target_user_id AND target_user_id = p_user_id);
  
  -- Calculate behavioral compatibility
  v_behavioral_score := COALESCE(
    ABS(v_user_engagement - v_target_engagement) / 100.0,
    0.5
  );
  v_behavioral_score := 1.0 - v_behavioral_score; -- Convert difference to similarity
  
  -- Default values for missing data
  v_compatibility_score := COALESCE(v_compatibility_score, 50.0);
  v_interaction_score := COALESCE(v_interaction_score, 0.5);
  v_user_engagement := COALESCE(v_user_engagement, 50.0);
  v_target_engagement := COALESCE(v_target_engagement, 50.0);
  
  -- Calculate success probabilities
  -- Message success: based on compatibility and engagement
  v_message_success := LEAST(1.0, GREATEST(0.0,
    (v_compatibility_score / 100.0 * 0.4) +
    (v_user_engagement / 100.0 * 0.3) +
    (v_target_engagement / 100.0 * 0.3)
  ));
  
  -- Date success: requires higher compatibility and interaction
  v_date_success := LEAST(1.0, GREATEST(0.0,
    (v_compatibility_score / 100.0 * 0.5) +
    (COALESCE(v_interaction_score, 0.3) * 0.3) +
    (v_behavioral_score * 0.2)
  ));
  
  -- Relationship success: comprehensive score
  v_relationship_success := LEAST(1.0, GREATEST(0.0,
    (v_compatibility_score / 100.0 * 0.4) +
    (COALESCE(v_interaction_score, 0.3) * 0.3) +
    (v_behavioral_score * 0.2) +
    (CASE WHEN v_interaction_count > 10 THEN 0.1 ELSE 0.0 END)
  ));
  
  -- Calculate confidence based on data availability
  v_confidence := LEAST(1.0, GREATEST(0.3,
    (CASE WHEN v_compatibility_score IS NOT NULL THEN 0.3 ELSE 0.0 END) +
    (CASE WHEN v_interaction_count > 0 THEN 0.3 ELSE 0.0 END) +
    (CASE WHEN v_interaction_count > 5 THEN 0.2 ELSE 0.0 END) +
    (CASE WHEN v_user_engagement IS NOT NULL THEN 0.1 ELSE 0.0 END) +
    (CASE WHEN v_target_engagement IS NOT NULL THEN 0.1 ELSE 0.0 END)
  ));
  
  -- Build result JSON
  v_result := jsonb_build_object(
    'message_success_probability', ROUND((v_message_success * 100)::NUMERIC, 2),
    'date_success_probability', ROUND((v_date_success * 100)::NUMERIC, 2),
    'relationship_success_probability', ROUND((v_relationship_success * 100)::NUMERIC, 2),
    'long_term_compatibility_score', ROUND(v_compatibility_score::NUMERIC, 2),
    'predicted_satisfaction_rating', ROUND(((v_relationship_success * 5.0)::NUMERIC), 2),
    'ghosting_risk', ROUND(((1.0 - v_user_engagement / 100.0) * 100)::NUMERIC, 2),
    'conflict_likelihood', ROUND(((1.0 - v_behavioral_score) * 100)::NUMERIC, 2),
    'prediction_confidence', ROUND((v_confidence * 100)::NUMERIC, 2),
    'data_sufficiency', ROUND((v_confidence * 100)::NUMERIC, 2),
    'interaction_count', v_interaction_count
  );
  
  -- Store prediction
  INSERT INTO match_success_predictions (
    user_id,
    target_user_id,
    message_success_probability,
    date_success_probability,
    relationship_success_probability,
    long_term_compatibility_score,
    predicted_satisfaction_rating,
    ghosting_risk,
    conflict_likelihood,
    prediction_confidence,
    data_sufficiency,
    model_version
  ) VALUES (
    p_user_id,
    p_target_user_id,
    v_message_success * 100,
    v_date_success * 100,
    v_relationship_success * 100,
    v_compatibility_score,
    v_relationship_success * 5.0,
    (1.0 - v_user_engagement / 100.0) * 100,
    (1.0 - v_behavioral_score) * 100,
    v_confidence * 100,
    v_confidence * 100,
    'v2.0'
  )
  ON CONFLICT (user_id, target_user_id) DO UPDATE SET
    message_success_probability = EXCLUDED.message_success_probability,
    date_success_probability = EXCLUDED.date_success_probability,
    relationship_success_probability = EXCLUDED.relationship_success_probability,
    long_term_compatibility_score = EXCLUDED.long_term_compatibility_score,
    predicted_satisfaction_rating = EXCLUDED.predicted_satisfaction_rating,
    ghosting_risk = EXCLUDED.ghosting_risk,
    conflict_likelihood = EXCLUDED.conflict_likelihood,
    prediction_confidence = EXCLUDED.prediction_confidence,
    data_sufficiency = EXCLUDED.data_sufficiency,
    model_version = EXCLUDED.model_version,
    updated_at = NOW();
  
  RETURN v_result;
END;
$$;
