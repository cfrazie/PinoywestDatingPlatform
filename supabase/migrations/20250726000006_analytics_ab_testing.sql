/*
  # Analytics & A/B Testing
  
  1. New Tables
    - `algorithm_performance_metrics` - Track algorithm performance over time
    - `ab_test_assignments` - Track A/B test assignments
    - `ab_test_results` - Store A/B test results
  
  2. Security
    - Enable RLS on all tables
*/

-- Create algorithm performance metrics table
CREATE TABLE IF NOT EXISTS algorithm_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  metric_date DATE NOT NULL,
  algorithm_version TEXT,
  
  -- Match quality metrics
  avg_compatibility_score FLOAT,
  match_acceptance_rate FLOAT,
  message_response_rate FLOAT,
  date_conversion_rate FLOAT,
  relationship_formation_rate FLOAT,
  
  -- Engagement metrics
  avg_session_duration INTEGER,
  profiles_viewed_per_session FLOAT,
  
  -- Success metrics
  avg_relationship_duration_days FLOAT,
  relationship_satisfaction_avg FLOAT,
  
  user_count_sample INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create A/B testing assignments table
CREATE TABLE IF NOT EXISTS ab_test_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  experiment_name TEXT NOT NULL,
  variant TEXT NOT NULL, -- 'control', 'variant_a', 'variant_b'
  
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, experiment_name)
);

-- Create A/B test results table
CREATE TABLE IF NOT EXISTS ab_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  experiment_name TEXT NOT NULL,
  variant TEXT NOT NULL,
  
  metric_name TEXT NOT NULL,
  metric_value FLOAT,
  
  sample_size INTEGER,
  confidence_interval JSONB,
  
  measurement_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_algorithm_metrics_date ON algorithm_performance_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_algorithm_metrics_version ON algorithm_performance_metrics(algorithm_version, metric_date DESC);

CREATE INDEX IF NOT EXISTS idx_ab_assignments_user ON ab_test_assignments(user_id, experiment_name);
CREATE INDEX IF NOT EXISTS idx_ab_assignments_experiment ON ab_test_assignments(experiment_name, variant);

CREATE INDEX IF NOT EXISTS idx_ab_results_experiment ON ab_test_results(experiment_name, variant, measurement_date DESC);
CREATE INDEX IF NOT EXISTS idx_ab_results_metric ON ab_test_results(metric_name, measurement_date DESC);

-- Enable Row Level Security
ALTER TABLE algorithm_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage algorithm metrics" 
  ON algorithm_performance_metrics FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() 
      AND is_active = true
    )
  );

CREATE POLICY "Users can read their own A/B assignments" 
  ON ab_test_assignments FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert A/B assignments" 
  ON ab_test_assignments FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Admins can manage A/B assignments" 
  ON ab_test_assignments FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() 
      AND is_active = true
    )
  );

CREATE POLICY "Admins can read A/B test results" 
  ON ab_test_results FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() 
      AND is_active = true
    )
  );

CREATE POLICY "System can insert A/B test results" 
  ON ab_test_results FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Function to assign user to A/B test
CREATE OR REPLACE FUNCTION assign_ab_test(
  p_user_id UUID,
  p_experiment_name TEXT,
  p_variant_weights JSONB DEFAULT '{"control": 0.5, "variant_a": 0.5}'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_assigned_variant TEXT;
  v_random_value FLOAT;
  v_cumulative_weight FLOAT := 0;
  v_variant RECORD;
BEGIN
  -- Check if user already assigned
  SELECT variant INTO v_assigned_variant
  FROM ab_test_assignments
  WHERE user_id = p_user_id AND experiment_name = p_experiment_name;
  
  IF v_assigned_variant IS NOT NULL THEN
    RETURN v_assigned_variant;
  END IF;
  
  -- Generate random value for assignment
  v_random_value := random();
  
  -- Assign based on weights
  FOR v_variant IN 
    SELECT key, value::FLOAT 
    FROM jsonb_each(p_variant_weights)
  LOOP
    v_cumulative_weight := v_cumulative_weight + v_variant.value;
    IF v_random_value <= v_cumulative_weight THEN
      v_assigned_variant := v_variant.key;
      EXIT;
    END IF;
  END LOOP;
  
  -- Insert assignment
  INSERT INTO ab_test_assignments (user_id, experiment_name, variant)
  VALUES (p_user_id, p_experiment_name, v_assigned_variant)
  ON CONFLICT (user_id, experiment_name) DO NOTHING;
  
  RETURN v_assigned_variant;
END;
$$;

-- Function to calculate daily algorithm metrics
CREATE OR REPLACE FUNCTION calculate_daily_algorithm_metrics(
  p_date DATE DEFAULT CURRENT_DATE - INTERVAL '1 day'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_avg_compatibility FLOAT;
  v_match_acceptance FLOAT;
  v_message_response FLOAT;
  v_date_conversion FLOAT;
  v_relationship_formation FLOAT;
  v_avg_session_duration INTEGER;
  v_profiles_per_session FLOAT;
  v_avg_relationship_duration FLOAT;
  v_avg_satisfaction FLOAT;
  v_user_sample INTEGER;
BEGIN
  -- Calculate average compatibility score
  SELECT AVG(score) INTO v_avg_compatibility
  FROM compatibility_scores
  WHERE created_at::DATE = p_date;
  
  -- Calculate match acceptance rate
  SELECT 
    COUNT(*) FILTER (WHERE interaction_type IN ('profile_like', 'profile_superlike'))::FLOAT /
    NULLIF(COUNT(*) FILTER (WHERE interaction_type IN ('profile_view', 'profile_like', 'profile_superlike', 'profile_skip'))::FLOAT, 0)
  INTO v_match_acceptance
  FROM user_interactions
  WHERE created_at::DATE = p_date;
  
  -- Calculate message response rate
  SELECT 
    COUNT(*) FILTER (WHERE interaction_type = 'message_replied')::FLOAT /
    NULLIF(COUNT(*) FILTER (WHERE interaction_type = 'message_received')::FLOAT, 0)
  INTO v_message_response
  FROM user_interactions
  WHERE created_at::DATE = p_date;
  
  -- Calculate date conversion rate
  SELECT 
    COUNT(*) FILTER (WHERE interaction_type = 'date_accepted')::FLOAT /
    NULLIF(COUNT(*) FILTER (WHERE interaction_type = 'date_requested')::FLOAT, 0)
  INTO v_date_conversion
  FROM user_interactions
  WHERE created_at::DATE = p_date;
  
  -- Calculate relationship formation rate
  SELECT 
    COUNT(*) FILTER (WHERE interaction_type = 'relationship_started')::FLOAT /
    NULLIF(COUNT(DISTINCT user_id)::FLOAT, 0)
  INTO v_relationship_formation
  FROM user_interactions
  WHERE created_at::DATE = p_date;
  
  -- Get average session duration
  SELECT AVG(avg_session_duration) INTO v_avg_session_duration
  FROM user_engagement_patterns
  WHERE last_calculated::DATE = p_date;
  
  -- Get profiles viewed per session
  SELECT AVG(avg_profiles_viewed_per_session) INTO v_profiles_per_session
  FROM user_engagement_patterns
  WHERE last_calculated::DATE = p_date;
  
  -- Get relationship metrics
  SELECT 
    AVG(duration_days),
    AVG(satisfaction_rating)
  INTO v_avg_relationship_duration, v_avg_satisfaction
  FROM relationship_outcomes
  WHERE created_at::DATE = p_date;
  
  -- Get sample size
  SELECT COUNT(DISTINCT user_id) INTO v_user_sample
  FROM user_interactions
  WHERE created_at::DATE = p_date;
  
  -- Insert metrics
  INSERT INTO algorithm_performance_metrics (
    metric_date,
    algorithm_version,
    avg_compatibility_score,
    match_acceptance_rate,
    message_response_rate,
    date_conversion_rate,
    relationship_formation_rate,
    avg_session_duration,
    profiles_viewed_per_session,
    avg_relationship_duration_days,
    relationship_satisfaction_avg,
    user_count_sample
  ) VALUES (
    p_date,
    'v2.0-ML-Enhanced',
    v_avg_compatibility,
    v_match_acceptance,
    v_message_response,
    v_date_conversion,
    v_relationship_formation,
    v_avg_session_duration,
    v_profiles_per_session,
    v_avg_relationship_duration,
    v_avg_satisfaction,
    v_user_sample
  );
END;
$$;
