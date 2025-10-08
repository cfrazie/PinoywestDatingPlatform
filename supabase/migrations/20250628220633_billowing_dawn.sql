-- 0) Prereqs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Admin spine (recommended over hard-coded emails)
-- Minimal profile table to drive admin checks.
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text NOT NULL,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Keep email in sync for convenience (optional)
CREATE OR REPLACE FUNCTION public.set_profile_email()
RETURNS trigger AS $$
BEGIN
  NEW.email := coalesce(NEW.email, (select email from auth.users where id = NEW.user_id));
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_set_email
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_profile_email();

-- 2) Core tables (yours, with tweaks)

-- CONTACT SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','responded')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- optional: normalized column for efficient search
  email_norm text GENERATED ALWAYS AS (lower(email)) STORED
);

-- NEWSLETTER SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  email_norm text GENERATED ALWAYS AS (lower(email)) STORED,
  active boolean NOT NULL DEFAULT true,
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at timestamptz,
  source text NOT NULL DEFAULT 'website'
);
-- Enforce uniqueness on normalized email
CREATE UNIQUE INDEX IF NOT EXISTS ux_newsletter_email_norm
  ON public.newsletter_subscriptions (email_norm);

-- ANALYTICS EVENTS
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  event_data jsonb,
  user_id uuid,             -- set automatically for authenticated users
  user_agent text,
  ip_address text,          -- consider hashing/redacting if you have privacy constraints
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3) RLS ON
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4) RLS POLICIES

-- PROFILES: user can view/update themselves; admins can view all
DROP POLICY IF EXISTS prof_self_rw ON public.profiles;
CREATE POLICY prof_self_rw ON public.profiles
  FOR SELECT USING (auth.uid() = user_id)
  , FOR UPDATE USING (auth.uid() = user_id)
  , FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS prof_admin_read_all ON public.profiles;
CREATE POLICY prof_admin_read_all ON public.profiles
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.is_admin));

-- CONTACT_SUBMISSIONS
-- Anyone (anon) can submit
DROP POLICY IF EXISTS contact_public_insert ON public.contact_submissions;
CREATE POLICY contact_public_insert ON public.contact_submissions
  FOR INSERT TO anon WITH CHECK (true);

-- Authenticated users can read their own by matching email
DROP POLICY IF EXISTS contact_user_read_own ON public.contact_submissions;
CREATE POLICY contact_user_read_own ON public.contact_submissions
  FOR SELECT TO authenticated
  USING (auth.email() = email);

-- Admins can read/update all
DROP POLICY IF EXISTS contact_admin_read_all ON public.contact_submissions;
CREATE POLICY contact_admin_read_all ON public.contact_submissions
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.is_admin));

DROP POLICY IF EXISTS contact_admin_update_all ON public.contact_submissions;
CREATE POLICY contact_admin_update_all ON public.contact_submissions
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.is_admin))
  WITH CHECK (true);

-- Optional: prevent non-admin deletes
DROP POLICY IF EXISTS contact_admin_delete_all ON public.contact_submissions;
CREATE POLICY contact_admin_delete_all ON public.contact_submissions
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.is_admin));

-- NEWSLETTER_SUBSCRIPTIONS
-- Anyone can subscribe
DROP POLICY IF EXISTS newsletter_public_insert ON public.newsletter_subscriptions;
CREATE POLICY newsletter_public_insert ON public.newsletter_subscriptions
  FOR INSERT TO anon WITH CHECK (true);

-- A logged-in user can view/modify their own subscription (match on normalized email)
DROP POLICY IF EXISTS newsletter_user_select_own ON public.newsletter_subscriptions;
CREATE POLICY newsletter_user_select_own ON public.newsletter_subscriptions
  FOR SELECT TO authenticated
  USING (email_norm = lower(auth.email()));

DROP POLICY IF EXISTS newsletter_user_update_own ON public.newsletter_subscriptions;
CREATE POLICY newsletter_user_update_own ON public.newsletter_subscriptions
  FOR UPDATE TO authenticated
  USING (email_norm = lower(auth.email()))
  WITH CHECK (email_norm = lower(auth.email()));

-- Admins can read/update all
DROP POLICY IF EXISTS newsletter_admin_read_all ON public.newsletter_subscriptions;
CREATE POLICY newsletter_admin_read_all ON public.newsletter_subscriptions
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.is_admin));

DROP POLICY IF EXISTS newsletter_admin_update_all ON public.newsletter_subscriptions;
CREATE POLICY newsletter_admin_update_all ON public.newsletter_subscriptions
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.is_admin))
  WITH CHECK (true);

-- ANALYTICS_EVENTS
-- Keep public insert (honeypot-friendly, but you accept junk)
DROP POLICY IF EXISTS analytics_public_insert ON public.analytics_events;
CREATE POLICY analytics_public_insert ON public.analytics_events
  FOR INSERT TO anon WITH CHECK (true);

-- Also allow authenticated inserts, but force user_id := auth.uid() via trigger (below)
DROP POLICY IF EXISTS analytics_auth_insert ON public.analytics_events;
CREATE POLICY analytics_auth_insert ON public.analytics_events
  FOR INSERT TO authenticated WITH CHECK (true);

-- Admins can read all events
DROP POLICY IF EXISTS analytics_admin_read_all ON public.analytics_events;
CREATE POLICY analytics_admin_read_all ON public.analytics_events
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.is_admin));

-- 5) Email sanity (simple format check, optional)
CREATE OR REPLACE FUNCTION public.valid_email(email text)
RETURNS boolean AS $$
  SELECT email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$';
$$ LANGUAGE sql IMMUTABLE;

ALTER TABLE public.contact_submissions
  ADD CONSTRAINT contact_email_format CHECK (public.valid_email(email));

ALTER TABLE public.newsletter_subscriptions
  ADD CONSTRAINT newsletter_email_format CHECK (public.valid_email(email));

-- 6) Updated_at triggers (on both tables)
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_contact_touch ON public.contact_submissions;
CREATE TRIGGER trg_contact_touch
BEFORE UPDATE ON public.contact_submissions
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.newsletter_subscriptions
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS trg_newsletter_touch ON public.newsletter_subscriptions;
CREATE TRIGGER trg_newsletter_touch
BEFORE UPDATE ON public.newsletter_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 7) Analytics hardening: prevent spoofed user_id for authenticated clients
CREATE OR REPLACE FUNCTION public.analytics_set_user_id()
RETURNS trigger AS $$
BEGIN
  IF current_setting('request.jwt.claims', true) IS NOT NULL THEN
    -- if authenticated, force user_id = auth.uid()
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_analytics_force_uid ON public.analytics_events;
CREATE TRIGGER trg_analytics_force_uid
BEFORE INSERT ON public.analytics_events
FOR EACH ROW EXECUTE FUNCTION public.analytics_set_user_id();

-- 8) Indexes
CREATE INDEX IF NOT EXISTS idx_contact_created_at ON public.contact_submissions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_status ON public.contact_submissions (status);
CREATE INDEX IF NOT EXISTS idx_contact_email_norm ON public.contact_submissions (email_norm);

CREATE INDEX IF NOT EXISTS idx_newsletter_active ON public.newsletter_subscriptions (active);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed_at ON public.newsletter_subscriptions (subscribed_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics_events (event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON public.analytics_events (session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON public.analytics_events (user_id);
