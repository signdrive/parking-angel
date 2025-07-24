import { createClient } from '@/lib/supabase/server'

// Create blog tables if they don't exist
export async function createBlogTables() {
  const supabase = createClient()
  
  try {
    console.log('Creating blog tables...')
    
    // Create categories table
    const { error: categoriesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS blog_categories (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          description TEXT,
          color TEXT DEFAULT '#3B82F6',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (categoriesError) {
      console.error('Error creating categories table:', categoriesError)
    } else {
      console.log('✅ Categories table ready')
    }
    
    // Create tags table
    const { error: tagsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS blog_tags (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          color TEXT DEFAULT '#3B82F6',
          usage_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (tagsError) {
      console.error('Error creating tags table:', tagsError)
    } else {
      console.log('✅ Tags table ready')
    }
    
    // Create posts table
    const { error: postsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS blog_posts (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          excerpt TEXT,
          content TEXT NOT NULL,
          author_id UUID REFERENCES auth.users(id),
          author_name TEXT NOT NULL,
          category_id UUID REFERENCES blog_categories(id),
          category TEXT NOT NULL,
          tags TEXT[] DEFAULT '{}',
          featured BOOLEAN DEFAULT FALSE,
          published BOOLEAN DEFAULT FALSE,
          published_at TIMESTAMP WITH TIME ZONE,
          read_time INTEGER,
          meta_title TEXT,
          meta_description TEXT,
          canonical_url TEXT,
          featured_image_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (postsError) {
      console.error('Error creating posts table:', postsError)
    } else {
      console.log('✅ Posts table ready')
    }
    
    return { success: true }
    
  } catch (error) {
    console.error('Error setting up blog tables:', error)
    return { success: false, error }
  }
}
