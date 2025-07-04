import { supabase } from '../lib/supabase';

/**
 * Utility functions for working with the database backup system
 */

/**
 * Get the backup health status
 * @returns The backup health status or null if not available
 */
export const getBackupHealthStatus = async () => {
  if (!supabase) return null;
  
  try {
    const { data, error } = await supabase
      .from('backup_health_status')
      .select('*');
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching backup health status:', error);
    return null;
  }
};

/**
 * Get backup storage usage statistics
 * @returns Backup storage usage statistics or null if not available
 */
export const getBackupStorageUsage = async () => {
  if (!supabase) return null;
  
  try {
    const { data, error } = await supabase.rpc('get_backup_storage_usage');
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching backup storage usage:', error);
    return null;
  }
};

/**
 * Get tables that need backup
 * @returns List of tables that need backup or null if not available
 */
export const getTablesNeedingBackup = async () => {
  if (!supabase) return null;
  
  try {
    const { data, error } = await supabase.rpc('get_tables_needing_backup');
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching tables needing backup:', error);
    return null;
  }
};

/**
 * Initiate a manual backup
 * @param configurationId The ID of the backup configuration
 * @returns The backup log ID or null if failed
 */
export const initiateManualBackup = async (configurationId: string) => {
  if (!supabase) return null;
  
  try {
    const { data, error } = await supabase.rpc('initiate_backup', {
      p_configuration_id: configurationId,
      p_initiated_by: supabase.auth.getUser().then(({ data }) => data.user?.id)
    });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error initiating manual backup:', error);
    return null;
  }
};

/**
 * Get recent backup logs
 * @param limit Maximum number of logs to return
 * @returns Recent backup logs or null if not available
 */
export const getRecentBackupLogs = async (limit = 10) => {
  if (!supabase) return null;
  
  try {
    const { data, error } = await supabase
      .from('backup_logs')
      .select('*')
      .order('start_time', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching recent backup logs:', error);
    return null;
  }
};

/**
 * Generate a backup report for a date range
 * @param startDate Start date for the report
 * @param endDate End date for the report (defaults to now)
 * @returns Backup report or null if not available
 */
export const generateBackupReport = async (startDate: Date, endDate?: Date) => {
  if (!supabase) return null;
  
  try {
    const { data, error } = await supabase.rpc('generate_backup_report', {
      p_start_date: startDate.toISOString(),
      p_end_date: endDate ? endDate.toISOString() : new Date().toISOString()
    });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error generating backup report:', error);
    return null;
  }
};

/**
 * Format backup size for display
 * @param bytes Size in bytes
 * @returns Formatted size string
 */
export const formatBackupSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format backup duration for display
 * @param seconds Duration in seconds
 * @returns Formatted duration string
 */
export const formatBackupDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)} seconds`;
  } else if (seconds < 3600) {
    return `${Math.round(seconds / 60)} minutes`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
};

/**
 * Get backup health status color
 * @param status Health status
 * @returns CSS color class
 */
export const getBackupHealthStatusColor = (status: string): string => {
  switch (status) {
    case 'healthy':
      return 'text-green-600';
    case 'warning':
      return 'text-yellow-600';
    case 'error':
      return 'text-red-600';
    case 'inactive':
      return 'text-gray-600';
    default:
      return 'text-gray-600';
  }
};