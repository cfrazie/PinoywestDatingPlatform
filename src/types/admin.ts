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