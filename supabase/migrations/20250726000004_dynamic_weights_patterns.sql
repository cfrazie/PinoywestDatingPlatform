/*
  # Dynamic Weight Adjustment & Pattern Learning
  
  1. New Tables
    - `user_dynamic_weights` - Personalized factor weights per user
    - `factor_weight_performance` - Track weight performance globally
    - `seasonal_matching_patterns` - Seasonal and temporal patterns
    - `regional_matching_preferences` - Regional preferences and patterns
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users and system
*/

-- Create dynamic factor weights per user
CREATE TABLE IF NOT EXISTS user_dynamic_weights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  factor_id UUID REFERENCES compatibility_factors(id) ON DELETE CASCADE,
  
  base_weight FLOAT, -- Starting weight
  adjusted_weight FLOAT, -- Current adjusted weight
  adjustment_reason TEXT,
  
  performance_metrics JSONB, -- How well this factor predicts success for this user
  last_adjusted TIMESTAMPTZ,
  adjustment_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, factor_id)
);

-- Create global weight performance tracking
CREATE TABLE IF NOT EXISTS factor_weight_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factor_id UUID REFERENCES compatibility_factors(id) ON DELETE CASCADE,
  
  weight_value FLOAT,
  sample_size INTEGER,
  
  -- Performance metrics
  accuracy FLOAT,
  precision FLOAT,
  recall FLOAT,
  
  date_range_start TIMESTAMPTZ,
  date_range_end TIMESTAMPTZ,
  
  demographic_segment JSONB, -- Age group, location, etc.
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create seasonal patterns table
CREATE TABLE IF NOT EXISTS seasonal_matching_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  season TEXT CHECK (season IN ('spring', 'summer', 'fall', 'winter')),
  month INTEGER CHECK (month BETWEEN 1 AND 12),
  holiday TEXT, -- 'valentines', 'christmas', etc.
  
  region TEXT,
  country TEXT,
  
  -- Pattern metrics
  activity_multiplier FLOAT, -- How much more active users are
  match_success_rate FLOAT,
  preferred_match_type TEXT, -- 'casual', 'serious', etc.
  popular_interests JSONB,
  
  sample_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create regional preferences table
CREATE TABLE IF NOT EXISTS regional_matching_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  region TEXT NOT NULL,
  country TEXT NOT NULL,
  
  -- Learned preferences
  avg_age_difference FLOAT,
  distance_tolerance_km FLOAT,
  cultural_importance FLOAT, -- How important cultural match is in this region
  family_value_importance FLOAT,
  
  popular_date_types JSONB,
  communication_style_preferences JSONB,
  
  sample_size INTEGER,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(region, country)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_dynamic_weights_user ON user_dynamic_weights(user_id, factor_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_weights_adjusted ON user_dynamic_weights(adjusted_weight DESC);

CREATE INDEX IF NOT EXISTS idx_weight_performance_factor ON factor_weight_performance(factor_id, accuracy DESC);
CREATE INDEX IF NOT EXISTS idx_weight_performance_date ON factor_weight_performance(date_range_start DESC);

CREATE INDEX IF NOT EXISTS idx_seasonal_patterns_current ON seasonal_matching_patterns(month, region);
CREATE INDEX IF NOT EXISTS idx_seasonal_patterns_holiday ON seasonal_matching_patterns(holiday);

CREATE INDEX IF NOT EXISTS idx_regional_preferences_location ON regional_matching_preferences(country, region);

-- Enable Row Level Security
ALTER TABLE user_dynamic_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE factor_weight_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasonal_matching_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE regional_matching_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read their own dynamic weights" 
  ON user_dynamic_weights FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "System can update dynamic weights" 
  ON user_dynamic_weights FOR ALL 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Admins can read weight performance" 
  ON factor_weight_performance FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() 
      AND is_active = true
    )
  );

CREATE POLICY "Authenticated users can read seasonal patterns" 
  ON seasonal_matching_patterns FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can read regional preferences" 
  ON regional_matching_preferences FOR SELECT 
  TO authenticated 
  USING (true);

-- Function to adjust weights based on outcomes
CREATE OR REPLACE FUNCTION adjust_compatibility_weights(
  p_user_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_factor RECORD;
  v_success_rate FLOAT;
  v_new_weight FLOAT;
BEGIN
  -- For each compatibility factor
  FOR v_factor IN SELECT * FROM compatibility_factors LOOP
    -- Calculate success rate when this factor was high vs low
    SELECT 
      COUNT(*) FILTER (WHERE ro.outcome IN ('ongoing', 'married', 'engaged'))::FLOAT / 
      NULLIF(COUNT(*)::FLOAT, 0)
    INTO v_success_rate
    FROM relationship_outcomes ro
    JOIN compatibility_scores cs ON cs.user_id = ro.user_id AND cs.target_user_id = ro.partner_id
    WHERE ro.user_id = p_user_id
      AND (cs.factors->>v_factor.id::TEXT)::FLOAT > 80; -- High factor score
    
    -- Only adjust if we have enough data
    IF v_success_rate IS NOT NULL THEN
      -- Adjust weight based on success rate with bounds checking
      IF v_success_rate > 0.7 THEN
        -- This factor is highly predictive, increase weight (max 3.0)
        v_new_weight := LEAST(v_factor.weight * 1.2, 3.0);
        
        INSERT INTO user_dynamic_weights (user_id, factor_id, base_weight, adjusted_weight, adjustment_reason)
        VALUES (p_user_id, v_factor.id, v_factor.weight, v_new_weight, 'High predictive success')
        ON CONFLICT (user_id, factor_id) DO UPDATE
        SET adjusted_weight = LEAST(user_dynamic_weights.adjusted_weight * 1.2, 3.0),
            last_adjusted = NOW(),
            adjustment_count = user_dynamic_weights.adjustment_count + 1;
            
      ELSIF v_success_rate < 0.3 THEN
        -- This factor isn't predictive for this user, decrease weight (min 0.1)
        v_new_weight := GREATEST(v_factor.weight * 0.8, 0.1);
        
        INSERT INTO user_dynamic_weights (user_id, factor_id, base_weight, adjusted_weight, adjustment_reason)
        VALUES (p_user_id, v_factor.id, v_factor.weight, v_new_weight, 'Low predictive success')
        ON CONFLICT (user_id, factor_id) DO UPDATE
        SET adjusted_weight = GREATEST(user_dynamic_weights.adjusted_weight * 0.8, 0.1),
            last_adjusted = NOW(),
            adjustment_count = user_dynamic_weights.adjustment_count + 1;
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- Insert sample seasonal patterns
INSERT INTO seasonal_matching_patterns (season, month, holiday, region, country, activity_multiplier, match_success_rate, preferred_match_type, popular_interests, sample_size) VALUES
('winter', 2, 'valentines', 'National Capital Region', 'Philippines', 1.8, 0.72, 'serious', '["romance", "dining", "gifts"]', 5000),
('winter', 12, 'christmas', 'National Capital Region', 'Philippines', 1.5, 0.68, 'serious', '["family", "traditions", "celebrations"]', 4500),
('summer', 4, NULL, 'Cebu', 'Philippines', 1.3, 0.65, 'casual', '["beach", "outdoor", "adventure"]', 3000),
('spring', 3, NULL, 'California', 'USA', 1.2, 0.63, 'casual', '["outdoor", "fitness", "travel"]', 2000);

-- Insert sample regional preferences
INSERT INTO regional_matching_preferences (region, country, avg_age_difference, distance_tolerance_km, cultural_importance, family_value_importance, popular_date_types, communication_style_preferences, sample_size) VALUES
('National Capital Region', 'Philippines', 4.5, 25.0, 0.85, 0.90, 
 '["dinner dates", "mall visits", "coffee shops", "karaoke"]',
 '{"style": "warm", "emoji_usage": "high", "response_time": "quick"}', 
 10000),
('Cebu', 'Philippines', 5.0, 30.0, 0.88, 0.92,
 '["beach dates", "island hopping", "food trips", "cultural sites"]',
 '{"style": "friendly", "emoji_usage": "medium", "response_time": "moderate"}',
 5000),
('California', 'USA', 3.5, 50.0, 0.70, 0.75,
 '["hiking", "brunch", "concerts", "wine tasting"]',
 '{"style": "casual", "emoji_usage": "medium", "response_time": "varied"}',
 8000);
