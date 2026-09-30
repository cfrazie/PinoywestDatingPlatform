/*
  # Create analytics_events table with UUID user_id, RLS, trigger, and indexes
  
  This migration creates a comprehensive analytics tracking table with:
  
  1. Table Structure
     - id: UUID primary key
     - user_id: UUID nullable, references auth.users(id) ON DELETE SET NULL
       * Nullable to support anonymous event tracking
       * Future migrations can add NOT NULL constraint if anonymous tracking is disabled
     - session_id: TEXT for tracking user sessions
     - event_type: TEXT for categorizing events (required)
     - event_data: JSONB for flexible event metadata
     - user_agent: TEXT for browser/device information
     - ip_address: TEXT for request origin (consider hashing for privacy)
     - created_at: TIMESTAMPTZ for event timestamp
  
  2. Security (RLS)
     - Enable Row Level Security
     - Allow anonymous (anon) users to INSERT events (client-side tracking)
     - Allow authenticated users to INSERT events (enforced by trigger to use auth.uid())
     - Allow authenticated users to SELECT only their own events OR anonymous events
     - Allow admins (profiles.is_admin) to SELECT all events
  
  3. Trigger Protection
     - SECURITY DEFINER function forces user_id = auth.uid() for authenticated requests
     - Prevents client-side spoofing of user_id
  
  4. Performance
     - Indexes on user_id, event_type, created_at, session_id for common queries
  
  5. Rollback
     - DROP statements at bottom for safe dev/staging rollbacks
*/

-- ============================================================================
-- TABLE CREATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NULL,
  user_agent TEXT NULL,
  ip_address TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add comment explaining nullable user_id
COMMENT ON COLUMN public.analytics_events.user_id IS 
  'Nullable to support anonymous event tracking. Set to auth.uid() via trigger for authenticated users. Future migrations can add NOT NULL constraint if anonymous tracking is disabled.';

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Policy 1: Allow anonymous (anon) users to INSERT events
-- This enables client-side tracking for non-authenticated users
DROP POLICY IF EXISTS "Allow anonymous event inserts" ON public.analytics_events;
CREATE POLICY "Allow anonymous event inserts" 
  ON public.analytics_events
  FOR INSERT 
  TO anon 
  WITH CHECK (true);

-- Policy 2: Allow authenticated users to INSERT events
-- The trigger below will enforce user_id = auth.uid() to prevent spoofing
DROP POLICY IF EXISTS "Allow authenticated event inserts" ON public.analytics_events;
CREATE POLICY "Allow authenticated event inserts" 
  ON public.analytics_events
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Policy 3: Allow authenticated users to SELECT their own events OR anonymous events
-- Users can view events where user_id matches their auth.uid() or user_id is NULL
DROP POLICY IF EXISTS "Users can read own and anonymous events" ON public.analytics_events;
CREATE POLICY "Users can read own and anonymous events" 
  ON public.analytics_events
  FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Policy 4: Allow admins to SELECT all events
-- Admins (identified by profiles.is_admin = true) can view all analytics
DROP POLICY IF EXISTS "Admins can read all events" ON public.analytics_events;
CREATE POLICY "Admins can read all events" 
  ON public.analytics_events
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 
      FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND is_admin = true
    )
  );

-- ============================================================================
-- SECURITY DEFINER FUNCTION AND TRIGGER
-- ============================================================================

-- Function to enforce user_id = auth.uid() for authenticated requests
-- This prevents clients from spoofing user_id in their INSERT requests
CREATE OR REPLACE FUNCTION public.analytics_set_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if there's a JWT (authenticated request)
  IF current_setting('request.jwt.claims', true) IS NOT NULL THEN
    -- Force user_id to be the authenticated user's ID
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.analytics_set_user_id() IS 
  'Trigger function that forces user_id to auth.uid() for authenticated requests, preventing client-side user_id spoofing.';

-- Trigger to execute the function before each INSERT
DROP TRIGGER IF EXISTS trg_analytics_set_user_id ON public.analytics_events;
CREATE TRIGGER trg_analytics_set_user_id
  BEFORE INSERT ON public.analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION public.analytics_set_user_id();

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Index on user_id for filtering by user
CREATE INDEX IF NOT EXISTS idx_analytics_user_id 
  ON public.analytics_events(user_id);

-- Index on event_type for filtering by event category
CREATE INDEX IF NOT EXISTS idx_analytics_event_type 
  ON public.analytics_events(event_type);

-- Index on created_at for time-based queries (descending for recent-first queries)
CREATE INDEX IF NOT EXISTS idx_analytics_created_at 
  ON public.analytics_events(created_at DESC);

-- Index on session_id for session-based analysis
CREATE INDEX IF NOT EXISTS idx_analytics_session_id 
  ON public.analytics_events(session_id);

-- Composite index for common admin queries (event type + time)
CREATE INDEX IF NOT EXISTS idx_analytics_event_type_created_at 
  ON public.analytics_events(event_type, created_at DESC);

-- ============================================================================
-- ROLLBACK / DOWN MIGRATION
-- ============================================================================
-- 
-- To rollback this migration in dev/staging, run these commands in order:
-- 
-- -- 1. Drop trigger
-- DROP TRIGGER IF EXISTS trg_analytics_set_user_id ON public.analytics_events;
-- 
-- -- 2. Drop function
-- DROP FUNCTION IF EXISTS public.analytics_set_user_id();
-- 
-- -- 3. Drop policies
-- DROP POLICY IF EXISTS "Allow anonymous event inserts" ON public.analytics_events;
-- DROP POLICY IF EXISTS "Allow authenticated event inserts" ON public.analytics_events;
-- DROP POLICY IF EXISTS "Users can read own and anonymous events" ON public.analytics_events;
-- DROP POLICY IF EXISTS "Admins can read all events" ON public.analytics_events;
-- 
-- -- 4. Drop indexes (optional, as they'll be dropped with the table)
-- DROP INDEX IF EXISTS public.idx_analytics_user_id;
-- DROP INDEX IF EXISTS public.idx_analytics_event_type;
-- DROP INDEX IF EXISTS public.idx_analytics_created_at;
-- DROP INDEX IF EXISTS public.idx_analytics_session_id;
-- DROP INDEX IF EXISTS public.idx_analytics_event_type_created_at;
-- 
-- -- 5. Drop table
-- DROP TABLE IF EXISTS public.analytics_events;
-- 
-- ============================================================================
