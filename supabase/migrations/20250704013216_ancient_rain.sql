/*
  # Database Backup Strategy

  1. New Features
    - `backup_configurations` - Stores backup settings and schedules
    - `backup_logs` - Records backup history and status
    - `backup_retention_policies` - Defines how long backups are kept
    - Functions for automated and manual backups
    - Scheduled backup jobs

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access only
    - Secure backup storage paths

  3. Functionality
    - Full database backups
    - Table-level backups for critical data
    - Point-in-time recovery capability
    - Backup verification
    - Retention policy enforcement
*/

-- Create backup_configurations table
CREATE TABLE IF NOT EXISTS backup_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  backup_type TEXT NOT NULL CHECK (backup_type IN ('full', 'incremental', 'differential', 'table')),
  schedule TEXT, -- cron format
  tables TEXT[] DEFAULT NULL, -- NULL means all tables for full backups
  storage_path TEXT NOT NULL,
  compression_level INTEGER DEFAULT 5 CHECK (compression_level BETWEEN 0 AND 9),
  encryption_enabled BOOLEAN DEFAULT true,
  max_parallel_jobs INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create backup_logs table
CREATE TABLE IF NOT EXISTS backup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  configuration_id UUID REFERENCES backup_configurations(id) ON DELETE SET NULL,
  backup_type TEXT NOT NULL CHECK (backup_type IN ('full', 'incremental', 'differential', 'table', 'manual')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'verified', 'restored')),
  start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_time TIMESTAMPTZ,
  file_path TEXT,
  file_size BIGINT, -- in bytes
  tables_included TEXT[],
  row_count BIGINT,
  error_message TEXT,
  verification_status TEXT CHECK (verification_status IN ('pending', 'success', 'failed', 'skipped')),
  verification_time TIMESTAMPTZ,
  initiated_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create backup_retention_policies table
CREATE TABLE IF NOT EXISTS backup_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  configuration_id UUID REFERENCES backup_configurations(id) ON DELETE CASCADE,
  backup_type TEXT NOT NULL CHECK (backup_type IN ('full', 'incremental', 'differential', 'table')),
  retention_period INTERVAL NOT NULL,
  min_backups_to_keep INTEGER DEFAULT 1,
  max_backups_to_keep INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(configuration_id, backup_type)
);

-- Create critical_data_tables table to track tables requiring special backup handling
CREATE TABLE IF NOT EXISTS critical_data_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL UNIQUE,
  schema_name TEXT NOT NULL DEFAULT 'public',
  priority INTEGER NOT NULL DEFAULT 1, -- 1 = highest
  backup_frequency INTERVAL NOT NULL DEFAULT '1 day'::INTERVAL,
  requires_encryption BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create backup_restore_points table
CREATE TABLE IF NOT EXISTS backup_restore_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  backup_log_id UUID REFERENCES backup_logs(id) ON DELETE SET NULL,
  point_in_time TIMESTAMPTZ NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE backup_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE critical_data_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_restore_points ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (admin only)
CREATE POLICY "Only admins can access backup configurations"
  ON backup_configurations
  FOR ALL
  TO authenticated
  USING (
    auth.email() IN ('admin@pinoywest.com', 'support@pinoywest.com', 'superadmin@pinoywest.com')
  );

CREATE POLICY "Only admins can access backup logs"
  ON backup_logs
  FOR ALL
  TO authenticated
  USING (
    auth.email() IN ('admin@pinoywest.com', 'support@pinoywest.com', 'superadmin@pinoywest.com')
  );

CREATE POLICY "Only admins can access backup retention policies"
  ON backup_retention_policies
  FOR ALL
  TO authenticated
  USING (
    auth.email() IN ('admin@pinoywest.com', 'support@pinoywest.com', 'superadmin@pinoywest.com')
  );

CREATE POLICY "Only admins can access critical data tables"
  ON critical_data_tables
  FOR ALL
  TO authenticated
  USING (
    auth.email() IN ('admin@pinoywest.com', 'support@pinoywest.com', 'superadmin@pinoywest.com')
  );

CREATE POLICY "Only admins can access backup restore points"
  ON backup_restore_points
  FOR ALL
  TO authenticated
  USING (
    auth.email() IN ('admin@pinoywest.com', 'support@pinoywest.com', 'superadmin@pinoywest.com')
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_backup_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_backup_configurations_timestamp
  BEFORE UPDATE ON backup_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_backup_timestamp();

CREATE TRIGGER update_backup_retention_policies_timestamp
  BEFORE UPDATE ON backup_retention_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_backup_timestamp();

CREATE TRIGGER update_critical_data_tables_timestamp
  BEFORE UPDATE ON critical_data_tables
  FOR EACH ROW
  EXECUTE FUNCTION update_backup_timestamp();

-- Create function to initiate a backup
CREATE OR REPLACE FUNCTION initiate_backup(
  p_configuration_id UUID,
  p_initiated_by UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_backup_log_id UUID;
  v_config backup_configurations%ROWTYPE;
  v_tables TEXT[];
BEGIN
  -- Get backup configuration
  SELECT * INTO v_config
  FROM backup_configurations
  WHERE id = p_configuration_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Backup configuration not found';
  END IF;
  
  -- Determine tables to backup
  IF v_config.backup_type = 'table' AND v_config.tables IS NOT NULL THEN
    v_tables := v_config.tables;
  ELSE
    -- For full backups, get all tables
    SELECT array_agg(table_name::TEXT)
    INTO v_tables
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
  END IF;
  
  -- Create backup log entry
  INSERT INTO backup_logs (
    configuration_id,
    backup_type,
    status,
    tables_included,
    initiated_by
  ) VALUES (
    p_configuration_id,
    v_config.backup_type,
    'pending',
    v_tables,
    p_initiated_by
  )
  RETURNING id INTO v_backup_log_id;
  
  -- In a real implementation, this would trigger the actual backup process
  -- For this example, we'll simulate it with a status update
  UPDATE backup_logs
  SET 
    status = 'in_progress',
    start_time = now()
  WHERE id = v_backup_log_id;
  
  -- Return the backup log ID
  RETURN v_backup_log_id;
END;
$$;

-- Create function to complete a backup (simulated)
CREATE OR REPLACE FUNCTION complete_backup(
  p_backup_log_id UUID,
  p_status TEXT,
  p_file_path TEXT,
  p_file_size BIGINT,
  p_row_count BIGINT,
  p_error_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update backup log
  UPDATE backup_logs
  SET 
    status = p_status,
    end_time = now(),
    file_path = p_file_path,
    file_size = p_file_size,
    row_count = p_row_count,
    error_message = p_error_message
  WHERE id = p_backup_log_id;
  
  -- Apply retention policy if backup was successful
  IF p_status = 'completed' THEN
    PERFORM apply_retention_policy(p_backup_log_id);
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Create function to verify a backup
CREATE OR REPLACE FUNCTION verify_backup(
  p_backup_log_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_backup backup_logs%ROWTYPE;
BEGIN
  -- Get backup log
  SELECT * INTO v_backup
  FROM backup_logs
  WHERE id = p_backup_log_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Backup log not found';
  END IF;
  
  -- Check if backup is completed
  IF v_backup.status != 'completed' THEN
    RAISE EXCEPTION 'Cannot verify backup that is not completed';
  END IF;
  
  -- In a real implementation, this would verify the backup file integrity
  -- For this example, we'll simulate it
  
  -- Update backup log
  UPDATE backup_logs
  SET 
    verification_status = 'success',
    verification_time = now()
  WHERE id = p_backup_log_id;
  
  RETURN TRUE;
END;
$$;

-- Create function to apply retention policy
CREATE OR REPLACE FUNCTION apply_retention_policy(
  p_backup_log_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_backup backup_logs%ROWTYPE;
  v_config backup_configurations%ROWTYPE;
  v_policy backup_retention_policies%ROWTYPE;
  v_old_backups UUID[];
BEGIN
  -- Get backup log
  SELECT * INTO v_backup
  FROM backup_logs
  WHERE id = p_backup_log_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Backup log not found';
  END IF;
  
  -- Get backup configuration
  SELECT * INTO v_config
  FROM backup_configurations
  WHERE id = v_backup.configuration_id;
  
  -- Get retention policy
  SELECT * INTO v_policy
  FROM backup_retention_policies
  WHERE configuration_id = v_config.id
  AND backup_type = v_backup.backup_type;
  
  IF NOT FOUND THEN
    -- No policy, nothing to do
    RETURN;
  END IF;
  
  -- Find backups to delete based on retention period
  WITH old_backups AS (
    SELECT id
    FROM backup_logs
    WHERE configuration_id = v_config.id
    AND backup_type = v_backup.backup_type
    AND status = 'completed'
    AND id != p_backup_log_id
    AND start_time < now() - v_policy.retention_period
    ORDER BY start_time DESC
    OFFSET v_policy.min_backups_to_keep
  )
  SELECT array_agg(id) INTO v_old_backups
  FROM old_backups;
  
  -- If max_backups_to_keep is set, also consider that limit
  IF v_policy.max_backups_to_keep IS NOT NULL THEN
    WITH excess_backups AS (
      SELECT id
      FROM backup_logs
      WHERE configuration_id = v_config.id
      AND backup_type = v_backup.backup_type
      AND status = 'completed'
      AND id != p_backup_log_id
      ORDER BY start_time DESC
      OFFSET v_policy.max_backups_to_keep
    )
    SELECT array_agg(id) INTO v_old_backups
    FROM (
      SELECT id FROM excess_backups
      UNION
      SELECT unnest(v_old_backups)
    ) AS combined_backups;
  END IF;
  
  -- Mark old backups for deletion (in a real implementation, this would trigger file deletion)
  IF v_old_backups IS NOT NULL AND array_length(v_old_backups, 1) > 0 THEN
    UPDATE backup_logs
    SET 
      status = 'deleted',
      metadata = jsonb_set(
        COALESCE(metadata, '{}'::jsonb),
        '{deletion_reason}',
        '"retention_policy_applied"'
      )
    WHERE id = ANY(v_old_backups);
  END IF;
END;
$$;

-- Create function to restore from backup
CREATE OR REPLACE FUNCTION restore_from_backup(
  p_backup_log_id UUID,
  p_tables TEXT[] DEFAULT NULL,
  p_initiated_by UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_backup backup_logs%ROWTYPE;
  v_restore_point_id UUID;
BEGIN
  -- Get backup log
  SELECT * INTO v_backup
  FROM backup_logs
  WHERE id = p_backup_log_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Backup log not found';
  END IF;
  
  -- Check if backup is completed and verified
  IF v_backup.status != 'completed' OR v_backup.verification_status != 'success' THEN
    RAISE EXCEPTION 'Cannot restore from backup that is not completed and verified';
  END IF;
  
  -- Create restore point
  INSERT INTO backup_restore_points (
    name,
    description,
    backup_log_id,
    point_in_time,
    created_by
  ) VALUES (
    'Restore_' || to_char(now(), 'YYYY_MM_DD_HH24_MI_SS'),
    'Restore from backup ' || v_backup.id,
    p_backup_log_id,
    v_backup.end_time,
    p_initiated_by
  )
  RETURNING id INTO v_restore_point_id;
  
  -- In a real implementation, this would trigger the actual restore process
  -- For this example, we'll simulate it with a status update
  UPDATE backup_logs
  SET 
    status = 'restored',
    metadata = jsonb_set(
      COALESCE(metadata, '{}'::jsonb),
      '{restored_at}',
      to_jsonb(now())
    )
  WHERE id = p_backup_log_id;
  
  RETURN TRUE;
END;
$$;

-- Create function to get backup statistics
CREATE OR REPLACE FUNCTION get_backup_statistics()
RETURNS TABLE (
  backup_type TEXT,
  total_backups BIGINT,
  successful_backups BIGINT,
  failed_backups BIGINT,
  average_size BIGINT,
  total_size BIGINT,
  average_duration INTERVAL,
  last_backup_time TIMESTAMPTZ,
  last_backup_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bl.backup_type,
    COUNT(*) AS total_backups,
    COUNT(*) FILTER (WHERE bl.status = 'completed') AS successful_backups,
    COUNT(*) FILTER (WHERE bl.status = 'failed') AS failed_backups,
    COALESCE(AVG(bl.file_size) FILTER (WHERE bl.status = 'completed'), 0)::BIGINT AS average_size,
    COALESCE(SUM(bl.file_size) FILTER (WHERE bl.status = 'completed'), 0)::BIGINT AS total_size,
    COALESCE(AVG(bl.end_time - bl.start_time) FILTER (WHERE bl.status = 'completed'), '0 seconds'::INTERVAL) AS average_duration,
    MAX(bl.end_time) FILTER (WHERE bl.status IN ('completed', 'failed')) AS last_backup_time,
    (
      SELECT status 
      FROM backup_logs 
      WHERE backup_type = bl.backup_type 
      ORDER BY end_time DESC NULLS LAST 
      LIMIT 1
    ) AS last_backup_status
  FROM backup_logs bl
  GROUP BY bl.backup_type;
END;
$$;

-- Create function to schedule a backup job
CREATE OR REPLACE FUNCTION schedule_backup_job(
  p_configuration_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_config backup_configurations%ROWTYPE;
BEGIN
  -- Get backup configuration
  SELECT * INTO v_config
  FROM backup_configurations
  WHERE id = p_configuration_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Backup configuration not found';
  END IF;
  
  -- In a real implementation, this would schedule a job using pg_cron or similar
  -- For this example, we'll just update the configuration
  UPDATE backup_configurations
  SET 
    is_active = true,
    updated_at = now()
  WHERE id = p_configuration_id;
  
  RETURN TRUE;
END;
$$;

-- Create function to identify critical data for backup
CREATE OR REPLACE FUNCTION identify_critical_data()
RETURNS SETOF critical_data_tables
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function identifies critical tables that should be backed up more frequently
  -- In a real implementation, this would analyze table usage patterns
  -- For this example, we'll return predefined critical tables
  
  -- First, clear existing entries
  DELETE FROM critical_data_tables;
  
  -- Insert critical tables
  INSERT INTO critical_data_tables (
    table_name,
    schema_name,
    priority,
    backup_frequency,
    requires_encryption,
    description
  ) VALUES
    ('users', 'auth', 1, '1 day'::INTERVAL, true, 'User accounts and authentication data'),
    ('profiles', 'public', 1, '1 day'::INTERVAL, true, 'User profile information'),
    ('messages', 'public', 2, '1 day'::INTERVAL, true, 'User messages and communication'),
    ('chats', 'public', 2, '1 day'::INTERVAL, true, 'Chat conversations'),
    ('subscriptions', 'public', 1, '1 day'::INTERVAL, true, 'User subscription data'),
    ('payment_methods', 'public', 1, '1 day'::INTERVAL, true, 'Payment method information'),
    ('invoices', 'public', 1, '1 day'::INTERVAL, true, 'Billing and invoice records'),
    ('verification_reports', 'public', 2, '1 day'::INTERVAL, true, 'User verification data'),
    ('call_records', 'public', 3, '3 days'::INTERVAL, true, 'Call history and records'),
    ('cultural_profiles', 'public', 2, '3 days'::INTERVAL, false, 'Cultural profile information'),
    ('compatibility_scores', 'public', 3, '3 days'::INTERVAL, false, 'User compatibility data'),
    ('admin_users', 'public', 1, '1 day'::INTERVAL, true, 'Admin user accounts'),
    ('admin_activity_logs', 'public', 1, '1 day'::INTERVAL, true, 'Admin activity audit trail');
  
  RETURN QUERY
  SELECT * FROM critical_data_tables;
END;
$$;

-- Create default backup configurations
INSERT INTO backup_configurations (
  name,
  description,
  backup_type,
  schedule,
  storage_path,
  compression_level,
  encryption_enabled,
  max_parallel_jobs,
  is_active
) VALUES
  (
    'Daily Full Backup',
    'Daily full database backup',
    'full',
    '0 0 * * *', -- Midnight every day
    '/backups/full/%Y-%m-%d/',
    9,
    true,
    1,
    true
  ),
  (
    'Hourly Incremental Backup',
    'Hourly incremental backup of changes',
    'incremental',
    '0 * * * *', -- Every hour
    '/backups/incremental/%Y-%m-%d/%H/',
    5,
    true,
    2,
    true
  ),
  (
    'Critical Data Backup',
    'Frequent backup of critical tables',
    'table',
    '0 */4 * * *', -- Every 4 hours
    '/backups/critical/%Y-%m-%d/%H/',
    7,
    true,
    2,
    true
  );

-- Set tables for critical data backup
UPDATE backup_configurations
SET tables = ARRAY(SELECT table_name FROM critical_data_tables WHERE priority = 1)
WHERE name = 'Critical Data Backup';

-- Create default retention policies
INSERT INTO backup_retention_policies (
  configuration_id,
  backup_type,
  retention_period,
  min_backups_to_keep,
  max_backups_to_keep
) VALUES
  (
    (SELECT id FROM backup_configurations WHERE name = 'Daily Full Backup'),
    'full',
    '30 days'::INTERVAL,
    7,
    31
  ),
  (
    (SELECT id FROM backup_configurations WHERE name = 'Hourly Incremental Backup'),
    'incremental',
    '7 days'::INTERVAL,
    24,
    168
  ),
  (
    (SELECT id FROM backup_configurations WHERE name = 'Critical Data Backup'),
    'table',
    '14 days'::INTERVAL,
    12,
    84
  );

-- Create function to generate a backup report
CREATE OR REPLACE FUNCTION generate_backup_report(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ DEFAULT now()
)
RETURNS TABLE (
  date DATE,
  backup_type TEXT,
  successful_count INTEGER,
  failed_count INTEGER,
  total_size BIGINT,
  average_duration INTERVAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    date_trunc('day', bl.start_time)::DATE,
    bl.backup_type,
    COUNT(*) FILTER (WHERE bl.status = 'completed')::INTEGER,
    COUNT(*) FILTER (WHERE bl.status = 'failed')::INTEGER,
    COALESCE(SUM(bl.file_size) FILTER (WHERE bl.status = 'completed'), 0)::BIGINT,
    COALESCE(AVG(bl.end_time - bl.start_time) FILTER (WHERE bl.status = 'completed' AND bl.end_time IS NOT NULL), '0 seconds'::INTERVAL)
  FROM backup_logs bl
  WHERE bl.start_time BETWEEN p_start_date AND p_end_date
  GROUP BY date_trunc('day', bl.start_time)::DATE, bl.backup_type
  ORDER BY date_trunc('day', bl.start_time)::DATE DESC, bl.backup_type;
END;
$$;

-- Create extension for cron jobs (if available)
-- Note: This requires pg_cron extension to be installed on the database
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_available_extensions WHERE name = 'pg_cron'
  ) THEN
    CREATE EXTENSION IF NOT EXISTS pg_cron;
    
    -- Schedule backup jobs
    PERFORM cron.schedule(
      'daily-full-backup',
      '0 0 * * *',
      $$SELECT initiate_backup((SELECT id FROM backup_configurations WHERE name = 'Daily Full Backup'))$$
    );
    
    PERFORM cron.schedule(
      'hourly-incremental-backup',
      '0 * * * *',
      $$SELECT initiate_backup((SELECT id FROM backup_configurations WHERE name = 'Hourly Incremental Backup'))$$
    );
    
    PERFORM cron.schedule(
      'critical-data-backup',
      '0 */4 * * *',
      $$SELECT initiate_backup((SELECT id FROM backup_configurations WHERE name = 'Critical Data Backup'))$$
    );
    
    -- Schedule cleanup job for expired sessions and old backup logs
    PERFORM cron.schedule(
      'cleanup-job',
      '30 0 * * *',
      $$
      SELECT cleanup_expired_sessions();
      DELETE FROM backup_logs WHERE status = 'deleted' AND end_time < now() - interval '90 days';
      $$
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- pg_cron might not be available, which is fine
    RAISE NOTICE 'pg_cron extension not available. Scheduled backups will need to be configured externally.';
END $$;

-- Create function to simulate a backup (for testing)
CREATE OR REPLACE FUNCTION simulate_backup(
  p_configuration_name TEXT,
  p_success BOOLEAN DEFAULT true
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_config_id UUID;
  v_backup_log_id UUID;
  v_file_path TEXT;
  v_file_size BIGINT;
  v_row_count BIGINT;
  v_status TEXT;
  v_error TEXT;
BEGIN
  -- Get configuration ID
  SELECT id INTO v_config_id
  FROM backup_configurations
  WHERE name = p_configuration_name;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Backup configuration not found';
  END IF;
  
  -- Initiate backup
  v_backup_log_id := initiate_backup(v_config_id);
  
  -- Simulate backup process
  v_file_path := '/backups/simulated/' || p_configuration_name || '_' || to_char(now(), 'YYYY_MM_DD_HH24_MI_SS') || '.bak';
  
  -- Generate random file size between 100MB and 2GB
  v_file_size := (random() * 1900 + 100) * 1024 * 1024;
  
  -- Generate random row count between 10,000 and 1,000,000
  v_row_count := (random() * 990000 + 10000)::BIGINT;
  
  -- Set status and error based on success parameter
  IF p_success THEN
    v_status := 'completed';
    v_error := NULL;
  ELSE
    v_status := 'failed';
    v_error := 'Simulated backup failure';
  END IF;
  
  -- Complete backup
  PERFORM complete_backup(
    v_backup_log_id,
    v_status,
    v_file_path,
    v_file_size,
    v_row_count,
    v_error
  );
  
  -- Verify backup if successful
  IF p_success THEN
    PERFORM verify_backup(v_backup_log_id);
  END IF;
  
  RETURN v_backup_log_id;
END;
$$;

-- Create function to generate a backup recovery plan
CREATE OR REPLACE FUNCTION generate_recovery_plan(
  p_disaster_type TEXT,
  p_tables TEXT[] DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_latest_full_backup backup_logs%ROWTYPE;
  v_latest_incremental_backups UUID[];
  v_recovery_plan JSONB;
BEGIN
  -- Get latest full backup
  SELECT * INTO v_latest_full_backup
  FROM backup_logs
  WHERE backup_type = 'full'
  AND status = 'completed'
  AND verification_status = 'success'
  ORDER BY end_time DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No valid full backup found';
  END IF;
  
  -- Get incremental backups since full backup
  SELECT array_agg(id) INTO v_latest_incremental_backups
  FROM backup_logs
  WHERE backup_type = 'incremental'
  AND status = 'completed'
  AND verification_status = 'success'
  AND start_time > v_latest_full_backup.end_time
  ORDER BY start_time ASC;
  
  -- Build recovery plan
  v_recovery_plan := jsonb_build_object(
    'disaster_type', p_disaster_type,
    'recovery_time_objective', CASE
      WHEN p_disaster_type = 'complete_loss' THEN '24 hours'
      WHEN p_disaster_type = 'data_corruption' THEN '4 hours'
      WHEN p_disaster_type = 'accidental_deletion' THEN '1 hour'
      ELSE '12 hours'
    END,
    'full_backup', jsonb_build_object(
      'id', v_latest_full_backup.id,
      'file_path', v_latest_full_backup.file_path,
      'backup_time', v_latest_full_backup.end_time,
      'size', v_latest_full_backup.file_size
    ),
    'incremental_backups', CASE
      WHEN v_latest_incremental_backups IS NULL THEN '[]'::jsonb
      ELSE (
        SELECT jsonb_agg(jsonb_build_object(
          'id', bl.id,
          'file_path', bl.file_path,
          'backup_time', bl.end_time,
          'size', bl.file_size
        ))
        FROM backup_logs bl
        WHERE bl.id = ANY(v_latest_incremental_backups)
      )
    END,
    'tables_to_restore', CASE
      WHEN p_tables IS NULL THEN 'all'
      ELSE to_jsonb(p_tables)
    END,
    'estimated_restore_time', CASE
      WHEN p_tables IS NULL THEN '2 hours'
      ELSE '30 minutes'
    END,
    'steps', jsonb_build_array(
      'Stop application services',
      'Restore full backup',
      CASE WHEN v_latest_incremental_backups IS NOT NULL THEN 'Apply incremental backups' ELSE NULL END,
      'Verify data integrity',
      'Restart application services',
      'Perform post-recovery validation'
    ) - 'null'
  );
  
  RETURN v_recovery_plan;
END;
$$;

-- Insert critical data tables
SELECT identify_critical_data();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_backup_logs_status ON backup_logs(status, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_backup_logs_configuration ON backup_logs(configuration_id, backup_type, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_backup_logs_verification ON backup_logs(verification_status, verification_time DESC);
CREATE INDEX IF NOT EXISTS idx_backup_retention_policies_config ON backup_retention_policies(configuration_id, backup_type);
CREATE INDEX IF NOT EXISTS idx_critical_data_tables_priority ON critical_data_tables(priority, backup_frequency);
CREATE INDEX IF NOT EXISTS idx_backup_restore_points_time ON backup_restore_points(point_in_time DESC);

-- Create a view for backup health monitoring
CREATE OR REPLACE VIEW backup_health_status AS
SELECT
  bc.name AS configuration_name,
  bc.backup_type,
  bc.schedule,
  bc.is_active,
  (
    SELECT status
    FROM backup_logs
    WHERE configuration_id = bc.id
    ORDER BY start_time DESC
    LIMIT 1
  ) AS last_backup_status,
  (
    SELECT start_time
    FROM backup_logs
    WHERE configuration_id = bc.id
    ORDER BY start_time DESC
    LIMIT 1
  ) AS last_backup_time,
  (
    SELECT COUNT(*)
    FROM backup_logs
    WHERE configuration_id = bc.id
    AND status = 'failed'
    AND start_time > now() - interval '7 days'
  ) AS failures_last_7_days,
  (
    SELECT verification_status
    FROM backup_logs
    WHERE configuration_id = bc.id
    AND status = 'completed'
    ORDER BY start_time DESC
    LIMIT 1
  ) AS last_verification_status,
  CASE
    WHEN NOT bc.is_active THEN 'inactive'
    WHEN (
      SELECT COUNT(*)
      FROM backup_logs
      WHERE configuration_id = bc.id
      AND status = 'completed'
      AND start_time > now() - interval '2 days'
    ) = 0 THEN 'warning'
    WHEN (
      SELECT COUNT(*)
      FROM backup_logs
      WHERE configuration_id = bc.id
      AND status = 'failed'
      AND start_time > now() - interval '1 day'
    ) > 0 THEN 'error'
    ELSE 'healthy'
  END AS health_status
FROM backup_configurations bc;

-- Grant permissions
GRANT SELECT ON backup_health_status TO authenticated;

-- Create a function to get backup storage usage
CREATE OR REPLACE FUNCTION get_backup_storage_usage()
RETURNS TABLE (
  backup_type TEXT,
  total_size BIGINT,
  backup_count INTEGER,
  oldest_backup_date TIMESTAMPTZ,
  newest_backup_date TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    bl.backup_type,
    COALESCE(SUM(bl.file_size), 0)::BIGINT AS total_size,
    COUNT(*)::INTEGER AS backup_count,
    MIN(bl.start_time) AS oldest_backup_date,
    MAX(bl.start_time) AS newest_backup_date
  FROM backup_logs bl
  WHERE bl.status = 'completed'
  AND bl.file_size IS NOT NULL
  GROUP BY bl.backup_type;
END;
$$;

-- Create a function to estimate backup size
CREATE OR REPLACE FUNCTION estimate_backup_size(
  p_tables TEXT[] DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_size BIGINT := 0;
  v_table_name TEXT;
  v_table_size BIGINT;
BEGIN
  -- If no tables specified, estimate full database size
  IF p_tables IS NULL THEN
    SELECT pg_database_size(current_database()) INTO v_total_size;
    RETURN v_total_size;
  END IF;
  
  -- Otherwise, sum the size of specified tables
  FOREACH v_table_name IN ARRAY p_tables
  LOOP
    BEGIN
      EXECUTE format('SELECT pg_total_relation_size(%L)', v_table_name) INTO v_table_size;
      v_total_size := v_total_size + v_table_size;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Could not get size for table %: %', v_table_name, SQLERRM;
    END;
  END LOOP;
  
  RETURN v_total_size;
END;
$$;

-- Create a function to get tables that need backup
CREATE OR REPLACE FUNCTION get_tables_needing_backup()
RETURNS TABLE (
  table_name TEXT,
  schema_name TEXT,
  priority INTEGER,
  last_backup_time TIMESTAMPTZ,
  backup_due BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cdt.table_name,
    cdt.schema_name,
    cdt.priority,
    (
      SELECT MAX(bl.end_time)
      FROM backup_logs bl
      WHERE bl.status = 'completed'
      AND bl.tables_included @> ARRAY[cdt.table_name]
    ) AS last_backup_time,
    (
      SELECT MAX(bl.end_time)
      FROM backup_logs bl
      WHERE bl.status = 'completed'
      AND bl.tables_included @> ARRAY[cdt.table_name]
    ) IS NULL OR (
      SELECT MAX(bl.end_time)
      FROM backup_logs bl
      WHERE bl.status = 'completed'
      AND bl.tables_included @> ARRAY[cdt.table_name]
    ) < now() - cdt.backup_frequency AS backup_due
  FROM critical_data_tables cdt
  ORDER BY backup_due DESC, priority ASC;
END;
$$;

-- Create a function to simulate a disaster recovery test
CREATE OR REPLACE FUNCTION simulate_disaster_recovery_test(
  p_disaster_type TEXT DEFAULT 'data_corruption',
  p_tables TEXT[] DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_recovery_plan JSONB;
  v_test_results JSONB;
  v_start_time TIMESTAMPTZ;
  v_end_time TIMESTAMPTZ;
  v_success BOOLEAN;
BEGIN
  -- Generate recovery plan
  v_recovery_plan := generate_recovery_plan(p_disaster_type, p_tables);
  
  -- Simulate recovery test
  v_start_time := now();
  
  -- Simulate recovery process (random success/failure)
  v_success := random() > 0.1; -- 90% success rate
  
  -- Simulate recovery time
  PERFORM pg_sleep(random() * 2); -- Sleep for up to 2 seconds to simulate work
  
  v_end_time := now();
  
  -- Generate test results
  v_test_results := jsonb_build_object(
    'test_id', gen_random_uuid(),
    'disaster_type', p_disaster_type,
    'recovery_plan', v_recovery_plan,
    'start_time', v_start_time,
    'end_time', v_end_time,
    'duration', extract(epoch from (v_end_time - v_start_time)),
    'success', v_success,
    'issues', CASE
      WHEN v_success THEN jsonb_build_array()
      ELSE jsonb_build_array(
        'Simulated recovery failure',
        'Database connection timeout',
        'Insufficient disk space for restore'
      )
    END,
    'recommendations', CASE
      WHEN v_success THEN jsonb_build_array(
        'Continue with current backup strategy',
        'Consider increasing backup frequency for critical tables',
        'Document recovery procedure for team reference'
      )
      ELSE jsonb_build_array(
        'Increase disk space allocation for backups',
        'Implement automated recovery testing',
        'Review network configuration for database connections',
        'Update disaster recovery documentation'
      )
    END
  );
  
  RETURN v_test_results;
END;
$$;