/*
  # Initial Database Schema for PinoyWest Dating Platform

  1. New Tables
    - `contact_submissions` - Store contact form submissions
    - `newsletter_subscriptions` - Store newsletter email subscriptions  
    - `analytics_events` - Store user interaction analytics

  2. Security
    - Enable RLS on all tables
    - Add policies for public access to forms
    - Add policies for authenticated user data access

  3. Indexes
    - Add performance indexes for common queries
    - Add unique constraints where needed
*/

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create newsletter_subscriptions table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  source TEXT DEFAULT 'website'
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data JSONB,
  user_agent TEXT,
  ip_address TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (forms)
CREATE POLICY "Allow public contact submissions" ON contact_submissions
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow public newsletter subscriptions" ON newsletter_subscriptions
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow public analytics events" ON analytics_events
  FOR INSERT TO anon WITH CHECK (true);

-- Create policies for authenticated users to read their own data
CREATE POLICY "Users can read own contact submissions" ON contact_submissions
  FOR SELECT TO authenticated USING (auth.email() = email);

CREATE POLICY "Users can read own newsletter subscription" ON newsletter_subscriptions
  FOR SELECT TO authenticated USING (auth.email() = email);

-- Admin policies (for future admin dashboard)
CREATE POLICY "Admins can read all contact submissions" ON contact_submissions
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN ('admin@pinoywest.com', 'support@pinoywest.com')
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_active ON newsletter_subscriptions(active);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_subscribed_at ON newsletter_subscriptions(subscribed_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);

-- Create updated_at trigger for contact_submissions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contact_submissions_updated_at 
  BEFORE UPDATE ON contact_submissions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (optional)
-- INSERT INTO contact_submissions (name, email, subject, message) VALUES
--   ('Test User', 'test@example.com', 'Test Subject', 'This is a test message for development.');

-- INSERT INTO newsletter_subscriptions (email) VALUES
--   ('newsletter-test@example.com');