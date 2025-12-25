/*
  # Culture Wall Social Feed System
  
  1. New Tables
    - culture_wall_posts: Main posts table with media, categorization, and engagement
    - culture_wall_comments: Comments with nested threading
    - culture_wall_reactions: Multi-type reactions for posts and comments
    - culture_wall_hashtags: Hashtag tracking and trending
    - culture_wall_saved_posts: Bookmarking system
    - culture_wall_shares: Share tracking
    - culture_wall_reports: Content moderation and reporting
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Culture wall posts
CREATE TABLE IF NOT EXISTS culture_wall_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Content
  content TEXT NOT NULL,
  post_type TEXT CHECK (post_type IN ('text', 'photo', 'video', 'link', 'poll', 'story', 'event')),
  media_urls TEXT[], -- Array of media URLs
  
  -- Categorization
  category TEXT CHECK (category IN ('food', 'traditions', 'travel', 'dating_tips', 'language', 'festivals', 'success_story', 'question', 'advice', 'cultural_challenge')),
  culture_tags TEXT[], -- 'filipino', 'american', 'cebuano', etc.
  location_tags TEXT[], -- 'manila', 'seattle', etc.
  hashtags TEXT[],
  
  -- Visibility
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'couples_only', 'friends_only', 'private')),
  allow_comments BOOLEAN DEFAULT true,
  allow_shares BOOLEAN DEFAULT true,
  
  -- Engagement metrics
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  
  -- Moderation
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  is_reported BOOLEAN DEFAULT false,
  moderation_status TEXT DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_culture_posts_user ON culture_wall_posts(user_id, created_at DESC);
CREATE INDEX idx_culture_posts_category ON culture_wall_posts(category, created_at DESC);
CREATE INDEX idx_culture_posts_visibility ON culture_wall_posts(visibility, created_at DESC);
CREATE INDEX idx_culture_posts_hashtags ON culture_wall_posts USING GIN(hashtags);
CREATE INDEX idx_culture_posts_moderation ON culture_wall_posts(moderation_status, created_at DESC);

-- Comments
CREATE TABLE IF NOT EXISTS culture_wall_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES culture_wall_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES culture_wall_comments(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  media_url TEXT,
  
  likes_count INTEGER DEFAULT 0,
  is_author_reply BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_comments_post ON culture_wall_comments(post_id, created_at DESC);
CREATE INDEX idx_comments_parent ON culture_wall_comments(parent_comment_id, created_at DESC);

-- Reactions/Likes
CREATE TABLE IF NOT EXISTS culture_wall_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES culture_wall_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES culture_wall_comments(id) ON DELETE CASCADE,
  
  reaction_type TEXT DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'helpful', 'insightful', 'funny', 'celebrate')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT reaction_target CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR 
    (post_id IS NULL AND comment_id IS NOT NULL)
  ),
  UNIQUE(user_id, post_id, reaction_type),
  UNIQUE(user_id, comment_id, reaction_type)
);

CREATE INDEX idx_reactions_post ON culture_wall_reactions(post_id, reaction_type);
CREATE INDEX idx_reactions_comment ON culture_wall_reactions(comment_id, reaction_type);
CREATE INDEX idx_reactions_user ON culture_wall_reactions(user_id, created_at DESC);

-- Hashtags
CREATE TABLE IF NOT EXISTS culture_wall_hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag TEXT UNIQUE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hashtags_usage ON culture_wall_hashtags(usage_count DESC);

-- Saved posts
CREATE TABLE IF NOT EXISTS culture_wall_saved_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES culture_wall_posts(id) ON DELETE CASCADE,
  collection_name TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

CREATE INDEX idx_saved_posts_user ON culture_wall_saved_posts(user_id, created_at DESC);

-- Shares
CREATE TABLE IF NOT EXISTS culture_wall_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES culture_wall_posts(id) ON DELETE CASCADE,
  
  shared_to TEXT CHECK (shared_to IN ('feed', 'message', 'external')),
  message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shares_post ON culture_wall_shares(post_id, created_at DESC);

-- Reports
CREATE TABLE IF NOT EXISTS culture_wall_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES culture_wall_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES culture_wall_comments(id) ON DELETE CASCADE,
  
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'inappropriate_content', 'misinformation', 'cultural_insensitivity', 'fake_profile', 'other')),
  description TEXT,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  moderator_notes TEXT,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_status ON culture_wall_reports(status, created_at DESC);
CREATE INDEX idx_reports_post ON culture_wall_reports(post_id);

-- Enable Row Level Security
ALTER TABLE culture_wall_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE culture_wall_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE culture_wall_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE culture_wall_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE culture_wall_saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE culture_wall_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE culture_wall_reports ENABLE ROW LEVEL SECURITY;

-- Policies for culture_wall_posts
CREATE POLICY "Public posts are viewable by everyone"
  ON culture_wall_posts FOR SELECT
  USING (visibility = 'public' AND moderation_status = 'approved' AND deleted_at IS NULL);

CREATE POLICY "Users can view their own posts"
  ON culture_wall_posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create posts"
  ON culture_wall_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON culture_wall_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON culture_wall_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for culture_wall_comments
CREATE POLICY "Comments are viewable by everyone"
  ON culture_wall_comments FOR SELECT
  USING (deleted_at IS NULL);

CREATE POLICY "Authenticated users can create comments"
  ON culture_wall_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON culture_wall_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON culture_wall_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for culture_wall_reactions
CREATE POLICY "Reactions are viewable by everyone"
  ON culture_wall_reactions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reactions"
  ON culture_wall_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
  ON culture_wall_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for culture_wall_hashtags
CREATE POLICY "Hashtags are viewable by everyone"
  ON culture_wall_hashtags FOR SELECT
  USING (true);

-- Policies for culture_wall_saved_posts
CREATE POLICY "Users can view their own saved posts"
  ON culture_wall_saved_posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save posts"
  ON culture_wall_saved_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their saved posts"
  ON culture_wall_saved_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for culture_wall_shares
CREATE POLICY "Users can view their own shares"
  ON culture_wall_shares FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can share posts"
  ON culture_wall_shares FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies for culture_wall_reports
CREATE POLICY "Users can view their own reports"
  ON culture_wall_reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Authenticated users can report content"
  ON culture_wall_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Function to update post engagement counts
CREATE OR REPLACE FUNCTION update_post_engagement_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'culture_wall_comments' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE culture_wall_posts 
      SET comments_count = comments_count + 1 
      WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE culture_wall_posts 
      SET comments_count = GREATEST(comments_count - 1, 0)
      WHERE id = OLD.post_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'culture_wall_reactions' THEN
    IF TG_OP = 'INSERT' AND NEW.post_id IS NOT NULL THEN
      UPDATE culture_wall_posts 
      SET likes_count = likes_count + 1 
      WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' AND OLD.post_id IS NOT NULL THEN
      UPDATE culture_wall_posts 
      SET likes_count = GREATEST(likes_count - 1, 0)
      WHERE id = OLD.post_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'culture_wall_shares' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE culture_wall_posts 
      SET shares_count = shares_count + 1 
      WHERE id = NEW.post_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'culture_wall_saved_posts' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE culture_wall_posts 
      SET saves_count = saves_count + 1 
      WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE culture_wall_posts 
      SET saves_count = GREATEST(saves_count - 1, 0)
      WHERE id = OLD.post_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for engagement counts
CREATE TRIGGER update_post_comments_count
  AFTER INSERT OR DELETE ON culture_wall_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_engagement_counts();

CREATE TRIGGER update_post_reactions_count
  AFTER INSERT OR DELETE ON culture_wall_reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_post_engagement_counts();

CREATE TRIGGER update_post_shares_count
  AFTER INSERT ON culture_wall_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_post_engagement_counts();

CREATE TRIGGER update_post_saves_count
  AFTER INSERT OR DELETE ON culture_wall_saved_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_post_engagement_counts();

-- Function to update hashtag usage counts
CREATE OR REPLACE FUNCTION update_hashtag_usage()
RETURNS TRIGGER AS $$
DECLARE
  tag TEXT;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Add new hashtags
    FOREACH tag IN ARRAY NEW.hashtags
    LOOP
      INSERT INTO culture_wall_hashtags (tag, usage_count)
      VALUES (LOWER(tag), 1)
      ON CONFLICT (tag) DO UPDATE
      SET usage_count = culture_wall_hashtags.usage_count + 1;
    END LOOP;
  END IF;
  
  IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    -- Decrease count for removed hashtags
    FOREACH tag IN ARRAY OLD.hashtags
    LOOP
      UPDATE culture_wall_hashtags
      SET usage_count = GREATEST(usage_count - 1, 0)
      WHERE tag = LOWER(tag);
    END LOOP;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_hashtag_counts
  AFTER INSERT OR UPDATE OR DELETE ON culture_wall_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_hashtag_usage();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_posts_timestamp
  BEFORE UPDATE ON culture_wall_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_timestamp
  BEFORE UPDATE ON culture_wall_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
