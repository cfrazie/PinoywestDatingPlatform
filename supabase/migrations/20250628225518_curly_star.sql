/*
  # Update database schema to match requirements

  1. Schema Changes
    - Update contact_submissions table structure
    - Update newsletter_subscriptions table structure  
    - Update analytics_events table structure
    - Change primary keys from UUID to bigint with identity
    - Update foreign key relationships

  2. Security
    - Maintain RLS policies
    - Update indexes for performance
    - Add proper constraints
*/

-- Drop existing tables if they exist (be careful in production)
DROP TABLE IF EXISTS public.analytics_events CASCADE;
DROP TABLE IF EXISTS public.newsletter_subscriptions CASCADE;
DROP TABLE IF EXISTS public.contact_submissions CASCADE;

-- Create contact_submissions table with bigint primary key
CREATE TABLE public.contact_submissions (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name text NOT NULL,
    email text NOT NULL,
    message text NOT NULL,
    submitted_at timestamp with time zone DEFAULT now()
);

-- Create newsletter_subscriptions table with bigint primary key
CREATE TABLE public.newsletter_subscriptions (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    email text NOT NULL,
    subscribed_at timestamp with time zone DEFAULT now()
);

-- Create analytics_events table with bigint primary key and foreign key
CREATE TABLE public.analytics_events (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id bigint NOT NULL,
    event_type text NOT NULL,
    event_data jsonb,
    event_time timestamp with time zone DEFAULT now(),
    FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Create indexes for foreign key and performance
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_contact_submissions_submitted_at ON public.contact_submissions(submitted_at DESC);
CREATE INDEX idx_contact_submissions_email ON public.contact_submissions(email);
CREATE INDEX idx_newsletter_subscriptions_subscribed_at ON public.newsletter_subscriptions(subscribed_at DESC);
CREATE INDEX idx_newsletter_subscriptions_email ON public.newsletter_subscriptions(email);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_event_time ON public.analytics_events(event_time DESC);

-- Enable Row Level Security
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public contact submissions" ON public.contact_submissions
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow public newsletter subscriptions" ON public.newsletter_subscriptions
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow public analytics events" ON public.analytics_events
  FOR INSERT TO anon WITH CHECK (true);

-- Create policies for authenticated users to read their own data
CREATE POLICY "Users can read own contact submissions" ON public.contact_submissions
  FOR SELECT TO authenticated USING (auth.email() = email);

CREATE POLICY "Users can read own newsletter subscription" ON public.newsletter_subscriptions
  FOR SELECT TO authenticated USING (auth.email() = email);

CREATE POLICY "Users can read own analytics events" ON public.analytics_events
  FOR SELECT TO authenticated USING (auth.uid()::bigint = user_id);

-- Admin policies for management
CREATE POLICY "Admins can read all contact submissions" ON public.contact_submissions
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN ('admin@pinoywest.com', 'support@pinoywest.com', 'christopher@pinoywest.com')
    )
  );

CREATE POLICY "Admins can update contact submissions" ON public.contact_submissions
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN ('admin@pinoywest.com', 'support@pinoywest.com', 'christopher@pinoywest.com')
    )
  )