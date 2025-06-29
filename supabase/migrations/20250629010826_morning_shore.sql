/*
  # Advanced Search and Filtering Schema

  1. New Tables
    - `user_search_preferences` - Stores user search criteria and filters
    - `user_search_history` - Tracks search history for recommendations
    - `user_search_saved` - Saved searches for quick access
    - `user_attributes` - Detailed user attributes for advanced filtering
    - `user_interests` - User interests and hobbies for matching
    - `user_compatibility_scores` - Pre-calculated compatibility scores

  2. Security
    - Enable RLS on all tables
    - Add policies for proper data access control
    - Create indexes for search performance

  3. Changes
    - Add full-text search capabilities
    - Create functions for advanced filtering
*/

-- User Attributes Table (for advanced filtering)
CREATE TABLE IF NOT EXISTS user_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  height INTEGER, -- in cm
  body_type TEXT,
  education_level TEXT,
  occupation TEXT,
  income_range TEXT,
  religion TEXT,
  religiosity TEXT CHECK (religiosity IN ('very_religious', 'religious', 'somewhat_religious', 'not_religious')),
  smoking TEXT CHECK (smoking IN ('never', 'occasionally', 'regularly', 'trying_to_quit')),
  drinking TEXT CHECK (drinking IN ('never', 'socially', 'regularly')),
  exercise_frequency TEXT CHECK (exercise_frequency IN ('never', 'rarely', 'sometimes', 'regularly', 'daily')),
  has_children BOOLEAN,
  wants_children TEXT CHECK (wants_children IN ('yes', 'no', 'maybe', 'undecided')),
  pets TEXT[],
  languages TEXT[],
  cultural_background TEXT,
  cultural_values JSONB,
  personality_traits TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- User Interests Table (for interest-based matching)
CREATE TABLE IF NOT EXISTS user_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  interest TEXT NOT NULL,
  level TEXT CHECK (level IN ('casual', 'interested', 'passionate', 'expert')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category, interest)
);

-- User Search Preferences Table
CREATE TABLE IF NOT EXISTS user_search_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  age_min INTEGER,
  age_max INTEGER,
  distance_max INTEGER, -- in km
  height_min INTEGER,
  height_max INTEGER,
  body_types TEXT[],
  education_levels TEXT[],
  religions TEXT[],
  has_children BOOLEAN,
  wants_children TEXT[],
  smoking_preferences TEXT[],
  drinking_preferences TEXT[],
  languages TEXT[],
  cultural_backgrounds TEXT[],
  interests TEXT[],
  personality_traits TEXT[],
  location_preferences JSONB,
  online_now BOOLEAN,
  has_photo BOOLEAN,
  verified_only BOOLEAN,
  sort_by TEXT CHECK (sort_by IN ('relevance', 'newest', 'distance', 'age_asc', 'age_desc')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- User Search History Table
CREATE TABLE IF NOT EXISTS user_search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  search_params JSONB NOT NULL,
  results_count INTEGER,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Saved Searches Table
CREATE TABLE IF NOT EXISTS user_saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  search_params JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- User Compatibility Scores Table (pre-calculated for performance)
CREATE TABLE IF NOT EXISTS user_compatibility_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_score NUMERIC(5,2) NOT NULL,
  cultural_score NUMERIC(5,2),
  interests_score NUMERIC(5,2),
  values_score NUMERIC(5,2),
  personality_score NUMERIC(5,2),
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_user_id)
);

-- User Search Results Cache Table (for performance)
CREATE TABLE IF NOT EXISTS user_search_results_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  search_hash TEXT NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(user_id, search_hash)
);

-- Enable Row Level Security
ALTER TABLE user_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_search_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_compatibility_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_search_results_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- User Attributes
CREATE POLICY "Users can read all user attributes" ON user_attributes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage their own attributes" ON user_attributes
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- User Interests
CREATE POLICY "Users can read all user interests" ON user_interests
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage their own interests" ON user_interests
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- User Search Preferences
CREATE POLICY "Users can read their own search preferences" ON user_search_preferences
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own search preferences" ON user_search_preferences
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- User Search History
CREATE POLICY "Users can read their own search history" ON user_search_history
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search history" ON user_search_history
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own search history" ON user_search_history
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- User Saved Searches
CREATE POLICY "Users can read their own saved searches" ON user_saved_searches
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own saved searches" ON user_saved_searches
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- User Compatibility Scores
CREATE POLICY "Users can read compatibility scores involving them" ON user_compatibility_scores
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR auth.uid() = target_user_id);

-- User Search Results Cache
CREATE POLICY "Users can read their own search cache" ON user_search_results_cache
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own search cache" ON user_search_results_cache
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_attributes_user_id ON user_attributes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_attributes_height ON user_attributes(height);
CREATE INDEX IF NOT EXISTS idx_user_attributes_religion ON user_attributes(religion);
CREATE INDEX IF NOT EXISTS idx_user_attributes_has_children ON user_attributes(has_children);
CREATE INDEX IF NOT EXISTS idx_user_attributes_wants_children ON user_attributes(wants_children);
CREATE INDEX IF NOT EXISTS idx_user_attributes_cultural_background ON user_attributes(cultural_background);

CREATE INDEX IF NOT EXISTS idx_user_interests_user_id ON user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_category ON user_interests(category);
CREATE INDEX IF NOT EXISTS idx_user_interests_interest ON user_interests(interest);

CREATE INDEX IF NOT EXISTS idx_user_search_preferences_user_id ON user_search_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_search_history_user_id ON user_search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_search_history_executed_at ON user_search_history(executed_at);

CREATE INDEX IF NOT EXISTS idx_user_saved_searches_user_id ON user_saved_searches(user_id);

CREATE INDEX IF NOT EXISTS idx_user_compatibility_scores_user_id ON user_compatibility_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_user_compatibility_scores_target_user_id ON user_compatibility_scores(target_user_id);
CREATE INDEX IF NOT EXISTS idx_user_compatibility_scores_overall_score ON user_compatibility_scores(overall_score);

CREATE INDEX IF NOT EXISTS idx_user_search_results_cache_user_id ON user_search_results_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_user_search_results_cache_search_hash ON user_search_results_cache(search_hash);
CREATE INDEX IF NOT EXISTS idx_user_search_results_cache_expires_at ON user_search_results_cache(expires_at);

-- Create GIN index for full-text search on interests
CREATE INDEX IF NOT EXISTS idx_user_interests_gin ON user_interests USING GIN (interest gin_trgm_ops);

-- Create GIN index for JSONB fields
CREATE INDEX IF NOT EXISTS idx_user_attributes_cultural_values_gin ON user_attributes USING GIN (cultural_values);
CREATE INDEX IF NOT EXISTS idx_user_search_preferences_location_preferences_gin ON user_search_preferences USING GIN (location_preferences);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_attributes_updated_at 
  BEFORE UPDATE ON user_attributes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_search_preferences_updated_at 
  BEFORE UPDATE ON user_search_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_saved_searches_updated_at 
  BEFORE UPDATE ON user_saved_searches 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate compatibility score between two users
CREATE OR REPLACE FUNCTION calculate_compatibility_score(user1_id UUID, user2_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  cultural_score NUMERIC := 0;
  interests_score NUMERIC := 0;
  values_score NUMERIC := 0;
  personality_score NUMERIC := 0;
  overall_score NUMERIC := 0;
  
  -- Cultural factors
  user1_culture TEXT;
  user2_culture TEXT;
  
  -- Interests match count
  common_interests INTEGER := 0;
  total_interests INTEGER := 0;
  
  -- Values similarity
  user1_values JSONB;
  user2_values JSONB;
  
  -- Personality match
  user1_traits TEXT[];
  user2_traits TEXT[];
  matching_traits INTEGER := 0;
BEGIN
  -- Get cultural backgrounds
  SELECT cultural_background INTO user1_culture FROM user_attributes WHERE user_id = user1_id;
  SELECT cultural_background INTO user2_culture FROM user_attributes WHERE user_id = user2_id;
  
  -- Calculate cultural score (higher if different cultures - for cross-cultural matching)
  IF user1_culture IS NOT NULL AND user2_culture IS NOT NULL AND user1_culture != user2_culture THEN
    cultural_score := 100;
  ELSE
    cultural_score := 50;
  END IF;
  
  -- Calculate interests score
  WITH user1_interests AS (
    SELECT interest FROM user_interests WHERE user_id = user1_id
  ),
  user2_interests AS (
    SELECT interest FROM user_interests WHERE user_id = user2_id
  ),
  common AS (
    SELECT COUNT(*) AS count FROM user1_interests 
    INNER JOIN user2_interests USING (interest)
  ),
  total AS (
    SELECT COUNT(*) AS count FROM (
      SELECT interest FROM user1_interests
      UNION
      SELECT interest FROM user2_interests
    ) AS all_interests
  )
  SELECT 
    common.count INTO common_interests
  FROM common;
  
  SELECT 
    total.count INTO total_interests
  FROM total;
  
  IF total_interests > 0 THEN
    interests_score := (common_interests::NUMERIC / total_interests::NUMERIC) * 100;
  ELSE
    interests_score := 50; -- Default if no interests
  END IF;
  
  -- Calculate values score
  SELECT cultural_values INTO user1_values FROM user_attributes WHERE user_id = user1_id;
  SELECT cultural_values INTO user2_values FROM user_attributes WHERE user_id = user2_id;
  
  IF user1_values IS NOT NULL AND user2_values IS NOT NULL THEN
    -- Simple similarity calculation (in real app would be more sophisticated)
    values_score := 70; -- Placeholder
  ELSE
    values_score := 50; -- Default if no values data
  END IF;
  
  -- Calculate personality score
  SELECT personality_traits INTO user1_traits FROM user_attributes WHERE user_id = user1_id;
  SELECT personality_traits INTO user2_traits FROM user_attributes WHERE user_id = user2_id;
  
  IF user1_traits IS NOT NULL AND user2_traits IS NOT NULL THEN
    SELECT COUNT(*) INTO matching_traits
    FROM unnest(user1_traits) AS t1
    INNER JOIN unnest(user2_traits) AS t2 ON t1 = t2;
    
    personality_score := (matching_traits::NUMERIC / 
                         GREATEST(array_length(user1_traits, 1), array_length(user2_traits, 1))::NUMERIC) * 100;
  ELSE
    personality_score := 50; -- Default if no personality data
  END IF;
  
  -- Calculate overall score (weighted average)
  overall_score := (cultural_score * 0.4) + (interests_score * 0.3) + 
                  (values_score * 0.2) + (personality_score * 0.1);
  
  RETURN ROUND(overall_score, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to update compatibility scores
CREATE OR REPLACE FUNCTION update_compatibility_scores(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Delete existing scores for this user
  DELETE FROM user_compatibility_scores 
  WHERE user_id = target_user_id OR target_user_id = target_user_id;
  
  -- Calculate and insert new scores
  INSERT INTO user_compatibility_scores (user_id, target_user_id, overall_score, calculated_at)
  SELECT 
    target_user_id,
    u.id,
    calculate_compatibility_score(target_user_id, u.id),
    NOW()
  FROM auth.users u
  WHERE u.id != target_user_id;
  
  -- Calculate and insert reverse scores
  INSERT INTO user_compatibility_scores (user_id, target_user_id, overall_score, calculated_at)
  SELECT 
    u.id,
    target_user_id,
    calculate_compatibility_score(u.id, target_user_id),
    NOW()
  FROM auth.users u
  WHERE u.id != target_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to search users with advanced filtering
CREATE OR REPLACE FUNCTION search_users(
  p_user_id UUID,
  p_age_min INTEGER DEFAULT NULL,
  p_age_max INTEGER DEFAULT NULL,
  p_distance_max INTEGER DEFAULT NULL,
  p_height_min INTEGER DEFAULT NULL,
  p_height_max INTEGER DEFAULT NULL,
  p_body_types TEXT[] DEFAULT NULL,
  p_education_levels TEXT[] DEFAULT NULL,
  p_religions TEXT[] DEFAULT NULL,
  p_has_children BOOLEAN DEFAULT NULL,
  p_wants_children TEXT[] DEFAULT NULL,
  p_smoking_preferences TEXT[] DEFAULT NULL,
  p_drinking_preferences TEXT[] DEFAULT NULL,
  p_languages TEXT[] DEFAULT NULL,
  p_cultural_backgrounds TEXT[] DEFAULT NULL,
  p_interests TEXT[] DEFAULT NULL,
  p_personality_traits TEXT[] DEFAULT NULL,
  p_location_preferences JSONB DEFAULT NULL,
  p_online_now BOOLEAN DEFAULT NULL,
  p_has_photo BOOLEAN DEFAULT NULL,
  p_verified_only BOOLEAN DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'relevance',
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  age INTEGER,
  location TEXT,
  distance NUMERIC,
  compatibility_score NUMERIC,
  photo_url TEXT,
  online_status BOOLEAN,
  verified BOOLEAN,
  last_active TIMESTAMPTZ,
  cultural_background TEXT,
  interests TEXT[],
  languages TEXT[]
) AS $$
DECLARE
  user_location GEOMETRY;
  search_hash TEXT;
  cached_results JSONB;
BEGIN
  -- Generate search hash for caching
  search_hash := MD5(
    COALESCE(p_user_id::TEXT, '') || 
    COALESCE(p_age_min::TEXT, '') || 
    COALESCE(p_age_max::TEXT, '') ||
    COALESCE(p_distance_max::TEXT, '') ||
    COALESCE(array_to_string(p_body_types, ','), '') ||
    COALESCE(array_to_string(p_education_levels, ','), '') ||
    COALESCE(array_to_string(p_religions, ','), '') ||
    COALESCE(p_has_children::TEXT, '') ||
    COALESCE(array_to_string(p_wants_children, ','), '') ||
    COALESCE(array_to_string(p_smoking_preferences, ','), '') ||
    COALESCE(array_to_string(p_drinking_preferences, ','), '') ||
    COALESCE(array_to_string(p_languages, ','), '') ||
    COALESCE(array_to_string(p_cultural_backgrounds, ','), '') ||
    COALESCE(array_to_string(p_interests, ','), '') ||
    COALESCE(array_to_string(p_personality_traits, ','), '') ||
    COALESCE(p_location_preferences::TEXT, '') ||
    COALESCE(p_online_now::TEXT, '') ||
    COALESCE(p_has_photo::TEXT, '') ||
    COALESCE(p_verified_only::TEXT, '') ||
    COALESCE(p_sort_by, '') ||
    COALESCE(p_limit::TEXT, '') ||
    COALESCE(p_offset::TEXT, '')
  );
  
  -- Check cache first
  SELECT results INTO cached_results
  FROM user_search_results_cache
  WHERE user_id = p_user_id
    AND search_hash = search_hash
    AND expires_at > NOW();
    
  IF cached_results IS NOT NULL THEN
    -- Return cached results
    RETURN QUERY
    SELECT 
      (r->>'user_id')::UUID,
      r->>'username',
      (r->>'age')::INTEGER,
      r->>'location',
      (r->>'distance')::NUMERIC,
      (r->>'compatibility_score')::NUMERIC,
      r->>'photo_url',
      (r->>'online_status')::BOOLEAN,
      (r->>'verified')::BOOLEAN,
      (r->>'last_active')::TIMESTAMPTZ,
      r->>'cultural_background',
      (r->>'interests')::TEXT[],
      (r->>'languages')::TEXT[]
    FROM jsonb_array_elements(cached_results) r;
    
    -- Log search in history
    INSERT INTO user_search_history (
      user_id, 
      search_params, 
      results_count
    ) VALUES (
      p_user_id,
      jsonb_build_object(
        'age_min', p_age_min,
        'age_max', p_age_max,
        'distance_max', p_distance_max,
        'body_types', p_body_types,
        'education_levels', p_education_levels,
        'religions', p_religions,
        'has_children', p_has_children,
        'wants_children', p_wants_children,
        'smoking_preferences', p_smoking_preferences,
        'drinking_preferences', p_drinking_preferences,
        'languages', p_languages,
        'cultural_backgrounds', p_cultural_backgrounds,
        'interests', p_interests,
        'personality_traits', p_personality_traits,
        'location_preferences', p_location_preferences,
        'online_now', p_online_now,
        'has_photo', p_has_photo,
        'verified_only', p_verified_only,
        'sort_by', p_sort_by,
        'from_cache', true
      ),
      jsonb_array_length(cached_results)
    );
    
    RETURN;
  END IF;
  
  -- Get user's location for distance calculation
  -- In a real implementation, this would use PostGIS for accurate distance calculations
  
  -- Perform the search
  RETURN QUERY
  WITH user_profiles AS (
    SELECT 
      u.id,
      u.raw_user_meta_data->>'username' AS username,
      (EXTRACT(YEAR FROM AGE(NOW(), (u.raw_user_meta_data->>'birthdate')::DATE)))::INTEGER AS age,
      u.raw_user_meta_data->>'location' AS location,
      0 AS distance, -- Placeholder for real distance calculation
      COALESCE(cs.overall_score, 50) AS compatibility_score,
      u.raw_user_meta_data->>'avatar_url' AS photo_url,
      (u.raw_user_meta_data->>'online_status')::BOOLEAN AS online_status,
      (u.raw_user_meta_data->>'verified')::BOOLEAN AS verified,
      u.last_sign_in_at AS last_active,
      a.cultural_background,
      ARRAY(
        SELECT interest 
        FROM user_interests 
        WHERE user_id = u.id
      ) AS interests,
      a.languages
    FROM auth.users u
    LEFT JOIN user_attributes a ON u.id = a.user_id
    LEFT JOIN user_compatibility_scores cs ON cs.user_id = p_user_id AND cs.target_user_id = u.id
    WHERE u.id != p_user_id
      -- Age filter
      AND (p_age_min IS NULL OR (EXTRACT(YEAR FROM AGE(NOW(), (u.raw_user_meta_data->>'birthdate')::DATE)))::INTEGER >= p_age_min)
      AND (p_age_max IS NULL OR (EXTRACT(YEAR FROM AGE(NOW(), (u.raw_user_meta_data->>'birthdate')::DATE)))::INTEGER <= p_age_max)
      -- Height filter
      AND (p_height_min IS NULL OR a.height IS NULL OR a.height >= p_height_min)
      AND (p_height_max IS NULL OR a.height IS NULL OR a.height <= p_height_max)
      -- Body type filter
      AND (p_body_types IS NULL OR a.body_type IS NULL OR a.body_type = ANY(p_body_types))
      -- Education filter
      AND (p_education_levels IS NULL OR a.education_level IS NULL OR a.education_level = ANY(p_education_levels))
      -- Religion filter
      AND (p_religions IS NULL OR a.religion IS NULL OR a.religion = ANY(p_religions))
      -- Children filter
      AND (p_has_children IS NULL OR a.has_children IS NULL OR a.has_children = p_has_children)
      -- Wants children filter
      AND (p_wants_children IS NULL OR a.wants_children IS NULL OR a.wants_children = ANY(p_wants_children))
      -- Smoking filter
      AND (p_smoking_preferences IS NULL OR a.smoking IS NULL OR a.smoking = ANY(p_smoking_preferences))
      -- Drinking filter
      AND (p_drinking_preferences IS NULL OR a.drinking IS NULL OR a.drinking = ANY(p_drinking_preferences))
      -- Language filter
      AND (p_languages IS NULL OR a.languages IS NULL OR a.languages && p_languages)
      -- Cultural background filter
      AND (p_cultural_backgrounds IS NULL OR a.cultural_background IS NULL OR a.cultural_background = ANY(p_cultural_backgrounds))
      -- Personality traits filter
      AND (p_personality_traits IS NULL OR a.personality_traits IS NULL OR a.personality_traits && p_personality_traits)
      -- Online now filter
      AND (p_online_now IS NULL OR (u.raw_user_meta_data->>'online_status')::BOOLEAN = p_online_now)
      -- Has photo filter
      AND (p_has_photo IS NULL OR (u.raw_user_meta_data->>'avatar_url' IS NOT NULL) = p_has_photo)
      -- Verified only filter
      AND (p_verified_only IS NULL OR (u.raw_user_meta_data->>'verified')::BOOLEAN = p_verified_only)
      -- Interest filter (more complex, needs to match any of the provided interests)
      AND (p_interests IS NULL OR EXISTS (
        SELECT 1 FROM user_interests ui
        WHERE ui.user_id = u.id AND ui.interest = ANY(p_interests)
      ))
  )
  SELECT 
    id AS user_id,
    username,
    age,
    location,
    distance,
    compatibility_score,
    photo_url,
    online_status,
    verified,
    last_active,
    cultural_background,
    interests,
    languages
  FROM user_profiles
  ORDER BY
    CASE WHEN p_sort_by = 'relevance' THEN compatibility_score END DESC,
    CASE WHEN p_sort_by = 'newest' THEN last_active END DESC,
    CASE WHEN p_sort_by = 'distance' THEN distance END ASC,
    CASE WHEN p_sort_by = 'age_asc' THEN age END ASC,
    CASE WHEN p_sort_by = 'age_desc' THEN age END DESC
  LIMIT p_limit
  OFFSET p_offset;
  
  -- Cache the results
  INSERT INTO user_search_results_cache (
    user_id,
    search_hash,
    results,
    expires_at
  )
  SELECT
    p_user_id,
    search_hash,
    jsonb_agg(
      jsonb_build_object(
        'user_id', user_id,
        'username', username,
        'age', age,
        'location', location,
        'distance', distance,
        'compatibility_score', compatibility_score,
        'photo_url', photo_url,
        'online_status', online_status,
        'verified', verified,
        'last_active', last_active,
        'cultural_background', cultural_background,
        'interests', interests,
        'languages', languages
      )
    ),
    NOW() + INTERVAL '15 minutes'
  FROM search_users(
    p_user_id, p_age_min, p_age_max, p_distance_max, p_height_min, p_height_max,
    p_body_types, p_education_levels, p_religions, p_has_children, p_wants_children,
    p_smoking_preferences, p_drinking_preferences, p_languages, p_cultural_backgrounds,
    p_interests, p_personality_traits, p_location_preferences, p_online_now,
    p_has_photo, p_verified_only, p_sort_by, p_limit, p_offset
  );
  
  -- Log search in history
  INSERT INTO user_search_history (
    user_id, 
    search_params, 
    results_count
  )
  SELECT
    p_user_id,
    jsonb_build_object(
      'age_min', p_age_min,
      'age_max', p_age_max,
      'distance_max', p_distance_max,
      'body_types', p_body_types,
      'education_levels', p_education_levels,
      'religions', p_religions,
      'has_children', p_has_children,
      'wants_children', p_wants_children,
      'smoking_preferences', p_smoking_preferences,
      'drinking_preferences', p_drinking_preferences,
      'languages', p_languages,
      'cultural_backgrounds', p_cultural_backgrounds,
      'interests', p_interests,
      'personality_traits', p_personality_traits,
      'location_preferences', p_location_preferences,
      'online_now', p_online_now,
      'has_photo', p_has_photo,
      'verified_only', p_verified_only,
      'sort_by', p_sort_by,
      'from_cache', false
    ),
    COUNT(*)
  FROM search_users(
    p_user_id, p_age_min, p_age_max, p_distance_max, p_height_min, p_height_max,
    p_body_types, p_education_levels, p_religions, p_has_children, p_wants_children,
    p_smoking_preferences, p_drinking_preferences, p_languages, p_cultural_backgrounds,
    p_interests, p_personality_traits, p_location_preferences, p_online_now,
    p_has_photo, p_verified_only, p_sort_by, p_limit, p_offset
  );
END;
$$ LANGUAGE plpgsql;

-- Create extension for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Sample data for testing
INSERT INTO user_attributes (
  user_id, 
  height, 
  body_type, 
  education_level, 
  occupation, 
  religion, 
  religiosity, 
  smoking, 
  drinking, 
  exercise_frequency, 
  has_children, 
  wants_children, 
  languages, 
  cultural_background, 
  personality_traits
) VALUES
  ('00000000-0000-0000-0000-000000000001', 175, 'average', 'bachelors', 'Engineer', 'Christian', 'religious', 'never', 'socially', 'regularly', false, 'yes', ARRAY['English', 'Spanish'], 'American', ARRAY['outgoing', 'adventurous', 'creative']),
  ('00000000-0000-0000-0000-000000000002', 160, 'petite', 'masters', 'Teacher', 'Catholic', 'very_religious', 'never', 'never', 'sometimes', false, 'yes', ARRAY['Filipino', 'English'], 'Filipino', ARRAY['caring', 'patient', 'traditional']),
  ('00000000-0000-0000-0000-000000000003', 183, 'athletic', 'bachelors', 'Marketing', 'Agnostic', 'not_religious', 'occasionally', 'socially', 'daily', false, 'maybe', ARRAY['English'], 'American', ARRAY['ambitious', 'analytical', 'confident']),
  ('00000000-0000-0000-0000-000000000004', 165, 'average', 'bachelors', 'Nurse', 'Catholic', 'religious', 'never', 'socially', 'regularly', true, 'yes', ARRAY['Filipino', 'English'], 'Filipino', ARRAY['nurturing', 'family-oriented', 'optimistic'])
ON CONFLICT DO NOTHING;

INSERT INTO user_interests (user_id, category, interest, level) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Sports', 'Hiking', 'passionate'),
  ('00000000-0000-0000-0000-000000000001', 'Music', 'Rock', 'interested'),
  ('00000000-0000-0000-0000-000000000001', 'Food', 'Italian Cuisine', 'casual'),
  ('00000000-0000-0000-0000-000000000002', 'Arts', 'Painting', 'passionate'),
  ('00000000-0000-0000-0000-000000000002', 'Food', 'Filipino Cuisine', 'expert'),
  ('00000000-0000-0000-0000-000000000002', 'Travel', 'Beach Destinations', 'interested'),
  ('00000000-0000-0000-0000-000000000003', 'Sports', 'Basketball', 'passionate'),
  ('00000000-0000-0000-0000-000000000003', 'Technology', 'Gadgets', 'expert'),
  ('00000000-0000-0000-0000-000000000003', 'Music', 'Hip Hop', 'interested'),
  ('00000000-0000-0000-0000-000000000004', 'Family', 'Parenting', 'passionate'),
  ('00000000-0000-0000-0000-000000000004', 'Food', 'Baking', 'expert'),
  ('00000000-0000-0000-0000-000000000004', 'Travel', 'Cultural Exploration', 'interested')
ON CONFLICT DO NOTHING;

-- Create a scheduled job to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_search_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM user_search_results_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;