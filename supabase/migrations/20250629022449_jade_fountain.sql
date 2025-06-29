-- Create RLS policy for notification_logs to allow service_role access
CREATE POLICY "Service role can manage all notification logs" 
ON notification_logs 
FOR ALL 
TO service_role
USING (true);

-- Create RLS policy for users to view their own notification logs
CREATE POLICY "Users can view their own notification logs" 
ON notification_logs 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM notification_deliveries nd
    JOIN notifications n ON nd.notification_id = n.id
    WHERE nd.id = notification_logs.delivery_id
    AND n.user_id = auth.uid()
  )
);