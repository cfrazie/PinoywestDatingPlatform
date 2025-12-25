-- Relationship Status System Migration
-- This migration creates the core tables for relationship management

-- 1. Relationship Statuses Table
CREATE TABLE IF NOT EXISTS public.relationship_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  partner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('single', 'talking', 'in_relationship', 'engaged', 'married', 'friends_only', 'recently_single')),
  status_display_name TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_by_partner BOOLEAN DEFAULT false,
  confirmed_at TIMESTAMPTZ,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Relationship History Table
CREATE TABLE IF NOT EXISTS public.relationship_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  partner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  ended_at TIMESTAMPTZ,
  ended_by UUID REFERENCES auth.users(id),
  end_reason TEXT,
  breakup_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Relationship Requests Table
CREATE TABLE IF NOT EXISTS public.relationship_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  to_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  requested_status TEXT NOT NULL CHECK (requested_status IN ('talking', 'in_relationship', 'engaged', 'married', 'friends_only')),
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  UNIQUE(from_user_id, to_user_id, requested_status)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_relationship_statuses_user_id ON public.relationship_statuses(user_id);
CREATE INDEX IF NOT EXISTS idx_relationship_statuses_partner_id ON public.relationship_statuses(partner_id);
CREATE INDEX IF NOT EXISTS idx_relationship_statuses_status ON public.relationship_statuses(status);
CREATE INDEX IF NOT EXISTS idx_relationship_history_user_id ON public.relationship_history(user_id);
CREATE INDEX IF NOT EXISTS idx_relationship_history_partner_id ON public.relationship_history(partner_id);
CREATE INDEX IF NOT EXISTS idx_relationship_requests_from_user ON public.relationship_requests(from_user_id);
CREATE INDEX IF NOT EXISTS idx_relationship_requests_to_user ON public.relationship_requests(to_user_id);
CREATE INDEX IF NOT EXISTS idx_relationship_requests_status ON public.relationship_requests(status);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.relationship_statuses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to auto-transition "Recently Single" to "Single" after 2 weeks
CREATE OR REPLACE FUNCTION public.auto_transition_recently_single()
RETURNS void AS $$
BEGIN
  UPDATE public.relationship_statuses
  SET 
    status = 'single',
    updated_at = NOW()
  WHERE 
    status = 'recently_single' 
    AND started_at <= NOW() - INTERVAL '14 days';
END;
$$ LANGUAGE plpgsql;

-- Function to log relationship changes to history
CREATE OR REPLACE FUNCTION public.log_relationship_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status != NEW.status) THEN
    INSERT INTO public.relationship_history (
      user_id,
      partner_id,
      previous_status,
      new_status,
      ended_at,
      ended_by,
      created_at
    ) VALUES (
      OLD.user_id,
      OLD.partner_id,
      OLD.status,
      NEW.status,
      CASE WHEN NEW.status IN ('single', 'recently_single') THEN NOW() ELSE NULL END,
      NEW.user_id,
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to log relationship changes
CREATE TRIGGER log_relationship_status_change
  AFTER UPDATE ON public.relationship_statuses
  FOR EACH ROW
  EXECUTE FUNCTION public.log_relationship_change();

-- Enable Row Level Security
ALTER TABLE public.relationship_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationship_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationship_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for relationship_statuses
-- Users can view public relationships
CREATE POLICY "Public relationships are viewable by everyone"
  ON public.relationship_statuses
  FOR SELECT
  USING (is_public = true);

-- Users can view their own relationship status
CREATE POLICY "Users can view own relationship status"
  ON public.relationship_statuses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view their partner's relationship status
CREATE POLICY "Users can view partner relationship status"
  ON public.relationship_statuses
  FOR SELECT
  USING (auth.uid() = partner_id);

-- Users can insert their own relationship status
CREATE POLICY "Users can insert own relationship status"
  ON public.relationship_statuses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own relationship status
CREATE POLICY "Users can update own relationship status"
  ON public.relationship_statuses
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for relationship_history
-- Users can view their own relationship history
CREATE POLICY "Users can view own relationship history"
  ON public.relationship_history
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = partner_id);

-- System can insert into relationship history
CREATE POLICY "System can insert relationship history"
  ON public.relationship_history
  FOR INSERT
  WITH CHECK (true);

-- RLS Policies for relationship_requests
-- Users can view requests they sent
CREATE POLICY "Users can view sent requests"
  ON public.relationship_requests
  FOR SELECT
  USING (auth.uid() = from_user_id);

-- Users can view requests they received
CREATE POLICY "Users can view received requests"
  ON public.relationship_requests
  FOR SELECT
  USING (auth.uid() = to_user_id);

-- Users can insert relationship requests
CREATE POLICY "Users can create relationship requests"
  ON public.relationship_requests
  FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

-- Users can update requests they sent (to cancel)
CREATE POLICY "Users can cancel own requests"
  ON public.relationship_requests
  FOR UPDATE
  USING (auth.uid() = from_user_id);

-- Users can update requests they received (to accept/decline)
CREATE POLICY "Users can respond to received requests"
  ON public.relationship_requests
  FOR UPDATE
  USING (auth.uid() = to_user_id);

-- Initialize default "single" status for existing users (if profiles table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    INSERT INTO public.relationship_statuses (user_id, status, status_display_name)
    SELECT user_id, 'single', 'Single'
    FROM public.profiles
    WHERE user_id NOT IN (SELECT user_id FROM public.relationship_statuses)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
END $$;
