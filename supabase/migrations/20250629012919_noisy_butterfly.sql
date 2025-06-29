/*
  # Profile Verification Report System

  1. New Tables
    - `verification_reports` - Stores verification reports for user profiles
    - `verification_evidence` - Stores evidence items for verification reports
    - `verification_platforms` - Stores supported verification platforms
    - `verification_statuses` - Tracks verification status history

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to create and view their own reports
    - Add policies for admins to manage all reports

  3. Changes
    - Add verification status to user profiles
    - Add verification score to user profiles
*/

-- Create verification_platforms table
CREATE TABLE IF NOT EXISTS verification_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT,
  url_pattern TEXT,
  api_endpoint TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create verification_reports table
CREATE TABLE IF NOT EXISTS verification_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  verification_result TEXT CHECK (verification_result IN ('verified', 'suspicious', 'unverifiable', 'fake')),
  confidence_score FLOAT,
  report_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, target_user_id)
);

-- Create verification_evidence table
CREATE TABLE IF NOT EXISTS verification_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES verification_reports(id) ON DELETE CASCADE,
  platform_id UUID REFERENCES verification_platforms(id),
  platform_name TEXT NOT NULL,
  evidence_type TEXT NOT NULL CHECK (evidence_type IN ('image_match', 'profile_link', 'username_match', 'creation_date', 'location_match', 'inconsistency', 'stock_photo')),
  evidence_data JSONB NOT NULL,
  confidence_score FLOAT,
  is_red_flag BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create verification_statuses table
CREATE TABLE IF NOT EXISTS verification_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('unverified', 'pending', 'verified', 'rejected')),
  verification_score FLOAT,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add verification status to profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN verification_status TEXT DEFAULT 'unverified';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'verification_score'
  ) THEN
    ALTER TABLE profiles ADD COLUMN verification_score FLOAT DEFAULT 0;
  END IF;
END $$;

-- Create function to update profile verification status
CREATE OR REPLACE FUNCTION update_profile_verification_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET 
    verification_status = NEW.status,
    verification_score = NEW.verification_score,
    updated_at = now()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to update profile verification status
CREATE TRIGGER update_profile_verification_status_trigger
AFTER INSERT OR UPDATE ON verification_statuses
FOR EACH ROW
EXECUTE FUNCTION update_profile_verification_status();

-- Create function to perform reverse image search
CREATE OR REPLACE FUNCTION perform_reverse_image_search(
  p_image_url TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- This is a placeholder function that would integrate with external APIs
  -- In a real implementation, this would call services like Google Vision API, TinEye, etc.
  
  -- Mock response for demonstration
  v_result := jsonb_build_object(
    'matches', jsonb_build_array(
      jsonb_build_object(
        'url', 'https://example.com/profile1',
        'similarity', 0.95,
        'platform', 'Facebook',
        'creation_date', '2023-01-15T00:00:00Z'
      ),
      jsonb_build_object(
        'url', 'https://example.com/profile2',
        'similarity', 0.87,
        'platform', 'Instagram',
        'creation_date', '2023-02-20T00:00:00Z'
      )
    ),
    'is_stock_photo', false,
    'confidence', 0.92
  );
  
  RETURN v_result;
END;
$$;

-- Create function to cross-reference profile information
CREATE OR REPLACE FUNCTION cross_reference_profile_info(
  p_user_id UUID,
  p_username TEXT,
  p_location TEXT,
  p_bio TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- This is a placeholder function that would integrate with external APIs
  -- In a real implementation, this would search for the username across platforms
  
  -- Mock response for demonstration
  v_result := jsonb_build_object(
    'username_matches', jsonb_build_array(
      jsonb_build_object(
        'platform', 'Twitter',
        'username', p_username,
        'url', 'https://twitter.com/' || p_username,
        'creation_date', '2022-05-10T00:00:00Z',
        'bio_similarity', 0.78,
        'location_match', true
      ),
      jsonb_build_object(
        'platform', 'LinkedIn',
        'username', p_username,
        'url', 'https://linkedin.com/in/' || p_username,
        'creation_date', '2021-11-22T00:00:00Z',
        'bio_similarity', 0.65,
        'location_match', true
      )
    ),
    'consistency_score', 0.85,
    'red_flags', jsonb_build_array()
  );
  
  RETURN v_result;
END;
$$;

-- Create function to generate verification report
CREATE OR REPLACE FUNCTION generate_verification_report(
  p_report_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_report verification_reports%ROWTYPE;
  v_evidence JSONB;
  v_result JSONB;
  v_verification_result TEXT;
  v_confidence_score FLOAT := 0;
  v_summary TEXT;
  v_red_flags INT := 0;
BEGIN
  -- Get report
  SELECT * INTO v_report FROM verification_reports WHERE id = p_report_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Report not found';
  END IF;
  
  -- Get evidence
  SELECT jsonb_agg(jsonb_build_object(
    'id', id,
    'platform_name', platform_name,
    'evidence_type', evidence_type,
    'evidence_data', evidence_data,
    'confidence_score', confidence_score,
    'is_red_flag', is_red_flag
  )) INTO v_evidence
  FROM verification_evidence
  WHERE report_id = p_report_id;
  
  -- Count red flags
  SELECT COUNT(*) INTO v_red_flags
  FROM verification_evidence
  WHERE report_id = p_report_id AND is_red_flag = true;
  
  -- Calculate overall confidence score
  SELECT AVG(confidence_score) INTO v_confidence_score
  FROM verification_evidence
  WHERE report_id = p_report_id;
  
  -- Determine verification result
  IF v_red_flags > 2 THEN
    v_verification_result := 'fake';
  ELSIF v_red_flags > 0 THEN
    v_verification_result := 'suspicious';
  ELSIF v_confidence_score >= 0.8 THEN
    v_verification_result := 'verified';
  ELSE
    v_verification_result := 'unverifiable';
  END IF;
  
  -- Generate summary
  CASE v_verification_result
    WHEN 'verified' THEN
      v_summary := 'Profile appears to be authentic based on consistent information across platforms.';
    WHEN 'suspicious' THEN
      v_summary := 'Profile has some inconsistencies that require further verification.';
    WHEN 'fake' THEN
      v_summary := 'Profile shows multiple red flags indicating potential misrepresentation.';
    ELSE
      v_summary := 'Insufficient information to verify this profile.';
  END CASE;
  
  -- Update report
  UPDATE verification_reports
  SET 
    status = 'completed',
    verification_result = v_verification_result,
    confidence_score = v_confidence_score,
    report_summary = v_summary,
    completed_at = now(),
    updated_at = now()
  WHERE id = p_report_id;
  
  -- Update user verification status if this is a system verification
  IF v_report.user_id = v_report.target_user_id THEN
    INSERT INTO verification_statuses (
      user_id,
      status,
      verification_score,
      verified_at
    ) VALUES (
      v_report.target_user_id,
      CASE 
        WHEN v_verification_result = 'verified' THEN 'verified'
        WHEN v_verification_result = 'fake' THEN 'rejected'
        ELSE 'pending'
      END,
      v_confidence_score * 100,
      CASE WHEN v_verification_result = 'verified' THEN now() ELSE NULL END
    )
    ON CONFLICT (id) DO UPDATE
    SET
      status = CASE 
        WHEN v_verification_result = 'verified' THEN 'verified'
        WHEN v_verification_result = 'fake' THEN 'rejected'
        ELSE 'pending'
      END,
      verification_score = v_confidence_score * 100,
      verified_at = CASE WHEN v_verification_result = 'verified' THEN now() ELSE NULL END,
      updated_at = now();
  END IF;
  
  -- Build result
  v_result := jsonb_build_object(
    'report_id', p_report_id,
    'status', 'completed',
    'verification_result', v_verification_result,
    'confidence_score', v_confidence_score,
    'summary', v_summary,
    'evidence', v_evidence,
    'red_flags', v_red_flags,
    'completed_at', now()
  );
  
  RETURN v_result;
END;
$$;

-- Insert default verification platforms
INSERT INTO verification_platforms (name, icon, url_pattern, active) VALUES
('Google Images', 'search', 'https://images.google.com', true),
('TinEye', 'eye', 'https://tineye.com', true),
('Yandex Images', 'search', 'https://yandex.com/images', true),
('Bing Visual Search', 'search', 'https://www.bing.com/images/discover', true),
('Facebook', 'facebook', 'https://facebook.com/%s', true),
('Instagram', 'instagram', 'https://instagram.com/%s', true),
('LinkedIn', 'linkedin', 'https://linkedin.com/in/%s', true),
('Twitter', 'twitter', 'https://twitter.com/%s', true);

-- Enable Row Level Security
ALTER TABLE verification_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_statuses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Verification platforms are readable by all authenticated users
CREATE POLICY "Verification platforms are readable by authenticated users" 
ON verification_platforms FOR SELECT 
TO authenticated 
USING (true);

-- Users can create verification reports
CREATE POLICY "Users can create verification reports" 
ON verification_reports FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Users can view their own reports
CREATE POLICY "Users can view their own reports" 
ON verification_reports FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Users can view reports about themselves
CREATE POLICY "Users can view reports about themselves" 
ON verification_reports FOR SELECT 
TO authenticated 
USING (auth.uid() = target_user_id);

-- Admins can view all reports
CREATE POLICY "Admins can view all reports" 
ON verification_reports FOR ALL 
TO authenticated 
USING (
  auth.email() IN ('admin@pinoywest.com', 'support@pinoywest.com')
);

-- Users can view evidence for their own reports
CREATE POLICY "Users can view evidence for their own reports" 
ON verification_evidence FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM verification_reports 
    WHERE verification_reports.id = verification_evidence.report_id 
    AND verification_reports.user_id = auth.uid()
  )
);

-- Users can view evidence for reports about themselves
CREATE POLICY "Users can view evidence for reports about themselves" 
ON verification_evidence FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM verification_reports 
    WHERE verification_reports.id = verification_evidence.report_id 
    AND verification_reports.target_user_id = auth.uid()
  )
);

-- Admins can manage all evidence
CREATE POLICY "Admins can manage all evidence" 
ON verification_evidence FOR ALL 
TO authenticated 
USING (
  auth.email() IN ('admin@pinoywest.com', 'support@pinoywest.com')
);

-- Users can view their own verification status
CREATE POLICY "Users can view their own verification status" 
ON verification_statuses FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Admins can manage all verification statuses
CREATE POLICY "Admins can manage all verification statuses" 
ON verification_statuses FOR ALL 
TO authenticated 
USING (
  auth.email() IN ('admin@pinoywest.com', 'support@pinoywest.com')
);