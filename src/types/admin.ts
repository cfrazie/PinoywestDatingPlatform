export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  two_factor_enabled: boolean;
  last_login: string | null;
  failed_attempts: number;
  locked_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminSession {
  id: string;
  admin_id: string;
  token: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  expires_at: string;
  last_activity: string;
  admin?: {
    username: string;
    role: string;
  };
}

export interface AdminActivityLog {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  admin?: {
    username: string;
    role: string;
  };
}

export interface AdminLoginAttempt {
  id: string;
  username: string;
  ip_address: string;
  user_agent: string | null;
  success: boolean;
  created_at: string;
}

export interface AdminTwoFactor {
  id: string;
  admin_id: string;
  secret: string;
  backup_codes: string[];
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminSecuritySettings {
  session_timeout: number;
  max_login_attempts: number;
  lockout_duration: number;
  password_min_length: number;
  require_uppercase: boolean;
  require_numbers: boolean;
  require_special_chars: boolean;
  password_expiry_days: number;
}

export interface BackupConfiguration {
  id: string;
  name: string;
  description: string;
  backup_type: 'full' | 'incremental' | 'differential' | 'table';
  schedule: string;
  tables: string[] | null;
  storage_path: string;
  compression_level: number;
  encryption_enabled: boolean;
  max_parallel_jobs: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface BackupLog {
  id: string;
  configuration_id: string | null;
  backup_type: 'full' | 'incremental' | 'differential' | 'table' | 'manual';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'verified' | 'restored';
  start_time: string;
  end_time: string | null;
  file_path: string | null;
  file_size: number | null;
  tables_included: string[] | null;
  row_count: number | null;
  error_message: string | null;
  verification_status: 'pending' | 'success' | 'failed' | 'skipped' | null;
  verification_time: string | null;
  initiated_by: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface BackupRetentionPolicy {
  id: string;
  configuration_id: string;
  backup_type: 'full' | 'incremental' | 'differential' | 'table';
  retention_period: string;
  min_backups_to_keep: number;
  max_backups_to_keep: number | null;
  created_at: string;
  updated_at: string;
}

export interface CriticalDataTable {
  id: string;
  table_name: string;
  schema_name: string;
  priority: number;
  backup_frequency: string;
  requires_encryption: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface BackupRestorePoint {
  id: string;
  name: string;
  description: string | null;
  backup_log_id: string | null;
  point_in_time: string;
  is_verified: boolean;
  created_at: string;
  created_by: string | null;
}

export interface BackupHealthStatus {
  configuration_name: string;
  backup_type: string;
  schedule: string;
  is_active: boolean;
  last_backup_status: string | null;
  last_backup_time: string | null;
  failures_last_7_days: number;
  last_verification_status: string | null;
  health_status: 'healthy' | 'warning' | 'error' | 'inactive';
}

export interface BackupStorageUsage {
  backup_type: string;
  total_size: number;
  backup_count: number;
  oldest_backup_date: string;
  newest_backup_date: string;
}