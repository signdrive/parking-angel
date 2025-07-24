-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  read_time INTEGER, -- in minutes
  meta_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Categories Table
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
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- Policies for blog_posts
CREATE POLICY "Anyone can view published blog posts" ON blog_posts
  FOR SELECT USING (published = true);

CREATE POLICY "Authenticated users can create blog posts" ON blog_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authors can update their own blog posts" ON blog_posts
  FOR UPDATE USING (author_id = auth.uid());

-- Policies for blog_categories
CREATE POLICY "Anyone can view blog categories" ON blog_categories
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage categories" ON blog_categories
  FOR ALL USING (auth.role() = 'authenticated');

-- Policies for blog_tags
CREATE POLICY "Anyone can view blog tags" ON blog_tags
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage tags" ON blog_tags
  FOR ALL USING (auth.role() = 'authenticated');

-- Policies for blog_comments
CREATE POLICY "Anyone can view approved comments" ON blog_comments
  FOR SELECT USING (approved = true);

CREATE POLICY "Anyone can create comments" ON blog_comments
  FOR INSERT WITH CHECK (true);

-- Indexes for better performance
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(published, published_at DESC);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_tags ON blog_posts USING GIN(tags);
CREATE INDEX idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX idx_blog_tags_slug ON blog_tags(slug);

-- Insert default categories
INSERT INTO blog_categories (name, slug, description, color) VALUES
  ('AI Technology', 'ai-technology', 'Articles about artificial intelligence in parking systems', '#3B82F6'),
  ('Case Studies', 'case-studies', 'Real-world implementation examples', '#10B981'),
  ('Business', 'business', 'Business insights and ROI analysis', '#F59E0B'),
  ('Technology', 'technology', 'Technical deep dives and explanations', '#8B5CF6'),
  ('Revenue Optimization', 'revenue-optimization', 'Strategies for maximizing parking revenue', '#EF4444'),
  ('Infrastructure', 'infrastructure', 'Infrastructure and scalability topics', '#6B7280')
ON CONFLICT (slug) DO NOTHING;

-- Insert default tags
INSERT INTO blog_tags (name, slug) VALUES
  ('AI parking optimization', 'ai-parking-optimization'),
  ('Smart parking algorithms', 'smart-parking-algorithms'),
  ('Urban planning', 'urban-planning'),
  ('Smart cities', 'smart-cities'),
  ('ROI analysis', 'roi-analysis'),
  ('Cost-effective parking technology', 'cost-effective-parking-technology'),
  ('Parking management software', 'parking-management-software'),
  ('Machine learning', 'machine-learning'),
  ('Predictive analytics', 'predictive-analytics'),
  ('Dynamic parking pricing', 'dynamic-parking-pricing'),
  ('Revenue optimization', 'revenue-optimization'),
  ('Automated parking solutions', 'automated-parking-solutions'),
  ('Cloud-based parking management', 'cloud-based-parking-management'),
  ('Scalability', 'scalability')
ON CONFLICT (slug) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
