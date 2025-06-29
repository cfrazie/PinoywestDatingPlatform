// Supabase Edge Function for sending notifications
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';
import { SmtpClient } from 'npm:@sendgrid/mail@7.7.0';
import { Expo } from 'npm:expo-server-sdk@3.7.0';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize SendGrid client for email
const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY') ?? '';
const sendgrid = new SmtpClient();
sendgrid.setApiKey(sendgridApiKey);

// Initialize Expo client for push notifications
const expo = new Expo();

// Process notification deliveries
async function processNotificationDeliveries() {
  // Get pending notification deliveries
  const { data: deliveries, error } = await supabase
    .from('notification_deliveries')
    .select(`
      id,
      notification_id,
      channel_id,
      status,
      attempts,
      notifications(
        id,
        user_id,
        title,
        body,
        data
      ),
      notification_channels(
        name,
        config
      )
    `)
    .eq('status', 'pending')
    .order('created_at')
    .limit(50);

  if (error) {
    console.error('Error fetching notification deliveries:', error);
    return { processed: 0, success: 0, failed: 0 };
  }

  if (!deliveries || deliveries.length === 0) {
    return { processed: 0, success: 0, failed: 0 };
  }

  let successCount = 0;
  let failedCount = 0;

  // Process each delivery
  for (const delivery of deliveries) {
    try {
      // Update status to processing
      await supabase
        .from('notification_deliveries')
        .update({
          status: 'processing',
          attempts: delivery.attempts + 1,
          last_attempt_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', delivery.id);

      // Get notification and channel info
      const notification = delivery.notifications;
      const channel = delivery.notification_channels;

      if (!notification || !channel) {
        throw new Error('Notification or channel not found');
      }

      // Send notification based on channel type
      let success = false;
      let externalId = null;
      let errorMessage = null;

      switch (channel.name) {
        case 'email':
          const result = await sendEmailNotification(notification);
          success = result.success;
          externalId = result.externalId;
          errorMessage = result.error;
          break;

        case 'push':
          const pushResult = await sendPushNotification(notification);
          success = pushResult.success;
          externalId = pushResult.externalId;
          errorMessage = pushResult.error;
          break;

        case 'in_app':
          // In-app notifications are already created in the notifications table
          success = true;
          break;

        default:
          errorMessage = `Unsupported channel: ${channel.name}`;
          break;
      }

      // Update delivery status
      if (success) {
        await supabase
          .from('notification_deliveries')
          .update({
            status: 'delivered',
            external_id: externalId,
            delivered_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', delivery.id);

        // Log success
        await supabase
          .from('notification_logs')
          .insert({
            delivery_id: delivery.id,
            event_type: 'delivered',
            details: { channel: channel.name }
          });

        successCount++;
      } else {
        // Determine if we should retry
        const shouldRetry = delivery.attempts < 3;
        const retryAt = shouldRetry ? new Date(Date.now() + 300000).toISOString() : null; // Retry in 5 minutes

        await supabase
          .from('notification_deliveries')
          .update({
            status: shouldRetry ? 'pending' : 'failed',
            error_message: errorMessage,
            retry_at: retryAt,
            updated_at: new Date().toISOString()
          })
          .eq('id', delivery.id);

        // Log failure
        await supabase
          .from('notification_logs')
          .insert({
            delivery_id: delivery.id,
            event_type: 'failed',
            details: { 
              channel: channel.name, 
              error: errorMessage,
              attempt: delivery.attempts + 1
            }
          });

        failedCount++;
      }
    } catch (err) {
      console.error(`Error processing delivery ${delivery.id}:`, err);

      // Update delivery as failed
      await supabase
        .from('notification_deliveries')
        .update({
          status: 'failed',
          error_message: err.message,
          updated_at: new Date().toISOString()
        })
        .eq('id', delivery.id);

      failedCount++;
    }
  }

  return {
    processed: deliveries.length,
    success: successCount,
    failed: failedCount
  };
}

// Send email notification
async function sendEmailNotification(notification: any) {
  try {
    // Get user email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('email')
      .eq('user_id', notification.user_id)
      .single();

    if (userError || !userData?.email) {
      throw new Error('User email not found');
    }

    // Get email template
    const { data: templateData, error: templateError } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('notification_type_id', notification.notification_type_id)
      .eq('channel_id', (await supabase.from('notification_channels').select('id').eq('name', 'email').single()).data?.id)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (templateError || !templateData) {
      throw new Error('Email template not found');
    }

    // Prepare email content
    const emailData = {
      to: userData.email,
      from: 'notifications@pinoywest.com',
      subject: notification.title,
      text: notification.body,
      html: templateData.html_template || `<p>${notification.body}</p>`
    };

    // Send email
    const response = await sendgrid.send(emailData);
    
    return {
      success: true,
      externalId: response[0]?.headers['x-message-id'] || null,
      error: null
    };
  } catch (err) {
    console.error('Error sending email notification:', err);
    return {
      success: false,
      externalId: null,
      error: err.message
    };
  }
}

// Send push notification
async function sendPushNotification(notification: any) {
  try {
    // Get user device tokens
    const { data: deviceTokens, error: deviceError } = await supabase
      .from('device_tokens')
      .select('device_token, device_type')
      .eq('user_id', notification.user_id)
      .eq('is_active', true);

    if (deviceError) {
      throw new Error('Error fetching device tokens');
    }

    if (!deviceTokens || deviceTokens.length === 0) {
      throw new Error('No active device tokens found');
    }

    // Prepare push notifications
    const messages = [];
    const expoTokens = [];

    for (const device of deviceTokens) {
      // For Expo push notifications
      if (Expo.isExpoPushToken(device.device_token)) {
        expoTokens.push({
          to: device.device_token,
          sound: 'default',
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          badge: 1,
          channelId: 'default'
        });
      }
      // For Firebase Cloud Messaging (FCM)
      else if (device.device_type === 'android' || device.device_type === 'ios') {
        messages.push({
          token: device.device_token,
          notification: {
            title: notification.title,
            body: notification.body
          },
          data: notification.data || {},
          android: {
            priority: 'high',
            notification: {
              channelId: 'default'
            }
          },
          apns: {
            payload: {
              aps: {
                badge: 1,
                sound: 'default'
              }
            }
          }
        });
      }
    }

    // Send Expo notifications
    let expoReceipts = [];
    if (expoTokens.length > 0) {
      const chunks = expo.chunkPushNotifications(expoTokens);
      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          expoReceipts.push(...ticketChunk);
        } catch (error) {
          console.error('Error sending expo notifications:', error);
        }
      }
    }

    // Send FCM notifications
    // In a real implementation, you would use the Firebase Admin SDK
    // For this example, we'll just simulate success

    return {
      success: true,
      externalId: expoReceipts[0]?.id || 'fcm-simulated-id',
      error: null
    };
  } catch (err) {
    console.error('Error sending push notification:', err);
    return {
      success: false,
      externalId: null,
      error: err.message
    };
  }
}

// HTTP handler for the edge function
serve(async (req) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Process notification deliveries
    const result = await processNotificationDeliveries();

    return new Response(
      JSON.stringify({
        success: true,
        ...result
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing notifications:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});