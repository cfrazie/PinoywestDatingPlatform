/*
  # Create error logs table for comprehensive error tracking

  1. New Tables
    - `error_logs`
      - `id` (uuid, primary key)
      - `error_code` (text) - Error type/code
      - `error_message` (text) - Technical error message
      - `user_message` (text) - User-friendly error message
      - `severity` (text) - Error severity level
      - `context` (jsonb) - Additional context and metadata
      - `user_id` (uuid, nullable) - User who encountered the error
      - `session_id` (text, nullable) - Session identifier
      - `stack_trace` (text, nullable) - Error stack trace
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `error_logs` table
    - Add policies for error logging and admin access

  3. Indexes
    - Index on error_code for filtering
    - Index on severity for priority queries
    - Index on created_at for time-based queries
    - Index on user_id for user-specific error tracking
*/

-- Create error logs table
CREATE TABLE IF NOT EXISTS error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  error_code text NOT NULL,
  error_message text NOT NULL,
  user_message text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  context jsonb DEFAULT '{}',
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  stack_trace text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_error_logs_error_code ON error_logs(error_code);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_session_id ON error_logs(session_id);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_error_logs_severity_created_at ON error_logs(severity, created_at DESC);

-- RLS Policies

-- Allow anonymous users to insert error logs (for client-side error reporting)
CREATE POLICY "Allow anonymous error logging" ON error_logs
  FOR INSERT TO anon WITH CHECK (true);

-- Allow authenticated users to insert error logs
CREATE POLICY "Allow authenticated error logging" ON error_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- Allow users to read their own error logs
CREATE POLICY "Users can read own error logs" ON error_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Allow admins to read all error logs
CREATE POLICY "Admins can read all error logs" ON error_logs
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() 
      AND is_active = true
    )
  );

-- Create function to clean up old error logs
CREATE OR REPLACE FUNCTION cleanup_old_error_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete error logs older than 90 days, but keep critical errors for 1 year
  DELETE FROM error_logs 
  WHERE created_at < now() - interval '90 days'
  AND severity != 'critical';
  
  -- Delete critical errors older than 1 year
  DELETE FROM error_logs 
  WHERE created_at < now() - interval '1 year'
  AND severity = 'critical';
END;
$$;

-- Create function to get error statistics
CREATE OR REPLACE FUNCTION get_error_statistics(
  time_range interval DEFAULT interval '24 hours'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_errors', (
      SELECT count(*) 
      FROM error_logs 
      WHERE created_at > now() - time_range
    ),
    'by_severity', (
      SELECT jsonb_object_agg(severity, count)
      FROM (
        SELECT severity, count(*) as count
        FROM error_logs 
        WHERE created_at > now() - time_range
        GROUP BY severity
      ) t
    ),
    'by_error_code', (
      SELECT jsonb_object_agg(error_code, count)
      FROM (
        SELECT error_code, count(*) as count
        FROM error_logs 
        WHERE created_at > now() - time_range
        GROUP BY error_code
        ORDER BY count DESC
        LIMIT 10
      ) t
    ),
    'hourly_distribution', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'hour', hour,
          'count', count
        )
      )
      FROM (
        SELECT 
          extract(hour from created_at) as hour,
          count(*) as count
        FROM error_logs 
        WHERE created_at > now() - time_range
        GROUP BY extract(hour from created_at)
        ORDER BY hour
      ) t
    )
  ) INTO result;
  
  RETURN result;
END;
$$;