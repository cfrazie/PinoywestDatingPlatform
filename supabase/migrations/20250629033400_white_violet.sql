/*
  # Admin Authentication System

  1. New Tables
    - `admin_users` - Stores admin user accounts with role-based permissions
    - `admin_sessions` - Tracks active admin sessions
    - `admin_activity_logs` - Records all admin actions for audit purposes
    - `admin_login_attempts` - Tracks failed login attempts for security
    - `admin_two_factor` - Stores 2FA secrets and verification status

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    - Password hashing and encryption
    - Session management with timeouts
*/

-- Create admin_roles enum type
CREATE TYPE admin_role AS ENUM ('super_admin', 'senior_admin', 'standard_admin');

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role admin_role NOT NULL DEFAULT 'standard_admin',
  is_active BOOLEAN NOT NULL DEFAULT true,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
  last_login TIMESTAMPTZ,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create admin_sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create admin_activity_logs table
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create admin_login_attempts table
CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create admin_two_factor table
CREATE TABLE IF NOT EXISTS admin_two_factor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  backup_codes TEXT[] NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX idx_admin_sessions_expires_at ON admin_sessions(expires_at);
CREATE INDEX idx_admin_activity_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX idx_admin_activity_logs_created_at ON admin_activity_logs(created_at);
CREATE INDEX idx_admin_login_attempts_username ON admin_login_attempts(username);
CREATE INDEX idx_admin_login_attempts_ip_address ON admin_login_attempts(ip_address);
CREATE INDEX idx_admin_login_attempts_created_at ON admin_login_attempts(created_at);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_two_factor ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Super admins can see all admin users
CREATE POLICY "Super admins can see all admin users"
  ON admin_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.role = 'super_admin'
    )
  );

-- Senior admins can see all admin users except super admins
CREATE POLICY "Senior admins can see non-super admin users"
  ON admin_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.role = 'senior_admin'
    ) AND role != 'super_admin'
  );

-- Standard admins can only see their own user
CREATE POLICY "Standard admins can see own user"
  ON admin_users
  FOR SELECT
  USING (id = auth.uid());

-- Super admins can create admin users
CREATE POLICY "Super admins can create admin users"
  ON admin_users
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.role = 'super_admin'
    )
  );

-- Super admins can update any admin user
CREATE POLICY "Super admins can update any admin user"
  ON admin_users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.role = 'super_admin'
    )
  );

-- Senior admins can update standard admins
CREATE POLICY "Senior admins can update standard admins"
  ON admin_users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.role = 'senior_admin'
    ) AND role = 'standard_admin'
  );

-- Admins can update their own user
CREATE POLICY "Admins can update own user"
  ON admin_users
  FOR UPDATE
  USING (id = auth.uid());

-- Super admins can delete any admin user
CREATE POLICY "Super admins can delete any admin user"
  ON admin_users
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.role = 'super_admin'
    )
  );

-- Senior admins can delete standard admins
CREATE POLICY "Senior admins can delete standard admins"
  ON admin_users
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.role = 'senior_admin'
    ) AND role = 'standard_admin'
  );

-- Session policies
CREATE POLICY "Admins can see own sessions"
  ON admin_sessions
  FOR SELECT
  USING (admin_id = auth.uid());

CREATE POLICY "Super admins can see all sessions"
  ON admin_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.role = 'super_admin'
    )
  );

-- Activity log policies
CREATE POLICY "Admins can see own activity logs"
  ON admin_activity_logs
  FOR SELECT
  USING (admin_id = auth.uid());

CREATE POLICY "Super admins can see all activity logs"
  ON admin_activity_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.role = 'super_admin'
    )
  );

CREATE POLICY "Senior admins can see standard admin logs"
  ON admin_activity_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() AND au.role = 'senior_admin'
    ) AND EXISTS (
      SELECT 1 FROM admin_users target
      WHERE target.id = admin_activity_logs.admin_id AND target.role = 'standard_admin'
    )
  );

-- Create functions for admin authentication
-- Function to hash passwords securely
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf', 10));
END;
$$;

-- Function to verify passwords
CREATE OR REPLACE FUNCTION verify_password(username TEXT, password TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_id UUID;
  is_locked BOOLEAN;
BEGIN
  -- Check if account is locked
  SELECT id, locked_until IS NOT NULL AND locked_until > now()
  INTO admin_id, is_locked
  FROM admin_users
  WHERE admin_users.username = verify_password.username;
  
  -- If account is locked, return null
  IF is_locked THEN
    RETURN NULL;
  END IF;
  
  -- Verify password
  SELECT id
  INTO admin_id
  FROM admin_users
  WHERE admin_users.username = verify_password.username
  AND admin_users.password_hash = crypt(verify_password.password, admin_users.password_hash);
  
  -- If password is incorrect, increment failed attempts
  IF admin_id IS NULL THEN
    UPDATE admin_users
    SET 
      failed_attempts = failed_attempts + 1,
      locked_until = CASE 
        WHEN failed_attempts + 1 >= 5 THEN now() + interval '30 minutes'
        ELSE locked_until
      END
    WHERE username = verify_password.username;
  ELSE
    -- Reset failed attempts on successful login
    UPDATE admin_users
    SET failed_attempts = 0, locked_until = NULL
    WHERE id = admin_id;
  END IF;
  
  RETURN admin_id;
END;
$$;

-- Function to create a new admin session
CREATE OR REPLACE FUNCTION create_admin_session(admin_id UUID, ip_address TEXT, user_agent TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_token TEXT;
  session_id UUID;
BEGIN
  -- Generate a secure random token
  session_token := encode(gen_random_bytes(32), 'hex');
  
  -- Insert new session
  INSERT INTO admin_sessions (
    admin_id,
    token,
    ip_address,
    user_agent,
    expires_at
  ) VALUES (
    admin_id,
    session_token,
    ip_address,
    user_agent,
    now() + interval '30 minutes'
  )
  RETURNING id INTO session_id;
  
  -- Update last login timestamp
  UPDATE admin_users
  SET last_login = now()
  WHERE id = admin_id;
  
  -- Log the login activity
  INSERT INTO admin_activity_logs (
    admin_id,
    action,
    details,
    ip_address,
    user_agent
  ) VALUES (
    admin_id,
    'login',
    jsonb_build_object('session_id', session_id),
    ip_address,
    user_agent
  );
  
  RETURN session_token;
END;
$$;

-- Function to validate and refresh a session
CREATE OR REPLACE FUNCTION validate_admin_session(session_token TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  admin_id UUID,
  username TEXT,
  role admin_role
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH session_check AS (
    SELECT 
      s.id,
      s.admin_id,
      s.expires_at > now() AS valid,
      a.username,
      a.role
    FROM admin_sessions s
    JOIN admin_users a ON s.admin_id = a.id
    WHERE s.token = session_token
    AND a.is_active = true
  ),
  session_update AS (
    UPDATE admin_sessions
    SET 
      last_activity = now(),
      expires_at = now() + interval '30 minutes'
    WHERE id = (SELECT id FROM session_check)
    AND (SELECT valid FROM session_check) = true
  )
  SELECT 
    sc.valid,
    sc.admin_id,
    sc.username,
    sc.role
  FROM session_check sc;
END;
$$;

-- Function to end an admin session (logout)
CREATE OR REPLACE FUNCTION end_admin_session(session_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_id UUID;
  session_id UUID;
BEGIN
  -- Get admin_id and session_id
  SELECT s.admin_id, s.id
  INTO admin_id, session_id
  FROM admin_sessions s
  WHERE s.token = session_token;
  
  -- Delete the session
  DELETE FROM admin_sessions
  WHERE token = session_token;
  
  -- Log the logout activity
  IF admin_id IS NOT NULL THEN
    INSERT INTO admin_activity_logs (
      admin_id,
      action,
      details
    ) VALUES (
      admin_id,
      'logout',
      jsonb_build_object('session_id', session_id)
    );
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Function to generate TOTP secret for 2FA
CREATE OR REPLACE FUNCTION generate_totp_secret(admin_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  totp_secret TEXT;
  backup_codes TEXT[];
BEGIN
  -- Generate a secure random secret
  totp_secret := encode(gen_random_bytes(20), 'base64');
  
  -- Generate backup codes
  FOR i IN 1..10 LOOP
    backup_codes := array_append(backup_codes, encode(gen_random_bytes(4), 'hex'));
  END LOOP;
  
  -- Insert or update 2FA record
  INSERT INTO admin_two_factor (
    admin_id,
    secret,
    backup_codes
  ) VALUES (
    admin_id,
    totp_secret,
    backup_codes
  )
  ON CONFLICT (admin_id) DO UPDATE
  SET 
    secret = EXCLUDED.secret,
    backup_codes = EXCLUDED.backup_codes,
    verified = false,
    updated_at = now();
  
  RETURN totp_secret;
END;
$$;

-- Function to verify TOTP code
CREATE OR REPLACE FUNCTION verify_totp_code(admin_id UUID, code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  -- In a real implementation, this would validate the TOTP code
  -- For this example, we'll just check if the code is '123456' for simplicity
  valid_code BOOLEAN;
BEGIN
  -- Simulate TOTP validation
  valid_code := (code = '123456');
  
  IF valid_code THEN
    -- Mark as verified if this is the first successful verification
    UPDATE admin_two_factor
    SET verified = true
    WHERE admin_id = verify_totp_code.admin_id
    AND verified = false;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Function to verify backup code
CREATE OR REPLACE FUNCTION verify_backup_code(admin_id UUID, code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  backup_codes TEXT[];
  new_backup_codes TEXT[];
BEGIN
  -- Get backup codes
  SELECT admin_two_factor.backup_codes
  INTO backup_codes
  FROM admin_two_factor
  WHERE admin_two_factor.admin_id = verify_backup_code.admin_id;
  
  -- Check if code exists in backup codes
  IF code = ANY(backup_codes) THEN
    -- Remove used code
    SELECT array_agg(bc)
    INTO new_backup_codes
    FROM unnest(backup_codes) bc
    WHERE bc != code;
    
    -- Update backup codes
    UPDATE admin_two_factor
    SET 
      backup_codes = new_backup_codes,
      verified = true
    WHERE admin_id = verify_backup_code.admin_id;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Function to log admin activity
CREATE OR REPLACE FUNCTION log_admin_activity(
  admin_id UUID,
  action TEXT,
  entity_type TEXT DEFAULT NULL,
  entity_id TEXT DEFAULT NULL,
  details JSONB DEFAULT NULL,
  ip_address TEXT DEFAULT NULL,
  user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO admin_activity_logs (
    admin_id,
    action,
    entity_type,
    entity_id,
    details,
    ip_address,
    user_agent
  ) VALUES (
    admin_id,
    action,
    entity_type,
    entity_id,
    details,
    ip_address,
    user_agent
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_admin_users_timestamp
BEFORE UPDATE ON admin_users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_admin_two_factor_timestamp
BEFORE UPDATE ON admin_two_factor
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Create a function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM admin_sessions
  WHERE expires_at < now()
  RETURNING count(*) INTO deleted_count;
  
  RETURN deleted_count;
END;
$$;

-- Create a function to get admin user details
CREATE OR REPLACE FUNCTION get_admin_user_details(admin_id UUID)
RETURNS TABLE (
  id UUID,
  username TEXT,
  email TEXT,
  role admin_role,
  is_active BOOLEAN,
  two_factor_enabled BOOLEAN,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.username,
    a.email,
    a.role,
    a.is_active,
    a.two_factor_enabled,
    a.last_login,
    a.created_at
  FROM admin_users a
  WHERE a.id = admin_id;
END;
$$;

-- Create a function to create a new admin user
CREATE OR REPLACE FUNCTION create_admin_user(
  username TEXT,
  email TEXT,
  password TEXT,
  role admin_role,
  created_by UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_admin_id UUID;
  creator_role admin_role;
BEGIN
  -- Check if creator has permission
  SELECT au.role INTO creator_role
  FROM admin_users au
  WHERE au.id = created_by;
  
  -- Only super_admin can create any admin
  -- Senior_admin can only create standard_admin
  IF creator_role = 'super_admin' OR (creator_role = 'senior_admin' AND role = 'standard_admin') THEN
    INSERT INTO admin_users (
      username,
      email,
      password_hash,
      role
    ) VALUES (
      username,
      email,
      hash_password(password),
      role
    )
    RETURNING id INTO new_admin_id;
    
    -- Log the activity
    PERFORM log_admin_activity(
      created_by,
      'create_admin',
      'admin_user',
      new_admin_id::TEXT,
      jsonb_build_object('username', username, 'role', role)
    );
    
    RETURN new_admin_id;
  ELSE
    RAISE EXCEPTION 'Insufficient permissions to create admin with role %', role;
  END IF;
END;
$$;

-- Insert initial super admin user (username: superadmin, password: SuperAdmin123!)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE username = 'superadmin') THEN
    INSERT INTO admin_users (
      username,
      email,
      password_hash,
      role
    ) VALUES (
      'superadmin',
      'superadmin@pinoywest.com',
      crypt('SuperAdmin123!', gen_salt('bf', 10)),
      'super_admin'
    );
  END IF;
END
$$;