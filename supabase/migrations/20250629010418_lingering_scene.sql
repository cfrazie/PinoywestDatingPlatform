/*
  # Cultural Calendar and Profiles Schema

  1. New Tables
    - `cultural_profiles` - Stores cultural information about users' locations
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `location_name` (text)
      - `country` (text)
      - `region` (text)
      - `population` (text)
      - `demographics` (jsonb)
      - `landmarks` (jsonb)
      - `events` (jsonb)
      - `cuisine` (jsonb)
      - `activities` (jsonb)
      - `economy` (jsonb)
      - `traditions` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `cultural_holidays` - Stores holiday information for different cultures
      - `id` (uuid, primary key)
      - `name` (text)
      - `date` (date)
      - `culture` (text)
      - `duration` (text)
      - `business_closure` (text)
      - `description` (text)
      - `significance` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `cultural_learning_modules` - Stores educational content about cultures
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `difficulty` (text)
      - `content` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `user_cultural_progress` - Tracks user progress through cultural learning
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `module_id` (uuid, references cultural_learning_modules)
      - `progress` (integer)
      - `completed` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read all cultural data
    - Add policies for users to manage their own cultural profiles and progress
*/

-- Cultural Profiles Table
CREATE TABLE IF NOT EXISTS cultural_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT,
  population TEXT,
  demographics JSONB DEFAULT '[]',
  landmarks JSONB DEFAULT '[]',
  events JSONB DEFAULT '[]',
  cuisine JSONB DEFAULT '[]',
  activities JSONB DEFAULT '[]',
  economy JSONB DEFAULT '[]',
  traditions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cultural Holidays Table
CREATE TABLE IF NOT EXISTS cultural_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  culture TEXT NOT NULL,
  duration TEXT,
  business_closure TEXT CHECK (business_closure IN ('full', 'partial', 'none')),
  description TEXT,
  significance TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cultural Learning Modules Table
CREATE TABLE IF NOT EXISTS cultural_learning_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  difficulty TEXT CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  content JSONB DEFAULT '[]',
  thumbnail TEXT,
  lessons_count INTEGER DEFAULT 0,
  duration TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Cultural Progress Table
CREATE TABLE IF NOT EXISTS user_cultural_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES cultural_learning_modules(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  last_accessed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- Cultural Tips Table
CREATE TABLE IF NOT EXISTS cultural_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  culture TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cultural Quiz Table
CREATE TABLE IF NOT EXISTS cultural_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  culture TEXT,
  difficulty TEXT CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  questions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Quiz Results Table
CREATE TABLE IF NOT EXISTS user_quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES cultural_quizzes(id) ON DELETE CASCADE,
  score INTEGER,
  max_score INTEGER,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, quiz_id, completed_at)
);

-- Time Zone Preferences Table
CREATE TABLE IF NOT EXISTS time_zone_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  time_zone TEXT NOT NULL,
  abbreviation TEXT,
  utc_offset NUMERIC,
  dst_observed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, location)
);

-- Cultural Conversation Starters Table
CREATE TABLE IF NOT EXISTS cultural_conversation_starters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  culture TEXT,
  difficulty TEXT CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE cultural_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultural_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultural_learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cultural_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultural_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultural_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_zone_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultural_conversation_starters ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Cultural Profiles
CREATE POLICY "Users can read all cultural profiles" ON cultural_profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage their own cultural profiles" ON cultural_profiles
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Cultural Holidays
CREATE POLICY "Anyone can read cultural holidays" ON cultural_holidays
  FOR SELECT TO anon, authenticated USING (true);

-- Cultural Learning Modules
CREATE POLICY "Anyone can read cultural learning modules" ON cultural_learning_modules
  FOR SELECT TO anon, authenticated USING (true);

-- User Cultural Progress
CREATE POLICY "Users can read their own progress" ON user_cultural_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON user_cultural_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON user_cultural_progress
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Cultural Tips
CREATE POLICY "Anyone can read cultural tips" ON cultural_tips
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Users can create cultural tips" ON cultural_tips
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own tips" ON cultural_tips
  FOR UPDATE TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

-- Cultural Quizzes
CREATE POLICY "Anyone can read cultural quizzes" ON cultural_quizzes
  FOR SELECT TO anon, authenticated USING (true);

-- User Quiz Results
CREATE POLICY "Users can read their own quiz results" ON user_quiz_results
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz results" ON user_quiz_results
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Time Zone Preferences
CREATE POLICY "Users can read their own time zone preferences" ON time_zone_preferences
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own time zone preferences" ON time_zone_preferences
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Cultural Conversation Starters
CREATE POLICY "Anyone can read conversation starters" ON cultural_conversation_starters
  FOR SELECT TO anon, authenticated USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cultural_profiles_user_id ON cultural_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_cultural_holidays_date ON cultural_holidays(date);
CREATE INDEX IF NOT EXISTS idx_cultural_holidays_culture ON cultural_holidays(culture);
CREATE INDEX IF NOT EXISTS idx_cultural_learning_modules_category ON cultural_learning_modules(category);
CREATE INDEX IF NOT EXISTS idx_cultural_learning_modules_difficulty ON cultural_learning_modules(difficulty);
CREATE INDEX IF NOT EXISTS idx_user_cultural_progress_user_id ON user_cultural_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cultural_progress_module_id ON user_cultural_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_cultural_tips_category ON cultural_tips(category);
CREATE INDEX IF NOT EXISTS idx_cultural_tips_culture ON cultural_tips(culture);
CREATE INDEX IF NOT EXISTS idx_cultural_quizzes_culture ON cultural_quizzes(culture);
CREATE INDEX IF NOT EXISTS idx_user_quiz_results_user_id ON user_quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_results_quiz_id ON user_quiz_results(quiz_id);
CREATE INDEX IF NOT EXISTS idx_time_zone_preferences_user_id ON time_zone_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_cultural_conversation_starters_category ON cultural_conversation_starters(category);
CREATE INDEX IF NOT EXISTS idx_cultural_conversation_starters_culture ON cultural_conversation_starters(culture);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_cultural_profiles_updated_at 
  BEFORE UPDATE ON cultural_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cultural_holidays_updated_at 
  BEFORE UPDATE ON cultural_holidays 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cultural_learning_modules_updated_at 
  BEFORE UPDATE ON cultural_learning_modules 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_cultural_progress_updated_at 
  BEFORE UPDATE ON user_cultural_progress 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cultural_tips_updated_at 
  BEFORE UPDATE ON cultural_tips 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cultural_quizzes_updated_at 
  BEFORE UPDATE ON cultural_quizzes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_zone_preferences_updated_at 
  BEFORE UPDATE ON time_zone_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for holidays
INSERT INTO cultural_holidays (name, date, culture, duration, business_closure, description, significance) VALUES
  ('New Year''s Day', '2024-01-01', 'american', '1 day', 'full', 'Federal holiday celebrating the beginning of the new year', 'Time for resolutions, fresh starts, and family gatherings'),
  ('New Year''s Day', '2024-01-01', 'filipino', '1 day', 'full', 'National holiday welcoming the new year with family reunions', 'Celebrated with fireworks, family gatherings, and traditional foods'),
  ('Martin Luther King Jr. Day', '2024-01-15', 'american', '1 day', 'partial', 'Federal holiday honoring civil rights leader', 'Day of service and reflection on equality and justice'),
  ('Sinulog Festival', '2024-01-21', 'filipino', '1 week', 'partial', 'Grand festival in Cebu honoring Santo Niño', 'Colorful street dancing, parades, and religious devotion'),
  ('Valentine''s Day', '2024-02-14', 'american', '1 day', 'none', 'Day of love and romance with gifts and dates', 'Expressing love through cards, flowers, and romantic gestures'),
  ('Valentine''s Day', '2024-02-14', 'filipino', '1 day', 'none', 'Celebration of love with family and romantic partners', 'Gift-giving, special meals, and romantic celebrations'),
  ('Presidents'' Day', '2024-02-19', 'american', '1 day', 'partial', 'Federal holiday honoring U.S. presidents', 'Celebrating American leadership and democracy'),
  ('Easter Sunday', '2024-03-31', 'american', '1 day', 'partial', 'Christian celebration of resurrection', 'Family gatherings, egg hunts, and religious services'),
  ('Maundy Thursday', '2024-03-28', 'filipino', '1 day', 'full', 'Holy Week observance before Easter', 'Religious reflection and family time'),
  ('Good Friday', '2024-03-29', 'filipino', '1 day', 'full', 'Solemn religious observance', 'Prayer, fasting, and religious processions'),
  ('Labor Day', '2024-05-01', 'filipino', '1 day', 'full', 'International Workers'' Day celebration', 'Honoring workers'' rights and contributions'),
  ('Memorial Day', '2024-05-27', 'american', '1 day', 'partial', 'Honoring fallen military service members', 'Remembrance, parades, and family gatherings'),
  ('Independence Day', '2024-06-12', 'filipino', '1 day', 'full', 'Philippine Independence from Spain (1898)', 'Flag ceremonies, parades, and patriotic celebrations'),
  ('Independence Day', '2024-07-04', 'american', '1 day', 'full', 'American Independence from Britain (1776)', 'Fireworks, BBQs, parades, and patriotic celebrations'),
  ('Labor Day', '2024-09-02', 'american', '1 day', 'partial', 'Celebrating American workers and labor movement', 'End of summer, back-to-school preparations'),
  ('Thanksgiving', '2024-11-28', 'american', '1 day', 'full', 'Gratitude celebration with family feast', 'Family gatherings, turkey dinner, and giving thanks'),
  ('Christmas Day', '2024-12-25', 'american', '1 day', 'full', 'Christian celebration of Jesus'' birth', 'Family gatherings, gift-giving, and religious observance'),
  ('Christmas Day', '2024-12-25', 'filipino', '1 day', 'full', 'Major Christian celebration with extended festivities', 'Family reunions, Noche Buena, and religious devotion')
ON CONFLICT DO NOTHING;

-- Insert sample learning modules
INSERT INTO cultural_learning_modules (title, description, category, difficulty, content, thumbnail, lessons_count, duration) VALUES
  ('Filipino Family Values & Traditions', 'Understanding the importance of family in Filipino culture, respect for elders, and traditional celebrations', 'Family & Relationships', 'Beginner', '[{"title":"Introduction to Filipino Family Structure","content":"Overview of extended family dynamics"},{"title":"Respect for Elders","content":"Understanding pagmamano and other traditions"},{"title":"Family Celebrations","content":"Birthdays, reunions, and special occasions"},{"title":"Family Roles & Expectations","content":"Traditional and modern perspectives"},{"title":"Communication Within Families","content":"Indirect communication and saving face"},{"title":"Family Conflict Resolution","content":"Harmony-focused approaches"}]', 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg', 6, '45 min'),
  
  ('American Dating Culture & Expectations', 'Navigate American dating norms, communication styles, and relationship expectations', 'Dating & Romance', 'Beginner', '[{"title":"Modern American Dating","content":"Apps, meeting places, and social norms"},{"title":"Communication Styles","content":"Direct communication and expectations"},{"title":"Dating Milestones","content":"From casual dating to exclusivity"},{"title":"Public Displays of Affection","content":"Acceptable boundaries and regional differences"},{"title":"Meeting Friends & Family","content":"When and how introductions typically happen"}]', 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg', 5, '35 min'),
  
  ('Filipino Cuisine & Food Culture', 'Explore traditional Filipino dishes, dining etiquette, and the role of food in social gatherings', 'Food & Dining', 'Intermediate', '[{"title":"Regional Filipino Cuisines","content":"Differences between Luzon, Visayas, and Mindanao"},{"title":"Essential Filipino Dishes","content":"Adobo, sinigang, lechon, and more"},{"title":"Dining Etiquette","content":"Table manners and social customs"},{"title":"Food in Celebrations","content":"Special dishes for fiestas and holidays"},{"title":"Street Food Culture","content":"Popular street foods and where to find them"},{"title":"Filipino Desserts","content":"Sweet treats and their cultural significance"},{"title":"Fusion Cuisine","content":"Modern Filipino food trends"},{"title":"Cooking Techniques","content":"Traditional methods and tools"}]', 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg', 8, '50 min')
ON CONFLICT DO NOTHING;

-- Insert sample cultural tips
INSERT INTO cultural_tips (title, content, category, culture) VALUES
  ('Understanding "Po" and "Opo" in Filipino Culture', 'These respectful terms are used when speaking to elders or authority figures. "Po" is added to statements, while "Opo" means "yes" respectfully. Using these shows cultural awareness and respect.', 'Language & Respect', 'filipino'),
  
  ('American Small Talk: Weather, Sports, and Work', 'Americans often start conversations with light topics like weather, local sports teams, or general work discussions. This isn''t superficial - it''s a way to build rapport before deeper conversations.', 'Communication', 'american'),
  
  ('The Importance of "Mano" Gesture', 'The "mano" is a traditional Filipino gesture of respect where you take an elder''s hand and gently press it to your forehead while saying "Mano po." This shows deep respect and is appreciated by Filipino families.', 'Traditions', 'filipino'),
  
  ('American Independence and Personal Space', 'Americans value personal independence and may need more alone time than expected. This isn''t rejection - it''s cultural. Respecting this need actually strengthens relationships.', 'Relationships', 'american')
ON CONFLICT DO NOTHING;

-- Insert sample conversation starters
INSERT INTO cultural_conversation_starters (category, question, culture, difficulty) VALUES
  ('Food & Cuisine', 'What''s your favorite local dish to cook for someone special?', NULL, 'Beginner'),
  ('Food & Cuisine', 'Which festival food would you most want me to try?', NULL, 'Beginner'),
  ('Food & Cuisine', 'How do food traditions bring your family together?', NULL, 'Intermediate'),
  
  ('Festivals & Celebrations', 'What''s the most exciting festival in your area?', NULL, 'Beginner'),
  ('Festivals & Celebrations', 'How does your community celebrate special occasions?', NULL, 'Beginner'),
  ('Festivals & Celebrations', 'Which local event would you love to experience together?', NULL, 'Intermediate'),
  
  ('Places & Landmarks', 'What local spot holds the most meaning for you?', NULL, 'Intermediate'),
  ('Places & Landmarks', 'Where would you take me on my first visit?', NULL, 'Beginner'),
  ('Places & Landmarks', 'What''s the story behind your favorite landmark?', NULL, 'Intermediate'),
  
  ('Traditions & Values', 'What family tradition means the most to you?', NULL, 'Intermediate'),
  ('Traditions & Values', 'How do you show respect in your culture?', NULL, 'Beginner'),
  ('Traditions & Values', 'What values from your community do you cherish?', NULL, 'Intermediate'),
  
  ('Daily Life & Activities', 'What does a typical weekend look like for you?', NULL, 'Beginner'),
  ('Daily Life & Activities', 'What activities bring your community together?', NULL, 'Intermediate'),
  ('Daily Life & Activities', 'How do you like to spend time with friends and family?', NULL, 'Beginner'),
  
  ('Arts & Entertainment', 'What music or arts scene is your area known for?', NULL, 'Intermediate'),
  ('Arts & Entertainment', 'What cultural performances would you recommend?', NULL, 'Intermediate'),
  ('Arts & Entertainment', 'How does creativity express itself in your community?', NULL, 'Advanced')
ON CONFLICT DO NOTHING;