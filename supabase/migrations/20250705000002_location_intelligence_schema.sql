/*
  # Location Intelligence System with OFW Support
  
  1. New Tables
    - user_locations: Multiple locations per user (home, current, work)
    - ip_location_history: IP-based location tracking
  
  2. Features
    - OFW (Overseas Filipino Worker) specific fields
    - IP confidence scoring
    - Multiple verification methods
    - Location type categorization
  
  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- User locations (supports multiple: home, current, work)
CREATE TABLE IF NOT EXISTS user_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Location type
  location_type TEXT NOT NULL CHECK (location_type IN ('home', 'current', 'work', 'travel')),
  is_primary BOOLEAN DEFAULT false,
  
  -- Location data
  country TEXT NOT NULL,
  country_code TEXT NOT NULL, -- ISO 3166-1 alpha-2
  region TEXT, -- State/Province
  city TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  timezone TEXT,
  
  -- OFW specific
  is_ofw BOOLEAN DEFAULT false,
  ofw_host_country TEXT, -- Country where working
  ofw_home_country TEXT DEFAULT 'Philippines',
  ofw_occupation TEXT,
  ofw_visa_type TEXT,
  ofw_return_date DATE,
  
  -- IP tracking
  detected_from_ip TEXT,
  ip_confidence FLOAT, -- How confident we are about IP location
  manually_set BOOLEAN DEFAULT false,
  
  -- Verification
  verified BOOLEAN DEFAULT false,
  verification_method TEXT, -- 'ip', 'gps', 'manual', 'document'
  verification_date TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_locations_user ON user_locations(user_id, is_primary);
CREATE INDEX idx_user_locations_ofw ON user_locations(is_ofw, ofw_host_country);
CREATE INDEX idx_user_locations_country ON user_locations(country, city);

-- IP location history
CREATE TABLE IF NOT EXISTS ip_location_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  ip_address TEXT NOT NULL,
  country TEXT,
  country_code TEXT,
  region TEXT,
  city TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  timezone TEXT,
  isp TEXT,
  
  detected_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ip_history_user ON ip_location_history(user_id, detected_at DESC);
CREATE INDEX idx_ip_history_ip ON ip_location_history(ip_address, detected_at DESC);

-- Enable Row Level Security
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_location_history ENABLE ROW LEVEL SECURITY;

-- Policies for user_locations
CREATE POLICY "Users can view their own locations"
  ON user_locations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own locations"
  ON user_locations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own locations"
  ON user_locations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own locations"
  ON user_locations FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for ip_location_history
CREATE POLICY "Users can view their own IP history"
  ON ip_location_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert IP history"
  ON ip_location_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to detect and update user location from IP
CREATE OR REPLACE FUNCTION detect_location_from_ip(
  p_user_id UUID,
  p_ip_address TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_location JSONB;
  v_existing_location UUID;
BEGIN
  -- In production, this would call an IP geolocation API (ipapi.co, ip-api.com, etc.)
  -- For now, we'll insert a record and return placeholder data
  
  -- Insert IP history
  INSERT INTO ip_location_history (user_id, ip_address, detected_at)
  VALUES (p_user_id, p_ip_address, NOW());
  
  -- Check if user already has a current location
  SELECT id INTO v_existing_location
  FROM user_locations
  WHERE user_id = p_user_id AND location_type = 'current'
  LIMIT 1;
  
  -- Return location data (in production, this comes from external API)
  v_location := jsonb_build_object(
    'country', 'Philippines',
    'country_code', 'PH',
    'city', 'Manila',
    'region', 'Metro Manila',
    'latitude', 14.5995,
    'longitude', 120.9842,
    'timezone', 'Asia/Manila',
    'confidence', 0.85,
    'has_existing_location', v_existing_location IS NOT NULL
  );
  
  RETURN v_location;
END;
$$;

-- Function to get user's primary location
CREATE OR REPLACE FUNCTION get_user_primary_location(
  p_user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_location JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', id,
    'location_type', location_type,
    'country', country,
    'country_code', country_code,
    'region', region,
    'city', city,
    'latitude', latitude,
    'longitude', longitude,
    'timezone', timezone,
    'is_ofw', is_ofw,
    'ofw_host_country', ofw_host_country,
    'ofw_home_country', ofw_home_country
  ) INTO v_location
  FROM user_locations
  WHERE user_id = p_user_id AND is_primary = true
  LIMIT 1;
  
  RETURN v_location;
END;
$$;

-- Function to set primary location
CREATE OR REPLACE FUNCTION set_primary_location(
  p_user_id UUID,
  p_location_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Unset all primary flags for user
  UPDATE user_locations
  SET is_primary = false
  WHERE user_id = p_user_id;
  
  -- Set new primary
  UPDATE user_locations
  SET is_primary = true
  WHERE id = p_location_id AND user_id = p_user_id;
  
  RETURN FOUND;
END;
$$;

-- Trigger to update updated_at
CREATE TRIGGER update_locations_timestamp
  BEFORE UPDATE ON user_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to ensure only one primary location per user
CREATE OR REPLACE FUNCTION ensure_single_primary_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = true THEN
    UPDATE user_locations
    SET is_primary = false
    WHERE user_id = NEW.user_id 
    AND id != NEW.id
    AND is_primary = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_primary_location_unique
  BEFORE INSERT OR UPDATE ON user_locations
  FOR EACH ROW
  WHEN (NEW.is_primary = true)
  EXECUTE FUNCTION ensure_single_primary_location();
