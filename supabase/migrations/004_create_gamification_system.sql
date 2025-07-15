-- Create user_profiles table (extends auth.users)
CREATE TABLE user_profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  bio text,
  location jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create gamification_stats table
CREATE TABLE gamification_stats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_points integer DEFAULT 0,
  level integer DEFAULT 1,
  experience_points integer DEFAULT 0,
  reports_submitted integer DEFAULT 0,
  reports_verified integer DEFAULT 0,
  parking_sessions integer DEFAULT 0,
  community_rank integer,
  streak_days integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create achievements table
CREATE TABLE achievements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('reporting', 'parking', 'community', 'streak', 'exploration', 'special')),
  icon text,
  points_required integer DEFAULT 0,
  condition_type text NOT NULL CHECK (condition_type IN ('points', 'reports', 'sessions', 'streak', 'special')),
  condition_value integer,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE user_achievements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at timestamp with time zone DEFAULT now(),
  progress_value integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  UNIQUE(user_id, achievement_id)
);

-- Create daily_challenges table
CREATE TABLE daily_challenges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  challenge_type text NOT NULL CHECK (challenge_type IN ('report', 'verify', 'park', 'explore', 'social')),
  target_value integer NOT NULL,
  points_reward integer NOT NULL,
  is_active boolean DEFAULT true,
  valid_from date DEFAULT CURRENT_DATE,
  valid_until date DEFAULT CURRENT_DATE + INTERVAL '1 day',
  created_at timestamp with time zone DEFAULT now()
);

-- Create user_challenge_progress table
CREATE TABLE user_challenge_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
  current_progress integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Create leaderboard_entries table
CREATE TABLE leaderboard_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  leaderboard_type text NOT NULL CHECK (leaderboard_type IN ('weekly', 'monthly', 'all_time')),
  rank integer,
  score integer,
  period_start date,
  period_end date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, leaderboard_type, period_start)
);

-- Insert default achievements
INSERT INTO achievements (name, description, category, icon, points_required, condition_type, condition_value) VALUES
('First Report', 'Submit your first parking report', 'reporting', '🎯', 0, 'reports', 1),
('Reporter', 'Submit 10 parking reports', 'reporting', '📝', 0, 'reports', 10),
('Super Reporter', 'Submit 50 parking reports', 'reporting', '⭐', 0, 'reports', 50),
('Community Helper', 'Have 5 of your reports verified by others', 'community', '🤝', 0, 'special', 5),
('Parking Pro', 'Complete 25 parking sessions', 'parking', '🅿️', 0, 'sessions', 25),
('Streak Master', 'Maintain a 7-day activity streak', 'streak', '🔥', 0, 'streak', 7),
('Explorer', 'Report parking in 10 different areas', 'exploration', '🗺️', 0, 'special', 10),
('Point Collector', 'Earn 1000 points', 'special', '💎', 1000, 'points', 1000),
('Veteran', 'Be active for 30 days', 'special', '🏆', 0, 'special', 30);

-- Insert sample daily challenges
INSERT INTO daily_challenges (title, description, challenge_type, target_value, points_reward) VALUES
('Daily Reporter', 'Submit 3 parking reports today', 'report', 3, 50),
('Verification Hero', 'Verify 5 parking reports from other users', 'verify', 5, 30),
('Explorer Challenge', 'Report parking in 2 different neighborhoods', 'explore', 2, 40),
('Community Builder', 'Help 3 other users by verifying their reports', 'social', 3, 35);

-- Create indexes
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_gamification_stats_user_id ON gamification_stats(user_id);
CREATE INDEX idx_gamification_stats_total_points ON gamification_stats(total_points DESC);
CREATE INDEX idx_gamification_stats_level ON gamification_stats(level DESC);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX idx_user_achievements_completed ON user_achievements(is_completed);

CREATE INDEX idx_user_challenge_progress_user_id ON user_challenge_progress(user_id);
CREATE INDEX idx_user_challenge_progress_challenge_id ON user_challenge_progress(challenge_id);

CREATE INDEX idx_leaderboard_entries_type_rank ON leaderboard_entries(leaderboard_type, rank);
CREATE INDEX idx_leaderboard_entries_user_id ON leaderboard_entries(user_id);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Create policies for gamification_stats
CREATE POLICY "Users can view all stats" ON gamification_stats FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own stats" ON gamification_stats FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own stats" ON gamification_stats FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Create policies for user_achievements
CREATE POLICY "Users can view all achievements" ON user_achievements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own achievements" ON user_achievements FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own achievements" ON user_achievements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Create policies for user_challenge_progress
CREATE POLICY "Users can view their own challenge progress" ON user_challenge_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own challenge progress" ON user_challenge_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own challenge progress" ON user_challenge_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Create policies for leaderboard_entries
CREATE POLICY "Users can view leaderboard entries" ON leaderboard_entries FOR SELECT TO authenticated USING (true);

-- Create triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_gamification_stats_updated_at BEFORE UPDATE ON gamification_stats FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_leaderboard_entries_updated_at BEFORE UPDATE ON leaderboard_entries FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Create function to automatically create gamification stats when user signs up
CREATE OR REPLACE FUNCTION create_user_gamification_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO gamification_stats (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-create gamification stats
CREATE TRIGGER create_user_gamification_stats_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_gamification_stats();
