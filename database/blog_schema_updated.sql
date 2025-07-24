-- Blog Categories Table (create first due to foreign key)
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Tags Table
CREATE TABLE IF NOT EXISTS blog_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT NOT NULL,
  category_id UUID REFERENCES blog_categories(id),
  category TEXT NOT NULL, -- denormalized for easier queries
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  read_time INTEGER, -- in minutes
  meta_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  featured_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Comments Table (for future use)
CREATE TABLE IF NOT EXISTS blog_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON blog_tags(slug);
CREATE INDEX IF NOT EXISTS idx_blog_comments_post ON blog_comments(post_id);

-- Row Level Security (RLS) Policies
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- Public read access for published posts
CREATE POLICY "Public read access for published posts" ON blog_posts
  FOR SELECT USING (published = true);

-- Authenticated users can read all posts (for admin)
CREATE POLICY "Authenticated users can read all posts" ON blog_posts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only authenticated users can create/update/delete posts
CREATE POLICY "Authenticated users can create posts" ON blog_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update posts" ON blog_posts
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete posts" ON blog_posts
  FOR DELETE USING (auth.role() = 'authenticated');

-- Public read access for categories and tags
CREATE POLICY "Public read access for categories" ON blog_categories
  FOR SELECT USING (true);

CREATE POLICY "Public read access for tags" ON blog_tags
  FOR SELECT USING (true);

-- Only authenticated users can manage categories and tags
CREATE POLICY "Authenticated users can manage categories" ON blog_categories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage tags" ON blog_tags
  FOR ALL USING (auth.role() = 'authenticated');

-- Comments (future feature)
CREATE POLICY "Public read access for approved comments" ON blog_comments
  FOR SELECT USING (approved = true);

CREATE POLICY "Authenticated users can manage comments" ON blog_comments
  FOR ALL USING (auth.role() = 'authenticated');

-- Functions
CREATE OR REPLACE FUNCTION update_blog_post_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_post_timestamp();

-- Insert default categories
INSERT INTO blog_categories (name, slug, description, color) VALUES 
  ('AI Technology', 'ai-technology', 'Articles about artificial intelligence and machine learning in parking', '#3B82F6'),
  ('Smart Cities', 'smart-cities', 'Urban planning and smart city implementations', '#10B981'),
  ('Case Studies', 'case-studies', 'Real-world implementation examples and results', '#8B5CF6'),
  ('Business', 'business', 'Business insights and ROI analysis', '#F59E0B'),
  ('Technology', 'technology', 'Technical deep dives and development insights', '#EF4444'),
  ('Revenue Optimization', 'revenue-optimization', 'Strategies for maximizing parking revenue', '#06B6D4')
ON CONFLICT (slug) DO NOTHING;

-- Insert default tags
INSERT INTO blog_tags (name, slug, color) VALUES 
  ('AI parking optimization', 'ai-parking-optimization', '#3B82F6'),
  ('smart cities', 'smart-cities', '#10B981'),
  ('urban planning', 'urban-planning', '#8B5CF6'),
  ('machine learning', 'machine-learning', '#3B82F6'),
  ('predictive analytics', 'predictive-analytics', '#F59E0B'),
  ('dynamic pricing', 'dynamic-pricing', '#EF4444'),
  ('revenue optimization', 'revenue-optimization', '#06B6D4'),
  ('case studies', 'case-studies', '#8B5CF6'),
  ('ROI analysis', 'roi-analysis', '#F59E0B'),
  ('parking management software', 'parking-management-software', '#10B981')
ON CONFLICT (slug) DO NOTHING;
