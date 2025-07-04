/*
  # Fix analytics_events table schema

  1. Changes
    - Add user_id column to analytics_events table if it doesn't exist
    - Make user_id nullable to support anonymous events
    - Add index for better query performance
    - Update RLS policies to work with the new column structure

  2. Security
    - Maintain existing RLS policies
    - Add policy for users to view their own analytics
*/

-- Check if user_id column exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'analytics_events' AND column_name = 'user_id'
  ) THEN
    -- Add user_id column (nullable to support anonymous events)
    ALTER TABLE analytics_events ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    
    -- Add index for better performance
    CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
  END IF;
END $$;

-- Update RLS policies to include user_id
DROP POLICY IF EXISTS "Allow public analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Users can view their own analytics" ON analytics_events;

-- Create new policies
CREATE POLICY "Allow public analytics events" 
  ON analytics_events
  FOR INSERT TO anon 
  WITH CHECK (true);

CREATE POLICY "Users can view their own analytics" 
  ON analytics_events
  FOR SELECT TO authenticated 
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Add policy for authenticated users to insert events
CREATE POLICY "Authenticated users can insert analytics events"
  ON analytics_events
  FOR INSERT TO authenticated
  WITH CHECK (true);