/*
  # Notification System Schema

  1. New Tables
    - `notification_templates` - Stores reusable notification templates
    - `notification_types` - Defines different notification categories
    - `user_notification_preferences` - Stores user preferences for notifications
    - `notifications` - Stores all notification records
    - `notification_deliveries` - Tracks delivery status for each notification channel
    - `notification_channels` - Defines available notification channels (email, push, etc.)
    - `device_tokens` - Stores user device tokens for push notifications

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    - Ensure users can only access their own notification data
*/

-- Create notification_channels table
CREATE TABLE IF NOT EXISTS notification_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  config JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create notification_types table
CREATE TABLE IF NOT EXISTS notification_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL,
  priority INTEGER DEFAULT 1,
  default_channels UUID[] NOT NULL,
  throttle_rate INTEGER DEFAULT 0, -- 0 means no throttling
  throttle_time_window INTEGER DEFAULT 0, -- in seconds
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_default_channels CHECK (
    (SELECT COUNT(*) FROM notification_channels WHERE id = ANY(default_channels)) = array_length(default_channels, 1)
  )
);

-- Create notification_templates table
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type_id UUID NOT NULL REFERENCES notification_types(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES notification_channels(id) ON DELETE CASCADE,
  subject_template TEXT,
  body_template TEXT NOT NULL,
  html_template TEXT,
  template_variables JSONB,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(notification_type_id, channel_id, version)
);

-- Create user_notification_preferences table
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type_id UUID NOT NULL REFERENCES notification_types(id) ON DELETE CASCADE,
  channels UUID[] NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, notification_type_id),
  CONSTRAINT fk_channels CHECK (
    (SELECT COUNT(*) FROM notification_channels WHERE id = ANY(channels)) = array_length(channels, 1)
  )
);

-- Create device_tokens table
CREATE TABLE IF NOT EXISTS device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_token TEXT NOT NULL,
  device_type TEXT NOT NULL,
  device_name TEXT,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, device_token)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type_id UUID NOT NULL REFERENCES notification_types(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create notification_deliveries table
CREATE TABLE IF NOT EXISTS notification_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES notification_channels(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'delivered', 'failed', 'throttled')),
  external_id TEXT,
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  error_message TEXT,
  retry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(notification_id, channel_id)
);

-- Create notification_logs table for detailed logging
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID REFERENCES notification_deliveries(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_notification_type TEXT,
  p_data JSONB DEFAULT NULL,
  p_scheduled_for TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_type_id UUID;
  v_notification_id UUID;
  v_title TEXT;
  v_body TEXT;
  v_channels UUID[];
  v_user_preferences RECORD;
  v_template RECORD;
  v_delivery_id UUID;
  v_expires_at TIMESTAMPTZ;
  v_throttle_count INTEGER;
BEGIN
  -- Get notification type ID
  SELECT id, default_channels, throttle_rate, throttle_time_window
  INTO v_notification_type_id, v_channels, v_throttle_rate, v_throttle_time_window
  FROM notification_types
  WHERE name = p_notification_type AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Notification type % not found or not active', p_notification_type;
  END IF;
  
  -- Check if user has preferences for this notification type
  SELECT *
  INTO v_user_preferences
  FROM user_notification_preferences
  WHERE user_id = p_user_id AND notification_type_id = v_notification_type_id;
  
  -- If user has preferences and notifications are disabled, exit early
  IF FOUND AND NOT v_user_preferences.is_enabled THEN
    RETURN NULL;
  END IF;
  
  -- If user has preferences, use their channel preferences
  IF FOUND THEN
    v_channels := v_user_preferences.channels;
  END IF;
  
  -- Check throttling if configured
  IF v_throttle_rate > 0 AND v_throttle_time_window > 0 THEN
    SELECT COUNT(*)
    INTO v_throttle_count
    FROM notifications
    WHERE user_id = p_user_id
    AND notification_type_id = v_notification_type_id
    AND created_at > now() - (v_throttle_time_window || ' seconds')::interval;
    
    IF v_throttle_count >= v_throttle_rate THEN
      -- Throttled, don't create notification
      RETURN NULL;
    END IF;
  END IF;
  
  -- Get template for first channel (for in-app notification)
  SELECT subject_template, body_template
  INTO v_template
  FROM notification_templates
  WHERE notification_type_id = v_notification_type_id
  AND channel_id = v_channels[1]
  AND is_active = true
  ORDER BY version DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active template found for notification type % and channel %', p_notification_type, v_channels[1];
  END IF;
  
  -- Set title and body (in a real implementation, this would process template variables)
  v_title := COALESCE(v_template.subject_template, 'Notification');
  v_body := v_template.body_template;
  
  -- Set expiration if needed (default 30 days)
  v_expires_at := COALESCE(p_scheduled_for, now()) + interval '30 days';
  
  -- Create notification
  INSERT INTO notifications (
    user_id,
    notification_type_id,
    title,
    body,
    data,
    scheduled_for,
    expires_at
  ) VALUES (
    p_user_id,
    v_notification_type_id,
    v_title,
    v_body,
    p_data,
    p_scheduled_for,
    v_expires_at
  )
  RETURNING id INTO v_notification_id;
  
  -- Create delivery records for each channel
  FOREACH v_channel_id IN ARRAY v_channels
  LOOP
    INSERT INTO notification_deliveries (
      notification_id,
      channel_id,
      status
    ) VALUES (
      v_notification_id,
      v_channel_id,
      CASE
        WHEN p_scheduled_for IS NULL OR p_scheduled_for <= now() THEN 'pending'
        ELSE 'scheduled'
      END
    )
    RETURNING id INTO v_delivery_id;
    
    -- Log creation
    INSERT INTO notification_logs (
      delivery_id,
      event_type,
      details
    ) VALUES (
      v_delivery_id,
      'created',
      jsonb_build_object('user_id', p_user_id, 'notification_type', p_notification_type)
    );
  END LOOP;
  
  RETURN v_notification_id;
END;
$$;

-- Create function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_as_read(
  p_notification_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated BOOLEAN;
BEGIN
  UPDATE notifications
  SET is_read = true, read_at = now(), updated_at = now()
  WHERE id = p_notification_id AND user_id = p_user_id AND is_read = false;
  
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  
  RETURN v_updated > 0;
END;
$$;

-- Create function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_as_read(
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notifications
  SET is_read = true, read_at = now(), updated_at = now()
  WHERE user_id = p_user_id AND is_read = false;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  RETURN v_count;
END;
$$;

-- Create function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM notifications
  WHERE user_id = p_user_id
  AND is_read = false
  AND (scheduled_for IS NULL OR scheduled_for <= now())
  AND (expires_at IS NULL OR expires_at > now());
  
  RETURN v_count;
END;
$$;

-- Create function to update notification preferences
CREATE OR REPLACE FUNCTION update_notification_preferences(
  p_user_id UUID,
  p_notification_type TEXT,
  p_is_enabled BOOLEAN,
  p_channels TEXT[]
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_type_id UUID;
  v_channel_ids UUID[];
  v_channel_id UUID;
  v_channel_name TEXT;
BEGIN
  -- Get notification type ID
  SELECT id
  INTO v_notification_type_id
  FROM notification_types
  WHERE name = p_notification_type;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Notification type % not found', p_notification_type;
  END IF;
  
  -- Convert channel names to IDs
  v_channel_ids := ARRAY[]::UUID[];
  
  FOREACH v_channel_name IN ARRAY p_channels
  LOOP
    SELECT id
    INTO v_channel_id
    FROM notification_channels
    WHERE name = v_channel_name;
    
    IF FOUND THEN
      v_channel_ids := array_append(v_channel_ids, v_channel_id);
    END IF;
  END LOOP;
  
  -- Update or insert preferences
  INSERT INTO user_notification_preferences (
    user_id,
    notification_type_id,
    channels,
    is_enabled
  ) VALUES (
    p_user_id,
    v_notification_type_id,
    v_channel_ids,
    p_is_enabled
  )
  ON CONFLICT (user_id, notification_type_id)
  DO UPDATE SET
    channels = v_channel_ids,
    is_enabled = p_is_enabled,
    updated_at = now();
  
  RETURN true;
END;
$$;

-- Create function to register device token
CREATE OR REPLACE FUNCTION register_device_token(
  p_user_id UUID,
  p_device_token TEXT,
  p_device_type TEXT,
  p_device_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_device_id UUID;
BEGIN
  INSERT INTO device_tokens (
    user_id,
    device_token,
    device_type,
    device_name,
    is_active,
    last_used_at
  ) VALUES (
    p_user_id,
    p_device_token,
    p_device_type,
    p_device_name,
    true,
    now()
  )
  ON CONFLICT (user_id, device_token)
  DO UPDATE SET
    device_type = p_device_type,
    device_name = COALESCE(p_device_name, device_tokens.device_name),
    is_active = true,
    last_used_at = now(),
    updated_at = now()
  RETURNING id INTO v_device_id;
  
  RETURN v_device_id;
END;
$$;

-- Create function to unregister device token
CREATE OR REPLACE FUNCTION unregister_device_token(
  p_user_id UUID,
  p_device_token TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated BOOLEAN;
BEGIN
  UPDATE device_tokens
  SET is_active = false, updated_at = now()
  WHERE user_id = p_user_id AND device_token = p_device_token;
  
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  
  RETURN v_updated > 0;
END;
$$;

-- Insert default notification channels
INSERT INTO notification_channels (name, description, is_active, config)
VALUES
  ('email', 'Email notifications', true, '{"service": "sendgrid", "template_base_path": "emails/"}'),
  ('push', 'Push notifications', true, '{"service": "firebase", "ttl": 2592000}'),
  ('sms', 'SMS notifications', false, '{"service": "twilio"}'),
  ('in_app', 'In-app notifications', true, '{"max_age_days": 30}');

-- Insert default notification types
INSERT INTO notification_types (name, description, category, priority, default_channels, throttle_rate, throttle_time_window, is_active)
VALUES
  ('new_message', 'New message received', 'messages', 2, ARRAY(SELECT id FROM notification_channels WHERE name IN ('push', 'email', 'in_app')), 5, 60, true),
  ('new_match', 'New match found', 'matches', 2, ARRAY(SELECT id FROM notification_channels WHERE name IN ('push', 'email', 'in_app')), 0, 0, true),
  ('profile_view', 'Someone viewed your profile', 'profile', 1, ARRAY(SELECT id FROM notification_channels WHERE name IN ('push', 'in_app')), 10, 3600, true),
  ('profile_like', 'Someone liked your profile', 'profile', 2, ARRAY(SELECT id FROM notification_channels WHERE name IN ('push', 'email', 'in_app')), 5, 3600, true),
  ('verification_complete', 'Profile verification completed', 'verification', 3, ARRAY(SELECT id FROM notification_channels WHERE name IN ('push', 'email', 'in_app')), 0, 0, true),
  ('verification_request', 'Someone requested to verify your profile', 'verification', 2, ARRAY(SELECT id FROM notification_channels WHERE name IN ('push', 'email', 'in_app')), 3, 86400, true),
  ('account_update', 'Account information updated', 'account', 3, ARRAY(SELECT id FROM notification_channels WHERE name IN ('email', 'in_app')), 0, 0, true),
  ('password_reset', 'Password reset request', 'account', 4, ARRAY(SELECT id FROM notification_channels WHERE name IN ('email')), 3, 3600, true),
  ('subscription_expiring', 'Subscription about to expire', 'billing', 3, ARRAY(SELECT id FROM notification_channels WHERE name IN ('email', 'push', 'in_app')), 0, 0, true),
  ('payment_failed', 'Payment failed', 'billing', 4, ARRAY(SELECT id FROM notification_channels WHERE name IN ('email', 'push', 'in_app')), 0, 0, true),
  ('compatibility_update', 'Compatibility score updated', 'matches', 2, ARRAY(SELECT id FROM notification_channels WHERE name IN ('push', 'in_app')), 3, 86400, true),
  ('video_call_invitation', 'Video call invitation', 'calls', 4, ARRAY(SELECT id FROM notification_channels WHERE name IN ('push', 'in_app')), 0, 0, true),
  ('scheduled_call_reminder', 'Scheduled call reminder', 'calls', 3, ARRAY(SELECT id FROM notification_channels WHERE name IN ('push', 'email', 'in_app')), 0, 0, true),
  ('new_message_reaction', 'Someone reacted to your message', 'messages', 1, ARRAY(SELECT id FROM notification_channels WHERE name IN ('push', 'in_app')), 10, 3600, true),
  ('system_announcement', 'System announcement', 'system', 3, ARRAY(SELECT id FROM notification_channels WHERE name IN ('push', 'email', 'in_app')), 0, 0, true);

-- Insert default notification templates for email channel
DO $$
DECLARE
  v_email_channel_id UUID;
  v_push_channel_id UUID;
  v_in_app_channel_id UUID;
  v_notification_type_id UUID;
BEGIN
  -- Get channel IDs
  SELECT id INTO v_email_channel_id FROM notification_channels WHERE name = 'email';
  SELECT id INTO v_push_channel_id FROM notification_channels WHERE name = 'push';
  SELECT id INTO v_in_app_channel_id FROM notification_channels WHERE name = 'in_app';
  
  -- New message templates
  SELECT id INTO v_notification_type_id FROM notification_types WHERE name = 'new_message';
  
  INSERT INTO notification_templates (notification_type_id, channel_id, subject_template, body_template, html_template, template_variables)
  VALUES
    (v_notification_type_id, v_email_channel_id, 
     'New message from {{sender_name}}', 
     'You have received a new message from {{sender_name}}. Log in to view and reply.',
     '<h2>New Message</h2><p>You have received a new message from <strong>{{sender_name}}</strong>.</p><p><a href="{{message_url}}">Click here</a> to view and reply.</p>',
     '{"sender_name": "string", "message_url": "string", "message_preview": "string"}'
    ),
    (v_notification_type_id, v_push_channel_id, 
     NULL, 
     '{{sender_name}}: {{message_preview}}',
     NULL,
     '{"sender_name": "string", "message_preview": "string"}'
    ),
    (v_notification_type_id, v_in_app_channel_id, 
     'New message', 
     '{{sender_name}} sent you a message',
     NULL,
     '{"sender_name": "string", "message_preview": "string", "sender_avatar": "string"}'
    );
  
  -- New match templates
  SELECT id INTO v_notification_type_id FROM notification_types WHERE name = 'new_match';
  
  INSERT INTO notification_templates (notification_type_id, channel_id, subject_template, body_template, html_template, template_variables)
  VALUES
    (v_notification_type_id, v_email_channel_id, 
     'New match on PinoyWest!', 
     'Good news! You have a new match with {{match_name}}. Log in to start a conversation.',
     '<h2>New Match!</h2><p>Congratulations! You have matched with <strong>{{match_name}}</strong>.</p><p><a href="{{match_url}}">Click here</a> to view their profile and start a conversation.</p>',
     '{"match_name": "string", "match_url": "string", "match_avatar": "string", "compatibility_score": "number"}'
    ),
    (v_notification_type_id, v_push_channel_id, 
     NULL, 
     'You matched with {{match_name}}! {{compatibility_score}}% compatible',
     NULL,
     '{"match_name": "string", "match_avatar": "string", "compatibility_score": "number"}'
    ),
    (v_notification_type_id, v_in_app_channel_id, 
     'New match!', 
     'You matched with {{match_name}}',
     NULL,
     '{"match_name": "string", "match_avatar": "string", "compatibility_score": "number"}'
    );
  
  -- Verification complete templates
  SELECT id INTO v_notification_type_id FROM notification_types WHERE name = 'verification_complete';
  
  INSERT INTO notification_templates (notification_type_id, channel_id, subject_template, body_template, html_template, template_variables)
  VALUES
    (v_notification_type_id, v_email_channel_id, 
     'Your profile verification is complete', 
     'Your profile verification is complete. Result: {{verification_result}}. Log in to view the details.',
     '<h2>Verification Complete</h2><p>Your profile verification is complete.</p><p>Result: <strong>{{verification_result}}</strong></p><p><a href="{{verification_url}}">Click here</a> to view the details.</p>',
     '{"verification_result": "string", "verification_url": "string", "verification_score": "number"}'
    ),
    (v_notification_type_id, v_push_channel_id, 
     NULL, 
     'Profile verification complete: {{verification_result}}',
     NULL,
     '{"verification_result": "string", "verification_score": "number"}'
    ),
    (v_notification_type_id, v_in_app_channel_id, 
     'Verification complete', 
     'Your profile verification is {{verification_result}}',
     NULL,
     '{"verification_result": "string", "verification_score": "number"}'
    );
END $$;

-- Enable Row Level Security
ALTER TABLE notification_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Notification channels are readable by all authenticated users
CREATE POLICY "Notification channels are readable by authenticated users" 
ON notification_channels FOR SELECT 
TO authenticated 
USING (true);

-- Notification types are readable by all authenticated users
CREATE POLICY "Notification types are readable by authenticated users" 
ON notification_types FOR SELECT 
TO authenticated 
USING (true);

-- Notification templates are readable by all authenticated users
CREATE POLICY "Notification templates are readable by authenticated users" 
ON notification_templates FOR SELECT 
TO authenticated 
USING (true);

-- Users can manage their own notification preferences
CREATE POLICY "Users can manage their own notification preferences" 
ON user_notification_preferences FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can manage their own device tokens
CREATE POLICY "Users can manage their own device tokens" 
ON device_tokens FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" 
ON notifications FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Users can update their own notifications (for marking as read)
CREATE POLICY "Users can update their own notifications" 
ON notifications FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can view their own notification deliveries
CREATE POLICY "Users can view their own notification deliveries" 
ON notification_deliveries FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM notifications 
    WHERE notifications.id = notification_deliveries.notification_id 
    AND notifications.user_id = auth.uid()
  )
);

-- Only admins can manage notification channels, types, and templates
CREATE POLICY "Only admins can manage notification channels" 
ON notification_channels FOR ALL 
TO authenticated 
USING (
  auth.email() IN ('admin@pinoywest.com', 'support@pinoywest.com')
);

CREATE POLICY "Only admins can manage notification types" 
ON notification_types FOR ALL 
TO authenticated 
USING (
  auth.email() IN ('admin@pinoywest.com', 'support@pinoywest.com')
);

CREATE POLICY "Only admins can manage notification templates" 
ON notification_templates FOR ALL 
TO authenticated 
USING (
  auth.email() IN ('admin@pinoywest.com', 'support@pinoywest.com')
);

-- Create trigger function to update timestamps
CREATE OR REPLACE FUNCTION update_notification_timestamps()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for timestamp updates
CREATE TRIGGER update_notification_channels_timestamp
BEFORE UPDATE ON notification_channels
FOR EACH ROW
EXECUTE FUNCTION update_notification_timestamps();

CREATE TRIGGER update_notification_types_timestamp
BEFORE UPDATE ON notification_types
FOR EACH ROW
EXECUTE FUNCTION update_notification_timestamps();

CREATE TRIGGER update_notification_templates_timestamp
BEFORE UPDATE ON notification_templates
FOR EACH ROW
EXECUTE FUNCTION update_notification_timestamps();

CREATE TRIGGER update_user_notification_preferences_timestamp
BEFORE UPDATE ON user_notification_preferences
FOR EACH ROW
EXECUTE FUNCTION update_notification_timestamps();

CREATE TRIGGER update_device_tokens_timestamp
BEFORE UPDATE ON device_tokens
FOR EACH ROW
EXECUTE FUNCTION update_notification_timestamps();

CREATE TRIGGER update_notifications_timestamp
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION update_notification_timestamps();

CREATE TRIGGER update_notification_deliveries_timestamp
BEFORE UPDATE ON notification_deliveries
FOR EACH ROW
EXECUTE FUNCTION update_notification_timestamps();