-- Live Streaming Tables Migration
-- Creates tables for TikTok-style multi-participant live streaming

-- live_streams table: Main stream information
CREATE TABLE IF NOT EXISTS live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'starting' CHECK (status IN ('idle', 'starting', 'live', 'ended', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  max_participants INTEGER DEFAULT 9 CHECK (max_participants > 0 AND max_participants <= 9),
  viewer_count INTEGER DEFAULT 0,
  layout_type TEXT DEFAULT 'grid' CHECK (layout_type IN ('grid', 'spotlight')),
  spotlight_user_id TEXT
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_live_streams_host_id ON live_streams(host_id);
CREATE INDEX IF NOT EXISTS idx_live_streams_status ON live_streams(status);
CREATE INDEX IF NOT EXISTS idx_live_streams_created_at ON live_streams(created_at DESC);

-- stream_participants table: Track participants in each stream
CREATE TABLE IF NOT EXISTS stream_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'participant' CHECK (role IN ('host', 'participant')),
  is_muted BOOLEAN DEFAULT false,
  is_video_enabled BOOLEAN DEFAULT true,
  is_minimized BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(stream_id, user_id)
);

-- Add indexes for stream_participants
CREATE INDEX IF NOT EXISTS idx_stream_participants_stream_id ON stream_participants(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_participants_user_id ON stream_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_stream_participants_active ON stream_participants(stream_id, left_at) WHERE left_at IS NULL;

-- stream_layout_state table: Track layout state changes
CREATE TABLE IF NOT EXISTS stream_layout_state (
  stream_id UUID PRIMARY KEY REFERENCES live_streams(id) ON DELETE CASCADE,
  spotlight_user_id TEXT,
  layout_type TEXT DEFAULT 'grid' CHECK (layout_type IN ('grid', 'spotlight')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- stream_chat table: Chat messages during stream
CREATE TABLE IF NOT EXISTS stream_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_host BOOLEAN DEFAULT false
);

-- Add indexes for stream_chat
CREATE INDEX IF NOT EXISTS idx_stream_chat_stream_id ON stream_chat(stream_id);
CREATE INDEX IF NOT EXISTS idx_stream_chat_timestamp ON stream_chat(stream_id, timestamp DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_layout_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_chat ENABLE ROW LEVEL SECURITY;

-- RLS Policies for live_streams
CREATE POLICY "Anyone can view live streams" ON live_streams
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own streams" ON live_streams
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Hosts can update their own streams" ON live_streams
  FOR UPDATE USING (true);

CREATE POLICY "Hosts can delete their own streams" ON live_streams
  FOR DELETE USING (true);

-- RLS Policies for stream_participants
CREATE POLICY "Anyone can view stream participants" ON stream_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can join streams" ON stream_participants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own participation status" ON stream_participants
  FOR UPDATE USING (true);

CREATE POLICY "Users can leave streams" ON stream_participants
  FOR DELETE USING (true);

-- RLS Policies for stream_layout_state
CREATE POLICY "Anyone can view layout state" ON stream_layout_state
  FOR SELECT USING (true);

CREATE POLICY "Hosts can update layout state" ON stream_layout_state
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Hosts can change layout state" ON stream_layout_state
  FOR UPDATE USING (true);

-- RLS Policies for stream_chat
CREATE POLICY "Anyone can view chat messages" ON stream_chat
  FOR SELECT USING (true);

CREATE POLICY "Participants can send chat messages" ON stream_chat
  FOR INSERT WITH CHECK (true);

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stream_layout_state_updated_at
  BEFORE UPDATE ON stream_layout_state
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE live_streams IS 'Main table for live streaming sessions';
COMMENT ON TABLE stream_participants IS 'Tracks participants in each live stream';
COMMENT ON TABLE stream_layout_state IS 'Stores the current layout state (grid/spotlight) for each stream';
COMMENT ON TABLE stream_chat IS 'Chat messages sent during live streams';
