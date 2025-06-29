import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Notification {
  id: string;
  title: string;
  body: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  notificationType: string;
}

export interface NotificationPreference {
  notificationType: string;
  isEnabled: boolean;
  channels: string[];
}

export interface NotificationType {
  id: string;
  name: string;
  description: string;
  category: string;
  defaultChannels: string[];
}

export interface NotificationChannel {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface DeviceToken {
  id: string;
  deviceToken: string;
  deviceType: string;
  deviceName?: string;
  isActive: boolean;
  lastUsedAt: string;
}

export const useNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>([]);
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [deviceTokens, setDeviceTokens] = useState<DeviceToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    if (!supabase || !userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select(`
          id,
          title,
          body,
          data,
          is_read,
          created_at,
          read_at,
          notification_type_id,
          notification_types(name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (notificationsError) throw notificationsError;
      
      if (notificationsData) {
        setNotifications(notificationsData.map(notification => ({
          id: notification.id,
          title: notification.title,
          body: notification.body,
          data: notification.data,
          isRead: notification.is_read,
          createdAt: notification.created_at,
          readAt: notification.read_at,
          notificationType: notification.notification_types?.name || 'unknown'
        })));
      }
      
      // Get unread count
      const { data: countData, error: countError } = await supabase
        .rpc('get_unread_notification_count', {
          p_user_id: userId
        });
      
      if (countError) throw countError;
      
      setUnreadCount(countData || 0);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Load notification preferences
  const loadPreferences = useCallback(async () => {
    if (!supabase || !userId) return;
    
    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select(`
          id,
          is_enabled,
          channels,
          notification_type_id,
          notification_types(name)
        `)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      if (data) {
        // Get channel names
        const { data: channelsData, error: channelsError } = await supabase
          .from('notification_channels')
          .select('id, name');
        
        if (channelsError) throw channelsError;
        
        const channelMap = new Map();
        channelsData?.forEach(channel => {
          channelMap.set(channel.id, channel.name);
        });
        
        setPreferences(data.map(pref => ({
          notificationType: pref.notification_types?.name || 'unknown',
          isEnabled: pref.is_enabled,
          channels: pref.channels.map(channelId => channelMap.get(channelId) || 'unknown')
        })));
      }
    } catch (err) {
      console.error('Error loading notification preferences:', err);
    }
  }, [userId]);

  // Load notification types
  const loadNotificationTypes = useCallback(async () => {
    if (!supabase) return;
    
    try {
      const { data, error } = await supabase
        .from('notification_types')
        .select(`
          id,
          name,
          description,
          category,
          default_channels
        `)
        .eq('is_active', true)
        .order('category', { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        // Get channel names
        const { data: channelsData, error: channelsError } = await supabase
          .from('notification_channels')
          .select('id, name');
        
        if (channelsError) throw channelsError;
        
        const channelMap = new Map();
        channelsData?.forEach(channel => {
          channelMap.set(channel.id, channel.name);
        });
        
        setNotificationTypes(data.map(type => ({
          id: type.id,
          name: type.name,
          description: type.description,
          category: type.category,
          defaultChannels: type.default_channels.map(channelId => channelMap.get(channelId) || 'unknown')
        })));
      }
    } catch (err) {
      console.error('Error loading notification types:', err);
    }
  }, []);

  // Load notification channels
  const loadChannels = useCallback(async () => {
    if (!supabase) return;
    
    try {
      const { data, error } = await supabase
        .from('notification_channels')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      
      if (data) {
        setChannels(data.map(channel => ({
          id: channel.id,
          name: channel.name,
          description: channel.description,
          isActive: channel.is_active
        })));
      }
    } catch (err) {
      console.error('Error loading notification channels:', err);
    }
  }, []);

  // Load device tokens
  const loadDeviceTokens = useCallback(async () => {
    if (!supabase || !userId) return;
    
    try {
      const { data, error } = await supabase
        .from('device_tokens')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setDeviceTokens(data.map(token => ({
          id: token.id,
          deviceToken: token.device_token,
          deviceType: token.device_type,
          deviceName: token.device_name,
          isActive: token.is_active,
          lastUsedAt: token.last_used_at
        })));
      }
    } catch (err) {
      console.error('Error loading device tokens:', err);
    }
  }, [userId]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!supabase || !userId) return false;
    
    try {
      const { data, error } = await supabase
        .rpc('mark_notification_as_read', {
          p_notification_id: notificationId,
          p_user_id: userId
        });
      
      if (error) throw error;
      
      if (data) {
        // Update local state
        setNotifications(prev => prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        ));
        
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return data;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  }, [userId]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!supabase || !userId) return 0;
    
    try {
      const { data, error } = await supabase
        .rpc('mark_all_notifications_as_read', {
          p_user_id: userId
        });
      
      if (error) throw error;
      
      if (data) {
        // Update local state
        setNotifications(prev => prev.map(notification => ({
          ...notification,
          isRead: true,
          readAt: new Date().toISOString()
        })));
        
        setUnreadCount(0);
      }
      
      return data;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return 0;
    }
  }, [userId]);

  // Update notification preferences
  const updatePreference = useCallback(async (
    notificationType: string,
    isEnabled: boolean,
    channels: string[]
  ) => {
    if (!supabase || !userId) return false;
    
    try {
      const { data, error } = await supabase
        .rpc('update_notification_preferences', {
          p_user_id: userId,
          p_notification_type: notificationType,
          p_is_enabled: isEnabled,
          p_channels: channels
        });
      
      if (error) throw error;
      
      if (data) {
        // Update local state
        setPreferences(prev => {
          const existing = prev.findIndex(p => p.notificationType === notificationType);
          if (existing >= 0) {
            return [
              ...prev.slice(0, existing),
              { notificationType, isEnabled, channels },
              ...prev.slice(existing + 1)
            ];
          } else {
            return [...prev, { notificationType, isEnabled, channels }];
          }
        });
      }
      
      return data;
    } catch (err) {
      console.error('Error updating notification preferences:', err);
      return false;
    }
  }, [userId]);

  // Register device token for push notifications
  const registerDeviceToken = useCallback(async (
    deviceToken: string,
    deviceType: string,
    deviceName?: string
  ) => {
    if (!supabase || !userId) return null;
    
    try {
      const { data, error } = await supabase
        .rpc('register_device_token', {
          p_user_id: userId,
          p_device_token: deviceToken,
          p_device_type: deviceType,
          p_device_name: deviceName
        });
      
      if (error) throw error;
      
      // Refresh device tokens
      await loadDeviceTokens();
      
      return data;
    } catch (err) {
      console.error('Error registering device token:', err);
      return null;
    }
  }, [userId, loadDeviceTokens]);

  // Unregister device token
  const unregisterDeviceToken = useCallback(async (deviceToken: string) => {
    if (!supabase || !userId) return false;
    
    try {
      const { data, error } = await supabase
        .rpc('unregister_device_token', {
          p_user_id: userId,
          p_device_token: deviceToken
        });
      
      if (error) throw error;
      
      if (data) {
        // Update local state
        setDeviceTokens(prev => prev.map(token => 
          token.deviceToken === deviceToken 
            ? { ...token, isActive: false }
            : token
        ));
      }
      
      return data;
    } catch (err) {
      console.error('Error unregistering device token:', err);
      return false;
    }
  }, [userId]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!supabase || !userId) return;
    
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        // Get notification type
        supabase
          .from('notification_types')
          .select('name')
          .eq('id', payload.new.notification_type_id)
          .single()
          .then(({ data }) => {
            const newNotification: Notification = {
              id: payload.new.id,
              title: payload.new.title,
              body: payload.new.body,
              data: payload.new.data,
              isRead: payload.new.is_read,
              createdAt: payload.new.created_at,
              readAt: payload.new.read_at,
              notificationType: data?.name || 'unknown'
            };
            
            // Update notifications list
            setNotifications(prev => [newNotification, ...prev]);
            
            // Update unread count
            if (!newNotification.isRead) {
              setUnreadCount(prev => prev + 1);
            }
          });
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  // Load data on mount
  useEffect(() => {
    loadNotificationTypes();
    loadChannels();
    
    if (userId) {
      loadNotifications();
      loadPreferences();
      loadDeviceTokens();
    }
  }, [
    userId, 
    loadNotifications, 
    loadPreferences, 
    loadNotificationTypes, 
    loadChannels, 
    loadDeviceTokens
  ]);

  return {
    notifications,
    unreadCount,
    preferences,
    notificationTypes,
    channels,
    deviceTokens,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    updatePreference,
    registerDeviceToken,
    unregisterDeviceToken,
    refreshNotifications: loadNotifications
  };
};