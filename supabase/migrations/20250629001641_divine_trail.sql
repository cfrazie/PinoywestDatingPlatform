/*
  # Real-time Messaging System Database Schema

  1. New Tables
    - `chats` - Store chat/conversation information
    - `chat_participants` - Store chat participants (many-to-many)
    - `messages` - Store individual messages
    - `message_reactions` - Store message reactions/emojis
    - `message_edits` - Store message edit history
    - `typing_status` - Store real-time typing indicators
    - `message_drafts` - Store unsent message drafts
    - `blocked_users` - Store blocked user relationships
    - `chat_settings` - Store user chat preferences

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
    - Ensure users can only access their own chats and messages

  3. Indexes
    - Add performance indexes for common queries
    - Add foreign key constraints
*/

-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_type TEXT NOT NULL CHECK (chat_type IN ('direct', 'group')),
  group_name TEXT,
  group_avatar TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false
);

-- Create chat_participants table
CREATE TABLE IF NOT EXISTS chat_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  UNIQUE(chat_id, user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  recipient_id UUID REFERENCES auth.users(id),
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'image', 'voice', 'file', 'video')),
  content TEXT NOT NULL,
  file_name TEXT,
  file_size BIGINT,
  duration INTEGER, -- for voice/video messages in seconds
  caption TEXT, -- for media messages
  reply_to_id UUID REFERENCES messages(id),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sending', 'sent', 'delivered', 'read')),
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create message_reactions table
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);

-- Create message_edits table
CREATE TABLE IF NOT EXISTS message_edits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  original_content TEXT NOT NULL,
  new_content TEXT NOT NULL,
  edited_by UUID REFERENCES auth.users(id),
  edited_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create typing_status table
CREATE TABLE IF NOT EXISTS typing_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_typing BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(chat_id, user_id)
);

-- Create message_drafts table
CREATE TABLE IF NOT EXISTS message_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(chat_id, user_id)
);

-- Create blocked_users table
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, blocked_user_id)
);

-- Create chat_settings table
CREATE TABLE IF NOT EXISTS chat_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  notifications_enabled BOOLEAN DEFAULT true,
  sound_enabled BOOLEAN DEFAULT true,
  read_receipts_enabled BOOLEAN DEFAULT true,
  typing_indicators_enabled BOOLEAN DEFAULT true,
  auto_download_media BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for chats
CREATE POLICY "Users can view chats they participate in" ON chats
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM chat_participants 
      WHERE chat_participants.chat_id = chats.id 
      AND chat_participants.user_id = auth.uid()
      AND chat_participants.left_at IS NULL
    )
  );

CREATE POLICY "Users can create chats" ON chats
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update chats they participate in" ON chats
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM chat_participants 
      WHERE chat_participants.chat_id = chats.id 
      AND chat_participants.user_id = auth.uid()
      AND chat_participants.left_at IS NULL
    )
  );

-- Create RLS policies for chat_participants
CREATE POLICY "Users can view chat participants for their chats" ON chat_participants
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM chat_participants cp2
      WHERE cp2.chat_id = chat_participants.chat_id 
      AND cp2.user_id = auth.uid()
      AND cp2.left_at IS NULL
    )
  );

CREATE POLICY "Users can add participants to chats they're in" ON chat_participants
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_participants 
      WHERE chat_participants.chat_id = chat_participants.chat_id 
      AND chat_participants.user_id = auth.uid()
      AND chat_participants.left_at IS NULL
    )
  );

-- Create RLS policies for messages
CREATE POLICY "Users can view messages in their chats" ON messages
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM chat_participants 
      WHERE chat_participants.chat_id = messages.chat_id 
      AND chat_participants.user_id = auth.uid()
      AND chat_participants.left_at IS NULL
    )
  );

CREATE POLICY "Users can send messages to their chats" ON messages
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM chat_participants 
      WHERE chat_participants.chat_id = messages.chat_id 
      AND chat_participants.user_id = auth.uid()
      AND chat_participants.left_at IS NULL
    )
  );

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE TO authenticated USING (auth.uid() = sender_id);

-- Create RLS policies for message_reactions
CREATE POLICY "Users can view reactions in their chats" ON message_reactions
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN chat_participants cp ON cp.chat_id = m.chat_id
      WHERE m.id = message_reactions.message_id
      AND cp.user_id = auth.uid()
      AND cp.left_at IS NULL
    )
  );

CREATE POLICY "Users can add reactions to messages in their chats" ON message_reactions
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM messages m
      JOIN chat_participants cp ON cp.chat_id = m.chat_id
      WHERE m.id = message_reactions.message_id
      AND cp.user_id = auth.uid()
      AND cp.left_at IS NULL
    )
  );

CREATE POLICY "Users can remove their own reactions" ON message_reactions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create RLS policies for other tables
CREATE POLICY "Users can view their own message edits" ON message_edits
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM messages 
      WHERE messages.id = message_edits.message_id 
      AND messages.sender_id = auth.uid()
    )
  );

CREATE POLICY "Users can view typing status in their chats" ON typing_status
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM chat_participants 
      WHERE chat_participants.chat_id = typing_status.chat_id 
      AND chat_participants.user_id = auth.uid()
      AND chat_participants.left_at IS NULL
    )
  );

CREATE POLICY "Users can manage their own drafts" ON message_drafts
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their blocked users" ON blocked_users
  FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own chat settings" ON chat_settings
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chats_created_by ON chats(created_by);
CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON chats(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_participants_chat_id ON chat_participants(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_active ON chat_participants(chat_id, user_id) WHERE left_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_chat_created ON messages(chat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);

CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON message_reactions(user_id);

CREATE INDEX IF NOT EXISTS idx_message_edits_message_id ON message_edits(message_id);
CREATE INDEX IF NOT EXISTS idx_message_edits_edited_at ON message_edits(edited_at DESC);

CREATE INDEX IF NOT EXISTS idx_typing_status_chat_id ON typing_status(chat_id);
CREATE INDEX IF NOT EXISTS idx_typing_status_updated_at ON typing_status(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_message_drafts_chat_id ON message_drafts(chat_id);
CREATE INDEX IF NOT EXISTS idx_message_drafts_user_id ON message_drafts(user_id);

CREATE INDEX IF NOT EXISTS idx_blocked_users_user_id ON blocked_users(user_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked_user_id ON blocked_users(blocked_user_id);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_chats_updated_at 
  BEFORE UPDATE ON chats 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at 
  BEFORE UPDATE ON messages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_drafts_updated_at 
  BEFORE UPDATE ON message_drafts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_settings_updated_at 
  BEFORE UPDATE ON chat_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update chat updated_at when messages are added
CREATE OR REPLACE FUNCTION update_chat_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chats 
    SET updated_at = NOW() 
    WHERE id = NEW.chat_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_chat_on_message();

-- Create function to get unread message count
CREATE OR REPLACE FUNCTION get_unread_count(chat_id_param UUID, user_id_param UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM messages
        WHERE chat_id = chat_id_param
        AND recipient_id = user_id_param
        AND status != 'read'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(chat_id_param UUID, user_id_param UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE messages
    SET status = 'read', updated_at = NOW()
    WHERE chat_id = chat_id_param
    AND recipient_id = user_id_param
    AND status != 'read';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;