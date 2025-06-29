import { supabase } from '../lib/supabase';

/**
 * Service for managing notifications
 */
export const notificationService = {
  /**
   * Create a notification
   * @param userId User ID
   * @param notificationType Notification type
   * @param data Additional data for the notification
   * @param scheduledFor Optional scheduled time
   */
  async createNotification(
    userId: string,
    notificationType: string,
    data?: any,
    scheduledFor?: Date
  ): Promise<string | null> {
    if (!supabase) return null;
    
    try {
      const { data: result, error } = await supabase
        .rpc('create_notification', {
          p_user_id: userId,
          p_notification_type: notificationType,
          p_data: data || null,
          p_scheduled_for: scheduledFor ? scheduledFor.toISOString() : null
        });
      
      if (error) throw error;
      
      return result;
    } catch (err) {
      console.error('Error creating notification:', err);
      return null;
    }
  },
  
  /**
   * Mark a notification as read
   * @param notificationId Notification ID
   * @param userId User ID
   */
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    if (!supabase) return false;
    
    try {
      const { data, error } = await supabase
        .rpc('mark_notification_as_read', {
          p_notification_id: notificationId,
          p_user_id: userId
        });
      
      if (error) throw error;
      
      return !!data;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  },
  
  /**
   * Mark all notifications as read
   * @param userId User ID
   */
  async markAllAsRead(userId: string): Promise<number> {
    if (!supabase) return 0;
    
    try {
      const { data, error } = await supabase
        .rpc('mark_all_notifications_as_read', {
          p_user_id: userId
        });
      
      if (error) throw error;
      
      return data || 0;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return 0;
    }
  },
  
  /**
   * Get unread notification count
   * @param userId User ID
   */
  async getUnreadCount(userId: string): Promise<number> {
    if (!supabase) return 0;
    
    try {
      const { data, error } = await supabase
        .rpc('get_unread_notification_count', {
          p_user_id: userId
        });
      
      if (error) throw error;
      
      return data || 0;
    } catch (err) {
      console.error('Error getting unread notification count:', err);
      return 0;
    }
  },
  
  /**
   * Update notification preferences
   * @param userId User ID
   * @param notificationType Notification type
   * @param isEnabled Whether notifications are enabled
   * @param channels Notification channels
   */
  async updatePreferences(
    userId: string,
    notificationType: string,
    isEnabled: boolean,
    channels: string[]
  ): Promise<boolean> {
    if (!supabase) return false;
    
    try {
      const { data, error } = await supabase
        .rpc('update_notification_preferences', {
          p_user_id: userId,
          p_notification_type: notificationType,
          p_is_enabled: isEnabled,
          p_channels: channels
        });
      
      if (error) throw error;
      
      return !!data;
    } catch (err) {
      console.error('Error updating notification preferences:', err);
      return false;
    }
  },
  
  /**
   * Register a device token for push notifications
   * @param userId User ID
   * @param deviceToken Device token
   * @param deviceType Device type (ios, android, web)
   * @param deviceName Optional device name
   */
  async registerDeviceToken(
    userId: string,
    deviceToken: string,
    deviceType: string,
    deviceName?: string
  ): Promise<string | null> {
    if (!supabase) return null;
    
    try {
      const { data, error } = await supabase
        .rpc('register_device_token', {
          p_user_id: userId,
          p_device_token: deviceToken,
          p_device_type: deviceType,
          p_device_name: deviceName
        });
      
      if (error) throw error;
      
      return data;
    } catch (err) {
      console.error('Error registering device token:', err);
      return null;
    }
  },
  
  /**
   * Unregister a device token
   * @param userId User ID
   * @param deviceToken Device token
   */
  async unregisterDeviceToken(userId: string, deviceToken: string): Promise<boolean> {
    if (!supabase) return false;
    
    try {
      const { data, error } = await supabase
        .rpc('unregister_device_token', {
          p_user_id: userId,
          p_device_token: deviceToken
        });
      
      if (error) throw error;
      
      return !!data;
    } catch (err) {
      console.error('Error unregistering device token:', err);
      return false;
    }
  },
  
  /**
   * Trigger the notification processing
   * This would typically be called by a scheduled job
   */
  async triggerNotificationProcessing(): Promise<boolean> {
    if (!supabase) return false;
    
    try {
      // Call the edge function to process notifications
      const { data, error } = await supabase.functions.invoke('send-notification', {
        method: 'POST',
        body: {}
      });
      
      if (error) throw error;
      
      return data?.success || false;
    } catch (err) {
      console.error('Error triggering notification processing:', err);
      return false;
    }
  }
};