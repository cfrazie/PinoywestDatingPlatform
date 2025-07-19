// Database helper utilities for safe SQL operations

import { supabase } from '../lib/supabase';

// Safe admin email check function
export const isAdminUser = async (userId?: string): Promise<boolean> => {
  if (!supabase) return false;
  
  try {
    const { data, error } = await supabase.rpc('check_admin_user', {
      user_id: userId || null
    });
    
    if (error) {
      console.error('Admin check error:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Admin check failed:', error);
    return false;
  }
};

// Safe email validation for admin operations
export const validateAdminEmail = (email: string): boolean => {
  const adminEmails = [
    'admin@pinoywest.com',
    'support@pinoywest.com',
    'christopher@pinoywest.com'
  ];
  
  return adminEmails.includes(email.toLowerCase());
};

// Create admin check function in database
export const createAdminCheckFunction = (): string => {
  return `
    CREATE OR REPLACE FUNCTION check_admin_user(user_id UUID DEFAULT NULL)
    RETURNS BOOLEAN AS $$
    DECLARE
      target_user_id UUID;
      user_email TEXT;
    BEGIN
      -- Use provided user_id or current user
      target_user_id := COALESCE(user_id, auth.uid());
      
      -- Return false if no user
      IF target_user_id IS NULL THEN
        RETURN FALSE;
      END IF;
      
      -- Get user email
      SELECT email INTO user_email
      FROM auth.users
      WHERE id = target_user_id;
      
      -- Check if email is in admin list
      RETURN user_email IN ('admin@pinoywest.com', 'support@pinoywest.com', 'christopher@pinoywest.com');
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;
};

// Create safe admin policy
export const createAdminPolicy = (tableName: string, policyName: string): string => {
  return `
    CREATE POLICY "${policyName}" ON ${tableName}
      FOR ALL TO authenticated
      USING (check_admin_user());
  `;
};

// Batch email operations with proper error handling
export const batchEmailOperation = async (
  emails: string[],
  operation: (email: string) => Promise<any>
): Promise<Array<{ email: string; success: boolean; error?: string }>> => {
  const results = [];
  
  for (const email of emails) {
    try {
      await operation(email);
      results.push({ email, success: true });
    } catch (error) {
      results.push({ 
        email, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  return results;
};

// Safe query builder for email-based operations
export class SafeQueryBuilder {
  private query: string = '';
  private params: any[] = [];
  
  select(columns: string): this {
    this.query += `SELECT ${columns} `;
    return this;
  }
  
  from(table: string): this {
    this.query += `FROM ${table} `;
    return this;
  }
  
  whereEmailIn(emails: string[]): this {
    if (emails.length === 0) {
      throw new Error('Email list cannot be empty');
    }
    
    const placeholders = emails.map((_, index) => `$${this.params.length + index + 1}`).join(', ');
    this.query += `WHERE email IN (${placeholders}) `;
    this.params.push(...emails);
    return this;
  }
  
  build(): { query: string; params: any[] } {
    return {
      query: this.query.trim(),
      params: this.params
    };
  }
}

// Example usage:
// const { query, params } = new SafeQueryBuilder()
//   .select('*')
//   .from('users')
//   .whereEmailIn(['admin@pinoywest.com', 'support@pinoywest.com'])
//   .build();