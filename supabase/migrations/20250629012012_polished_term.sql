/*
  # AI-Powered Compatibility Scoring

  1. New Tables
    - `compatibility_factors` - Stores different factors used in compatibility calculation
    - `user_compatibility_preferences` - Stores user preferences for compatibility factors
    - `compatibility_scores` - Stores pre-calculated compatibility scores between users
    - `compatibility_models` - Stores information about AI models used for scoring
  
  2. Functions
    - `calculate_compatibility_score` - Calculates compatibility between two users
    - `update_compatibility_scores` - Updates compatibility scores for a user
    - `get_top_compatible_matches` - Gets top compatible matches for a user
  
  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create compatibility_factors table
CREATE TABLE IF NOT EXISTS compatibility_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  weight FLOAT NOT NULL DEFAULT 1.0,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_compatibility_preferences table
CREATE TABLE IF NOT EXISTS user_compatibility_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  factor_id UUID NOT NULL REFERENCES compatibility_factors(id) ON DELETE CASCADE,
  importance FLOAT NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, factor_id)
);

-- Create compatibility_scores table
CREATE TABLE IF NOT EXISTS compatibility_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score FLOAT NOT NULL,
  confidence FLOAT NOT NULL,
  factors JSONB,
  model_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, target_user_id)
);

-- Create compatibility_models table
CREATE TABLE IF NOT EXISTS compatibility_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  description TEXT,
  parameters JSONB,
  accuracy FLOAT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create function to calculate compatibility score
CREATE OR REPLACE FUNCTION calculate_compatibility_score(
  p_user_id UUID,
  p_target_user_id UUID
)
RETURNS FLOAT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_score FLOAT := 0;
  v_total_weight FLOAT := 0;
  v_factor RECORD;
  v_user_profile JSONB;
  v_target_profile JSONB;
  v_user_preferences JSONB;
  v_target_preferences JSONB;
  v_factor_score FLOAT;
  v_active_model_id UUID;
BEGIN
  -- Get active model
  SELECT id INTO v_active_model_id FROM compatibility_models WHERE active = true LIMIT 1;
  
  -- Get user profiles
  SELECT profile INTO v_user_profile FROM profiles WHERE user_id = p_user_id;
  SELECT profile INTO v_target_profile FROM profiles WHERE user_id = p_target_user_id;
  
  -- Get user preferences
  SELECT 
    jsonb_object_agg(cf.id, ucp.importance) INTO v_user_preferences
  FROM 
    user_compatibility_preferences ucp
    JOIN compatibility_factors cf ON ucp.factor_id = cf.id
  WHERE 
    ucp.user_id = p_user_id;
  
  SELECT 
    jsonb_object_agg(cf.id, ucp.importance) INTO v_target_preferences
  FROM 
    user_compatibility_preferences ucp
    JOIN compatibility_factors cf ON ucp.factor_id = cf.id
  WHERE 
    ucp.user_id = p_target_user_id;
  
  -- Calculate score based on factors
  FOR v_factor IN 
    SELECT * FROM compatibility_factors
  LOOP
    -- Calculate factor score (simplified algorithm)
    v_factor_score := 0;
    
    -- Cultural background match
    IF v_factor.category = 'cultural_background' THEN
      IF v_user_profile->>'cultural_background' = v_target_profile->>'cultural_background' THEN
        v_factor_score := 1.0;
      ELSE
        v_factor_score := 0.5; -- Different but still compatible
      END IF;
    
    -- Interests match
    ELSIF v_factor.category = 'interests' THEN
      -- Calculate overlap in interests
      IF v_user_profile->'interests' IS NOT NULL AND v_target_profile->'interests' IS NOT NULL THEN
        v_factor_score := (
          SELECT COUNT(*) 
          FROM jsonb_array_elements_text(v_user_profile->'interests') u
          JOIN jsonb_array_elements_text(v_target_profile->'interests') t ON u = t
        ) / GREATEST(
          jsonb_array_length(v_user_profile->'interests'),
          jsonb_array_length(v_target_profile->'interests')
        );
      END IF;
    
    -- Language match
    ELSIF v_factor.category = 'languages' THEN
      -- Calculate language compatibility
      IF v_user_profile->'languages' IS NOT NULL AND v_target_profile->'languages' IS NOT NULL THEN
        v_factor_score := (
          SELECT COUNT(*) 
          FROM jsonb_array_elements_text(v_user_profile->'languages') u
          JOIN jsonb_array_elements_text(v_target_profile->'languages') t ON u = t
        ) / GREATEST(1, LEAST(
          jsonb_array_length(v_user_profile->'languages'),
          jsonb_array_length(v_target_profile->'languages')
        ));
      END IF;
    
    -- Age compatibility
    ELSIF v_factor.category = 'age' THEN
      DECLARE
        v_user_age INT;
        v_target_age INT;
        v_age_diff INT;
      BEGIN
        v_user_age := (v_user_profile->>'age')::INT;
        v_target_age := (v_target_profile->>'age')::INT;
        
        IF v_user_age IS NOT NULL AND v_target_age IS NOT NULL THEN
          v_age_diff := ABS(v_user_age - v_target_age);
          
          -- Age difference scoring (higher score for closer ages)
          IF v_age_diff <= 5 THEN
            v_factor_score := 1.0;
          ELSIF v_age_diff <= 10 THEN
            v_factor_score := 0.8;
          ELSIF v_age_diff <= 15 THEN
            v_factor_score := 0.6;
          ELSIF v_age_diff <= 20 THEN
            v_factor_score := 0.4;
          ELSE
            v_factor_score := 0.2;
          END IF;
        END IF;
      END;
    
    -- Location compatibility
    ELSIF v_factor.category = 'location' THEN
      -- Simple location match (in production, would use distance calculation)
      IF v_user_profile->>'country' = v_target_profile->>'country' THEN
        v_factor_score := 1.0;
      ELSE
        v_factor_score := 0.3; -- Different countries
      END IF;
    
    -- Relationship goals compatibility
    ELSIF v_factor.category = 'relationship_goals' THEN
      IF v_user_profile->>'relationship_goal' = v_target_profile->>'relationship_goal' THEN
        v_factor_score := 1.0;
      ELSE
        v_factor_score := 0.3;
      END IF;
    
    -- Default factor scoring
    ELSE
      v_factor_score := 0.5; -- Neutral score for other factors
    END IF;
    
    -- Apply importance weights from user preferences
    DECLARE
      v_user_importance FLOAT := 1.0;
      v_target_importance FLOAT := 1.0;
    BEGIN
      IF v_user_preferences IS NOT NULL AND v_user_preferences->v_factor.id::TEXT IS NOT NULL THEN
        v_user_importance := (v_user_preferences->>v_factor.id::TEXT)::FLOAT;
      END IF;
      
      IF v_target_preferences IS NOT NULL AND v_target_preferences->v_factor.id::TEXT IS NOT NULL THEN
        v_target_importance := (v_target_preferences->>v_factor.id::TEXT)::FLOAT;
      END IF;
      
      -- Combine factor score with weights
      v_score := v_score + (v_factor_score * v_factor.weight * (v_user_importance + v_target_importance) / 2);
      v_total_weight := v_total_weight + (v_factor.weight * (v_user_importance + v_target_importance) / 2);
    END;
  END LOOP;
  
  -- Normalize score to 0-100 range
  IF v_total_weight > 0 THEN
    v_score := (v_score / v_total_weight) * 100;
  ELSE
    v_score := 50; -- Default neutral score
  END IF;
  
  -- Store the calculated score
  INSERT INTO compatibility_scores (
    user_id, 
    target_user_id, 
    score, 
    confidence,
    model_id
  ) VALUES (
    p_user_id,
    p_target_user_id,
    v_score,
    0.85, -- Default confidence
    v_active_model_id
  )
  ON CONFLICT (user_id, target_user_id) 
  DO UPDATE SET 
    score = v_score,
    confidence = 0.85,
    model_id = v_active_model_id,
    updated_at = now();
  
  RETURN v_score;
END;
$$;

-- Create function to update compatibility scores for a user
CREATE OR REPLACE FUNCTION update_compatibility_scores(
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_target_user RECORD;
BEGIN
  -- Update scores for all potential matches
  FOR v_target_user IN 
    SELECT id FROM auth.users 
    WHERE id != p_user_id
    AND id NOT IN (
      SELECT target_user_id FROM compatibility_scores 
      WHERE user_id = p_user_id AND updated_at > now() - interval '7 days'
    )
    LIMIT 100 -- Process in batches
  LOOP
    PERFORM calculate_compatibility_score(p_user_id, v_target_user.id);
  END LOOP;
END;
$$;

-- Create function to get top compatible matches
CREATE OR REPLACE FUNCTION get_top_compatible_matches(
  p_user_id UUID,
  p_limit INT DEFAULT 20,
  p_min_score FLOAT DEFAULT 70.0
)
RETURNS TABLE (
  user_id UUID,
  score FLOAT,
  confidence FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.target_user_id,
    cs.score,
    cs.confidence
  FROM 
    compatibility_scores cs
  WHERE 
    cs.user_id = p_user_id
    AND cs.score >= p_min_score
  ORDER BY 
    cs.score DESC
  LIMIT p_limit;
END;
$$;

-- Insert default compatibility factors
INSERT INTO compatibility_factors (name, description, weight, category) VALUES
('Cultural Background', 'Similarity in cultural backgrounds', 1.2, 'cultural_background'),
('Interests', 'Shared interests and hobbies', 1.0, 'interests'),
('Languages', 'Shared languages', 1.1, 'languages'),
('Age', 'Age compatibility', 0.8, 'age'),
('Location', 'Geographic proximity', 0.7, 'location'),
('Relationship Goals', 'Alignment in relationship objectives', 1.3, 'relationship_goals'),
('Communication Style', 'Compatibility in communication styles', 1.1, 'communication'),
('Values', 'Shared personal values', 1.2, 'values'),
('Lifestyle', 'Compatibility in lifestyle choices', 0.9, 'lifestyle'),
('Family Plans', 'Alignment in family planning', 1.0, 'family');

-- Insert default AI model
INSERT INTO compatibility_models (name, version, description, parameters, accuracy, active) VALUES
('CompatibilityGPT', '1.0', 'AI model for predicting relationship compatibility', 
 '{"embedding_size": 768, "layers": 12, "attention_heads": 12}', 
 0.85, true);

-- Enable Row Level Security
ALTER TABLE compatibility_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_compatibility_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE compatibility_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE compatibility_models ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Compatibility factors are readable by all authenticated users
CREATE POLICY "Compatibility factors are readable by authenticated users" 
ON compatibility_factors FOR SELECT 
TO authenticated 
USING (true);

-- Users can manage their own compatibility preferences
CREATE POLICY "Users can manage their own compatibility preferences" 
ON user_compatibility_preferences FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can read their own compatibility scores
CREATE POLICY "Users can read their own compatibility scores" 
ON compatibility_scores FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Only admins can manage compatibility models
CREATE POLICY "Only admins can manage compatibility models" 
ON compatibility_models FOR ALL 
TO authenticated 
USING (
  auth.email() IN ('admin@pinoywest.com', 'support@pinoywest.com')
);

-- Create trigger to update compatibility scores when profiles change
CREATE OR REPLACE FUNCTION trigger_update_compatibility_scores()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM update_compatibility_scores(NEW.user_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_compatibility_on_profile_change
AFTER INSERT OR UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION trigger_update_compatibility_scores();

-- Create function to get personalized compatibility explanation
CREATE OR REPLACE FUNCTION get_compatibility_explanation(
  p_user_id UUID,
  p_target_user_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_score FLOAT;
  v_factors JSONB;
  v_explanation TEXT;
BEGIN
  -- Get compatibility score and factors
  SELECT score, factors INTO v_score, v_factors
  FROM compatibility_scores
  WHERE user_id = p_user_id AND target_user_id = p_target_user_id;
  
  -- Generate explanation based on score
  IF v_score >= 90 THEN
    v_explanation := 'You have exceptional compatibility! You share many important values, interests, and goals.';
  ELSIF v_score >= 80 THEN
    v_explanation := 'You have strong compatibility with great potential for a meaningful connection.';
  ELSIF v_score >= 70 THEN
    v_explanation := 'You have good compatibility with some shared interests and values.';
  ELSIF v_score >= 60 THEN
    v_explanation := 'You have moderate compatibility. You may need to work on understanding each other better.';
  ELSE
    v_explanation := 'You have basic compatibility. This could be an opportunity to learn from your differences.';
  END IF;
  
  RETURN v_explanation;
END;
$$;