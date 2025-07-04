/*
  # Add Performance Indexes for Frequently Queried Columns

  1. New Indexes
    - Add composite indexes for common query patterns
    - Add partial indexes for filtered queries
    - Add GIN indexes for JSON/JSONB searches
    - Add indexes for timestamp range queries
    - Add indexes for status and type columns

  2. Benefits
    - Faster query execution
    - Reduced database load
    - Improved application performance
    - Better scalability for high traffic
*/

-- Messaging System Indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender_recipient ON messages(sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_type_status ON messages(message_type, status);
CREATE INDEX IF NOT EXISTS idx_messages_chat_type_created ON messages(chat_id, message_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(recipient_id, status) WHERE status != 'read';
CREATE INDEX IF NOT EXISTS idx_chat_participants_active_user ON chat_participants(user_id) WHERE left_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_chats_type_created ON chats(chat_type, created_at);
CREATE INDEX IF NOT EXISTS idx_chats_active ON chats(is_archived, is_pinned);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_emoji ON message_reactions(user_id, emoji);
CREATE INDEX IF NOT EXISTS idx_typing_status_recent ON typing_status(chat_id, updated_at DESC);

-- Video Call System Indexes
CREATE INDEX IF NOT EXISTS idx_call_records_user_type ON call_records(initiator_id, target_id, call_type);
CREATE INDEX IF NOT EXISTS idx_call_records_status_time ON call_records(status, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_call_records_recent_by_user ON call_records(initiator_id, target_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_scheduled_calls_upcoming ON scheduled_calls(scheduled_time) WHERE status = 'scheduled' AND scheduled_time > NOW();
CREATE INDEX IF NOT EXISTS idx_call_participants_active ON call_participants(call_id, user_id) WHERE left_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_call_invites_pending ON call_invites(to_user_id, status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_call_feedback_ratings ON call_feedback(overall_rating, quality_rating);

-- Payment System Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_renewal ON subscriptions(customer_id, current_period_end);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active_customer ON subscriptions(customer_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_payment_methods_customer_type ON payment_methods(customer_id, type);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_status ON invoices(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_date_range ON invoices(created_at, due_date);
CREATE INDEX IF NOT EXISTS idx_payment_intents_recent ON payment_intents(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(valid, redeem_by);
CREATE INDEX IF NOT EXISTS idx_usage_records_recent ON usage_records(subscription_id, timestamp DESC);

-- User Profile and Search Indexes
CREATE INDEX IF NOT EXISTS idx_user_attributes_search ON user_attributes(cultural_background, religion, has_children);
CREATE INDEX IF NOT EXISTS idx_user_attributes_height_range ON user_attributes(height);
CREATE INDEX IF NOT EXISTS idx_user_interests_category_level ON user_interests(category, level);
CREATE INDEX IF NOT EXISTS idx_user_search_preferences_recent ON user_search_preferences(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_saved_searches_recent ON user_saved_searches(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_compatibility_scores_high ON user_compatibility_scores(user_id, overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_search_history_recent ON user_search_history(user_id, executed_at DESC);

-- Cultural and Learning Indexes
CREATE INDEX IF NOT EXISTS idx_cultural_profiles_location ON cultural_profiles(location_name, country);
CREATE INDEX IF NOT EXISTS idx_cultural_holidays_upcoming ON cultural_holidays(date) WHERE date >= CURRENT_DATE;
CREATE INDEX IF NOT EXISTS idx_cultural_learning_modules_popular ON cultural_learning_modules(category, difficulty);
CREATE INDEX IF NOT EXISTS idx_user_cultural_progress_incomplete ON user_cultural_progress(user_id, module_id) WHERE completed = false;
CREATE INDEX IF NOT EXISTS idx_cultural_tips_popular ON cultural_tips(helpful_count DESC);
CREATE INDEX IF NOT EXISTS idx_user_quiz_results_recent ON user_quiz_results(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_time_zone_preferences_user ON time_zone_preferences(user_id, location);

-- Verification System Indexes
CREATE INDEX IF NOT EXISTS idx_verification_reports_pending ON verification_reports(status) WHERE status IN ('pending', 'in_progress');
CREATE INDEX IF NOT EXISTS idx_verification_reports_user_status ON verification_reports(target_user_id, status);
CREATE INDEX IF NOT EXISTS idx_verification_evidence_type ON verification_evidence(report_id, evidence_type);
CREATE INDEX IF NOT EXISTS idx_verification_evidence_red_flags ON verification_evidence(report_id) WHERE is_red_flag = true;
CREATE INDEX IF NOT EXISTS idx_verification_statuses_verified ON verification_statuses(status) WHERE status = 'verified';

-- Notification System Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_type_user ON notifications(user_id, notification_type_id);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON notifications(scheduled_for) WHERE scheduled_for > NOW();
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_pending ON notification_deliveries(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_device_tokens_active ON device_tokens(user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_enabled ON user_notification_preferences(user_id) WHERE is_enabled = true;

-- Admin System Indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role, is_active);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_active ON admin_sessions(admin_id) WHERE expires_at > NOW();
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_action ON admin_activity_logs(admin_id, action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_recent ON admin_login_attempts(username, created_at DESC);

-- Analytics and Engagement Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_time ON analytics_events(event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_time ON analytics_events(user_id, created_at) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_active ON newsletter_subscriptions(active, subscribed_at DESC);

-- JSON/JSONB Indexes for Advanced Searches
CREATE INDEX IF NOT EXISTS idx_user_attributes_cultural_values_gin ON user_attributes USING GIN (cultural_values jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_cultural_profiles_landmarks_gin ON cultural_profiles USING GIN (landmarks jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_cultural_profiles_events_gin ON cultural_profiles USING GIN (events jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_cultural_learning_modules_content_gin ON cultural_learning_modules USING GIN (content jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_compatibility_scores_factors_gin ON compatibility_scores USING GIN (factors jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_verification_evidence_data_gin ON verification_evidence USING GIN (evidence_data jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_notifications_data_gin ON notifications USING GIN (data jsonb_path_ops);

-- Full Text Search Indexes
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_messages_content_trgm ON messages USING GIN (content gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_cultural_tips_content_trgm ON cultural_tips USING GIN (content gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_cultural_profiles_traditions_trgm ON cultural_profiles USING GIN (to_tsvector('english', traditions::text));
CREATE INDEX IF NOT EXISTS idx_user_interests_interest_trgm ON user_interests USING GIN (interest gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_message_trgm ON contact_submissions USING GIN (message gin_trgm_ops);

-- Composite Indexes for Common Join Patterns
CREATE INDEX IF NOT EXISTS idx_messages_chat_sender_time ON messages(chat_id, sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_records_users_time ON call_records(initiator_id, target_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_compatibility_scores_users ON compatibility_scores(user_id, target_user_id);
CREATE INDEX IF NOT EXISTS idx_user_cultural_progress_module ON user_cultural_progress(user_id, module_id, progress);
CREATE INDEX IF NOT EXISTS idx_verification_reports_users ON verification_reports(user_id, target_user_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_price ON subscriptions(customer_id, price_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_subscription ON invoices(customer_id, subscription_id);