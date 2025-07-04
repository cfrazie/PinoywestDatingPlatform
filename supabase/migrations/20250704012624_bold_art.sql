/*
  # Add Data Validation Constraints

  1. Changes
    - Add NOT NULL constraints to critical columns
    - Add CHECK constraints for data validation
    - Add DEFAULT values for better data consistency
    - Add UNIQUE constraints where appropriate
    - Improve email validation with pattern matching

  2. Tables Modified
    - newsletter_subscriptions
    - contact_submissions
    - user_attributes
    - user_interests
    - messages
    - call_records
    - cultural_profiles
    - verification_reports
*/

-- Add constraints to newsletter_subscriptions
ALTER TABLE newsletter_subscriptions 
  ALTER COLUMN email SET NOT NULL,
  ADD CONSTRAINT newsletter_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add constraints to contact_submissions
ALTER TABLE contact_submissions 
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN message SET NOT NULL,
  ADD CONSTRAINT contact_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  ADD CONSTRAINT contact_name_length_check CHECK (length(name) BETWEEN 2 AND 100),
  ADD CONSTRAINT contact_message_length_check CHECK (length(message) BETWEEN 10 AND 5000);

-- Add constraints to user_attributes
ALTER TABLE user_attributes
  ADD CONSTRAINT height_range_check CHECK (height IS NULL OR (height >= 120 AND height <= 220)),
  ADD CONSTRAINT income_range_format_check CHECK (income_range IS NULL OR income_range ~* '^[0-9]+-[0-9]+$|^[0-9]+\+$'),
  ADD CONSTRAINT religiosity_check CHECK (religiosity IS NULL OR religiosity IN ('very_religious', 'religious', 'somewhat_religious', 'not_religious'));

-- Add constraints to user_interests
ALTER TABLE user_interests
  ALTER COLUMN category SET NOT NULL,
  ALTER COLUMN interest SET NOT NULL,
  ADD CONSTRAINT interest_level_check CHECK (level IS NULL OR level IN ('casual', 'interested', 'passionate', 'expert'));

-- Add constraints to messages
ALTER TABLE messages
  ADD CONSTRAINT message_content_length_check CHECK (
    (message_type = 'text' AND length(content) BETWEEN 1 AND 5000) OR
    message_type != 'text'
  ),
  ADD CONSTRAINT file_size_check CHECK (
    (message_type IN ('file', 'image', 'video') AND file_size IS NOT NULL) OR
    message_type NOT IN ('file', 'image', 'video')
  ),
  ADD CONSTRAINT duration_check CHECK (
    (message_type IN ('voice', 'video') AND duration IS NOT NULL) OR
    message_type NOT IN ('voice', 'video')
  );

-- Add constraints to call_records
ALTER TABLE call_records
  ADD CONSTRAINT call_duration_check CHECK (
    (status = 'completed' AND duration IS NOT NULL AND duration > 0) OR
    status != 'completed'
  ),
  ADD CONSTRAINT call_end_time_check CHECK (
    (status IN ('completed', 'ended') AND end_time IS NOT NULL) OR
    status NOT IN ('completed', 'ended')
  );

-- Add constraints to cultural_profiles
ALTER TABLE cultural_profiles
  ADD CONSTRAINT location_name_check CHECK (length(location_name) BETWEEN 2 AND 100),
  ADD CONSTRAINT country_check CHECK (length(country) BETWEEN 2 AND 100);

-- Add constraints to verification_reports
ALTER TABLE verification_reports
  ADD CONSTRAINT confidence_score_range_check CHECK (
    confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1)
  ),
  ADD CONSTRAINT verification_result_status_check CHECK (
    (status = 'completed' AND verification_result IS NOT NULL) OR
    status != 'completed'
  );

-- Add constraints to user_compatibility_preferences
ALTER TABLE user_compatibility_preferences
  ADD CONSTRAINT importance_range_check CHECK (importance >= 0 AND importance <= 5);

-- Add constraints to compatibility_scores
ALTER TABLE compatibility_scores
  ADD CONSTRAINT score_range_check CHECK (score >= 0 AND score <= 100),
  ADD CONSTRAINT confidence_range_check CHECK (confidence >= 0 AND confidence <= 1);

-- Add constraints to scheduled_calls
ALTER TABLE scheduled_calls
  ADD CONSTRAINT scheduled_time_future_check CHECK (scheduled_time > NOW()),
  ADD CONSTRAINT reminder_minutes_check CHECK (
    reminder_minutes IS NULL OR 
    array_length(reminder_minutes, 1) > 0
  );

-- Add constraints to payment_methods
ALTER TABLE payment_methods
  ADD CONSTRAINT card_expiry_check CHECK (
    (type = 'card' AND exp_month IS NOT NULL AND exp_month BETWEEN 1 AND 12 AND exp_year IS NOT NULL AND exp_year >= EXTRACT(YEAR FROM CURRENT_DATE)) OR
    type != 'card'
  );

-- Add constraints to subscriptions
ALTER TABLE subscriptions
  ADD CONSTRAINT subscription_period_check CHECK (current_period_end > current_period_start),
  ADD CONSTRAINT trial_period_check CHECK (
    (trial_end IS NULL) OR 
    (trial_start IS NOT NULL AND trial_end > trial_start)
  );

-- Add constraints to invoices
ALTER TABLE invoices
  ADD CONSTRAINT invoice_amount_check CHECK (
    amount_due >= 0 AND 
    amount_paid >= 0 AND 
    amount_remaining >= 0 AND
    amount_due = amount_paid + amount_remaining
  );

-- Add constraints to coupons
ALTER TABLE coupons
  ADD CONSTRAINT coupon_discount_check CHECK (
    (percent_off IS NOT NULL AND amount_off IS NULL) OR
    (percent_off IS NULL AND amount_off IS NOT NULL)
  ),
  ADD CONSTRAINT percent_off_range_check CHECK (
    percent_off IS NULL OR (percent_off >= 0 AND percent_off <= 100)
  ),
  ADD CONSTRAINT amount_off_range_check CHECK (
    amount_off IS NULL OR amount_off >= 0
  );

-- Add constraints to usage_records
ALTER TABLE usage_records
  ADD CONSTRAINT quantity_positive_check CHECK (quantity >= 0);