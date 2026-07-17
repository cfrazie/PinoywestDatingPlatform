/*
  # Advanced Image Verification System
  
  1. New Tables
    - user_verification_requests: Image verification with reverse search
    - image_match_detections: Found matches across platforms
    - social_media_verifications: OAuth social media linking
  
  2. Features
    - Phone camera metadata verification
    - Reverse image search across platforms
    - Risk scoring system
    - AI-generated image detection
    - Stock photo detection
    - Adult content detection
  
  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- User verification requests
CREATE TABLE IF NOT EXISTS user_verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  verification_type TEXT NOT NULL CHECK (verification_type IN ('photo', 'id_document', 'social_media', 'video_selfie', 'phone_camera')),
  
  -- Image data
  image_url TEXT NOT NULL,
  image_hash TEXT, -- Perceptual hash for comparison
  
  -- Phone camera verification
  is_phone_camera BOOLEAN DEFAULT false,
  camera_metadata JSONB, -- EXIF data, device info
  capture_timestamp TIMESTAMPTZ,
  
  -- Reverse image search results
  reverse_search_completed BOOLEAN DEFAULT false,
  reverse_search_results JSONB,
  
  -- Detection results
  found_on_platforms TEXT[], -- ['instagram', 'tinder', 'onlyfans', etc.]
  is_stock_photo BOOLEAN DEFAULT false,
  is_celebrity BOOLEAN DEFAULT false,
  is_ai_generated BOOLEAN DEFAULT false,
  
  -- Risk assessment
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  risk_factors JSONB,
  risk_score INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'verified', 'rejected', 'flagged')),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id), -- Admin who verified
  rejection_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_verification_user ON user_verification_requests(user_id, created_at DESC);
CREATE INDEX idx_verification_status ON user_verification_requests(status, created_at DESC);
CREATE INDEX idx_verification_risk ON user_verification_requests(risk_level, created_at DESC);

-- Detected image matches
CREATE TABLE IF NOT EXISTS image_match_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_request_id UUID REFERENCES user_verification_requests(id) ON DELETE CASCADE,
  
  platform TEXT NOT NULL, -- 'instagram', 'facebook', 'tinder', 'pornhub', etc.
  platform_category TEXT CHECK (platform_category IN ('social_media', 'dating_app', 'adult_content', 'stock_photo', 'ecommerce', 'news', 'other')),
  
  match_url TEXT NOT NULL,
  profile_url TEXT,
  profile_username TEXT,
  
  similarity_score FLOAT, -- 0-1, how similar the images are
  confidence FLOAT, -- How confident we are about the match
  
  detected_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_image_matches_verification ON image_match_detections(verification_request_id);
CREATE INDEX idx_image_matches_platform ON image_match_detections(platform, platform_category);

-- Social media verification
CREATE TABLE IF NOT EXISTS social_media_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'twitter', 'linkedin', 'tiktok')),
  platform_user_id TEXT,
  platform_username TEXT,
  profile_url TEXT,
  
  verification_method TEXT CHECK (verification_method IN ('oauth', 'manual', 'api')),
  
  -- Data pulled from social account
  account_creation_date DATE,
  followers_count INTEGER,
  posts_count INTEGER,
  profile_image_url TEXT,
  
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, platform)
);

CREATE INDEX idx_social_verifications_user ON social_media_verifications(user_id);
CREATE INDEX idx_social_verifications_platform ON social_media_verifications(platform, verified);

-- Enable Row Level Security
ALTER TABLE user_verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_match_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_verifications ENABLE ROW LEVEL SECURITY;

-- Policies for user_verification_requests
CREATE POLICY "Users can view their own verification requests"
  ON user_verification_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create verification requests"
  ON user_verification_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own verification requests"
  ON user_verification_requests FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies for image_match_detections
CREATE POLICY "Users can view their own image matches"
  ON image_match_detections FOR SELECT
  USING (
    verification_request_id IN (
      SELECT id FROM user_verification_requests WHERE user_id = auth.uid()
    )
  );

-- Policies for social_media_verifications
CREATE POLICY "Users can view their own social verifications"
  ON social_media_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create social verifications"
  ON social_media_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social verifications"
  ON social_media_verifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to calculate risk score
CREATE OR REPLACE FUNCTION calculate_verification_risk_score(
  p_verification_id UUID
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request RECORD;
  v_score INTEGER := 0;
  v_match_count INTEGER;
  v_adult_match_count INTEGER;
BEGIN
  -- Get verification request
  SELECT * INTO v_request
  FROM user_verification_requests
  WHERE id = p_verification_id;
  
  -- Count matches
  SELECT COUNT(*) INTO v_match_count
  FROM image_match_detections
  WHERE verification_request_id = p_verification_id;
  
  -- Count adult content matches
  SELECT COUNT(*) INTO v_adult_match_count
  FROM image_match_detections
  WHERE verification_request_id = p_verification_id
  AND platform_category = 'adult_content';
  
  -- Calculate score
  IF v_adult_match_count > 0 THEN
    v_score := v_score + 50;
  END IF;
  
  IF v_request.is_stock_photo THEN
    v_score := v_score + 40;
  END IF;
  
  IF v_request.is_ai_generated THEN
    v_score := v_score + 45;
  END IF;
  
  IF v_request.is_celebrity THEN
    v_score := v_score + 35;
  END IF;
  
  IF v_match_count > 5 THEN
    v_score := v_score + 30;
  END IF;
  
  -- Reduce score if phone camera
  IF v_request.is_phone_camera THEN
    v_score := v_score - 20;
  END IF;
  
  -- Update the request with the score
  UPDATE user_verification_requests
  SET risk_score = GREATEST(v_score, 0),
      risk_level = CASE
        WHEN v_score >= 70 THEN 'critical'
        WHEN v_score >= 40 THEN 'high'
        WHEN v_score >= 20 THEN 'medium'
        ELSE 'low'
      END
  WHERE id = p_verification_id;
  
  RETURN v_score;
END;
$$;

-- Function to get verification status
CREATE OR REPLACE FUNCTION get_user_verification_status(
  p_user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
  v_latest_request RECORD;
BEGIN
  -- Get latest verification request
  SELECT * INTO v_latest_request
  FROM user_verification_requests
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF v_latest_request IS NULL THEN
    RETURN jsonb_build_object(
      'has_verification', false,
      'status', 'none'
    );
  END IF;
  
  v_result := jsonb_build_object(
    'has_verification', true,
    'status', v_latest_request.status,
    'risk_level', v_latest_request.risk_level,
    'risk_score', v_latest_request.risk_score,
    'verified_at', v_latest_request.verified_at,
    'is_phone_camera', v_latest_request.is_phone_camera,
    'found_on_platforms', v_latest_request.found_on_platforms
  );
  
  RETURN v_result;
END;
$$;

-- Trigger to update timestamps
CREATE TRIGGER update_verification_timestamp
  BEFORE UPDATE ON user_verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_verification_timestamp
  BEFORE UPDATE ON social_media_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
