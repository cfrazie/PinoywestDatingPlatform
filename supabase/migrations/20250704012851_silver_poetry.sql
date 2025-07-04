/*
  # Performance Optimization Indexes

  1. New Indexes
    - Add specialized indexes for frequently queried columns
    - Create composite indexes for common query patterns
    - Add partial indexes for filtered queries
    - Create GIN indexes for full-text search and JSONB fields
    - Add indexes for timestamp ranges and status filters

  2. Benefits
    - Faster message retrieval and chat operations
    - Improved search performance
    - Optimized payment and subscription queries
    - Better performance for cultural and compatibility features
    - Enhanced analytics and reporting capabilities
*/

-- User Activity and Engagement Indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_user_type_time ON user_activity(user_id, activity_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_engagement_dashboard_scores ON user_engagement_dashboard(engagement_score DESC, retention_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_engagement_active_days ON user_engagement_dashboard(active_days_last_30 DESC);

-- Messaging Performance Indexes
CREATE INDEX IF NOT EXISTS idx_messages_unread_by_chat ON messages(chat_id, recipient_id) WHERE status != 'read';
CREATE INDEX IF NOT EXISTS idx_messages_media ON messages(chat_id) WHERE message_type IN ('image', 'video', 'file');
CREATE INDEX IF NOT EXISTS idx_messages_voice ON messages(chat_id) WHERE message_type = 'voice';
CREATE INDEX IF NOT EXISTS idx_messages_search_content ON messages USING GIN (content gin_trgm_ops) WHERE message_type = 'text';
CREATE INDEX IF NOT EXISTS idx_chat_participants_recent_chats ON chat_participants(user_id, joined_at DESC) WHERE left_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_message_drafts_recent ON message_drafts(user_id, updated_at DESC);

-- Call System Performance Indexes
CREATE INDEX IF NOT EXISTS idx_call_records_recent_by_initiator ON call_records(initiator_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_call_records_recent_by_target ON call_records(target_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_call_records_missed ON call_records(target_id) WHERE status = 'missed';
CREATE INDEX IF NOT EXISTS idx_call_records_completed ON call_records(initiator_id, target_id) WHERE status = 'completed';
CREATE INDEX IF NOT EXISTS idx_scheduled_calls_today ON scheduled_calls(scheduled_by, participant_id) 
  WHERE scheduled_time::date = CURRENT_DATE AND status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_call_invites_active ON call_invites(to_user_id) 
  WHERE status = 'pending' AND expires_at > NOW();

-- Payment System Performance Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_expiring_soon ON subscriptions(customer_id, current_period_end) 
  WHERE current_period_end < NOW() + INTERVAL '7 days' AND status = 'active';
CREATE INDEX IF NOT EXISTS idx_invoices_unpaid ON invoices(customer_id) 
  WHERE status IN ('open', 'past_due') AND due_date < NOW() + INTERVAL '3 days';
CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON payment_methods(customer_id) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_payment_intents_processing ON payment_intents(customer_id) 
  WHERE status IN ('processing', 'requires_action');

-- Search and Matching Performance Indexes
CREATE INDEX IF NOT EXISTS idx_user_attributes_matching ON user_attributes(cultural_background, religion, has_children, wants_children);
CREATE INDEX IF NOT EXISTS idx_user_attributes_location ON user_attributes USING GIN ((cultural_values->'location_preferences') jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_user_interests_matching ON user_interests(user_id, category, interest);
CREATE INDEX IF NOT EXISTS idx_compatibility_scores_high_matches ON compatibility_scores(user_id, score DESC) WHERE score > 70;
CREATE INDEX IF NOT EXISTS idx_user_search_results_cache_fresh ON user_search_results_cache(user_id) 
  WHERE expires_at > NOW();

-- Cultural Features Performance Indexes
CREATE INDEX IF NOT EXISTS idx_cultural_holidays_upcoming_by_culture ON cultural_holidays(culture, date) 
  WHERE date >= CURRENT_DATE AND date <= CURRENT_DATE + INTERVAL '90 days';
CREATE INDEX IF NOT EXISTS idx_cultural_learning_modules_popular ON cultural_learning_modules(category, difficulty, lessons_count DESC);
CREATE INDEX IF NOT EXISTS idx_cultural_tips_helpful ON cultural_tips(category, helpful_count DESC);
CREATE INDEX IF NOT EXISTS idx_user_cultural_progress_incomplete ON user_cultural_progress(user_id) 
  WHERE completed = false AND progress > 0;
CREATE INDEX IF NOT EXISTS idx_cultural_conversation_starters_category ON cultural_conversation_starters(category, difficulty);

-- Verification System Performance Indexes
CREATE INDEX IF NOT EXISTS idx_verification_reports_pending_processing ON verification_reports(created_at ASC) 
  WHERE status IN ('pending', 'in_progress');
CREATE INDEX IF NOT EXISTS idx_verification_reports_recent_completed ON verification_reports(target_user_id, completed_at DESC) 
  WHERE status = 'completed';
CREATE INDEX IF NOT EXISTS idx_verification_evidence_confidence ON verification_evidence(report_id, confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_verification_statuses_verified_score ON verification_statuses(verification_score DESC) 
  WHERE status = 'verified';

-- Notification System Performance Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_unread_by_type ON notifications(user_id, notification_type_id) 
  WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_upcoming ON notifications(user_id, scheduled_for) 
  WHERE scheduled_for > NOW() AND scheduled_for < NOW() + INTERVAL '1 day';
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_pending_retry ON notification_deliveries(retry_at) 
  WHERE status = 'failed' AND retry_at IS NOT NULL AND retry_at < NOW();
CREATE INDEX IF NOT EXISTS idx_device_tokens_by_type ON device_tokens(user_id, device_type) WHERE is_active = true;

-- Admin System Performance Indexes
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_recent ON admin_activity_logs(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_failed ON admin_login_attempts(username, created_at DESC) 
  WHERE success = false;
CREATE INDEX IF NOT EXISTS idx_admin_sessions_active_by_admin ON admin_sessions(admin_id) 
  WHERE expires_at > NOW();

-- Analytics Performance Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_date_range ON analytics_events(created_at) 
  WHERE created_at > NOW() - INTERVAL '30 days';
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_event ON analytics_events(user_id, event_type) 
  WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contact_submissions_recent ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_recent ON newsletter_subscriptions(subscribed_at DESC) 
  WHERE active = true;

-- Composite Indexes for Common Join Patterns
CREATE INDEX IF NOT EXISTS idx_chat_message_user ON messages(chat_id, sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_participant_status ON call_participants(call_id, user_id, joined_at) 
  WHERE left_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_subscription_customer_status ON subscriptions(customer_id, status, current_period_end);
CREATE INDEX IF NOT EXISTS idx_verification_user_result ON verification_reports(target_user_id, verification_result, confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_notification_user_channel ON notification_deliveries(notification_id, channel_id, status);

-- Full Text Search Optimization
CREATE INDEX IF NOT EXISTS idx_messages_content_search ON messages USING GIN (to_tsvector('english', content)) 
  WHERE message_type = 'text';
CREATE INDEX IF NOT EXISTS idx_cultural_tips_content_search ON cultural_tips USING GIN (to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_cultural_profiles_search ON cultural_profiles USING GIN (to_tsvector('english', 
  coalesce(location_name, '') || ' ' || 
  coalesce(country, '') || ' ' || 
  coalesce(region, '')
));

-- JSONB Indexes for Complex Data
CREATE INDEX IF NOT EXISTS idx_messages_file_metadata ON messages USING GIN ((jsonb_build_object(
  'file_name', file_name,
  'file_size', file_size,
  'duration', duration
)) jsonb_path_ops) WHERE message_type IN ('file', 'image', 'video', 'voice');

CREATE INDEX IF NOT EXISTS idx_cultural_profiles_landmarks ON cultural_profiles USING GIN (landmarks jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_cultural_profiles_events ON cultural_profiles USING GIN (events jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_cultural_profiles_cuisine ON cultural_profiles USING GIN (cuisine jsonb_path_ops);

-- Specialized Indexes for Reporting and Analytics
CREATE INDEX IF NOT EXISTS idx_call_analytics_quality_metrics ON call_analytics(call_id, quality, average_bitrate);
CREATE INDEX IF NOT EXISTS idx_call_feedback_ratings ON call_feedback(call_id, overall_rating, quality_rating);
CREATE INDEX IF NOT EXISTS idx_user_engagement_metrics ON user_engagement_dashboard(user_id, engagement_score, retention_score);
CREATE INDEX IF NOT EXISTS idx_payment_analytics ON invoices(customer_id, status, amount_due) 
  WHERE created_at > NOW() - INTERVAL '365 days';

-- Timestamp Range Indexes
CREATE INDEX IF NOT EXISTS idx_messages_date_range ON messages(chat_id, created_at) 
  WHERE created_at > NOW() - INTERVAL '30 days';
CREATE INDEX IF NOT EXISTS idx_call_records_date_range ON call_records(initiator_id, target_id, start_time) 
  WHERE start_time > NOW() - INTERVAL '30 days';
CREATE INDEX IF NOT EXISTS idx_subscriptions_renewal_window ON subscriptions(current_period_end) 
  WHERE current_period_end BETWEEN NOW() AND NOW() + INTERVAL '30 days';
CREATE INDEX IF NOT EXISTS idx_scheduled_calls_upcoming_week ON scheduled_calls(scheduled_by, participant_id, scheduled_time) 
  WHERE scheduled_time BETWEEN NOW() AND NOW() + INTERVAL '7 days';