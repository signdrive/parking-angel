import { getBrowserClient } from '@/lib/supabase/browser'

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  author_id: string
  author_name: string
  category_id: string
  category: string
  tags: string[]
  featured: boolean
  published: boolean
  published_at?: string
  read_time?: number
  meta_title?: string
  meta_description?: string
  canonical_url?: string
  featured_image_url?: string
  created_at: string
  updated_at: string
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description?: string
  color: string
  created_at: string
}

export interface BlogTag {
  id: string
  name: string
  slug: string
  color?: string
  usage_count: number
  created_at: string
}

class BlogService {
  private supabase = getBrowserClient()

  // Blog Posts
  async getAllPosts(published = true): Promise<BlogPost[]> {
    try {
      let query = this.supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false })

      if (published) {
        query = query.eq('published', true)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching posts:', error)
        return []
      }

      // Return posts with default values for missing relationships
      return (data || []).map((post: any) => ({
        ...post,
        category: 'Uncategorized',
        author_name: 'ParkAlgo Team',
        tags: post.tags || []
      }))
    } catch (error) {
      console.error('Error in getAllPosts:', error)
      return []
    }
  }

  async getPostById(id: string): Promise<BlogPost | null> {
    try {
      const { data, error } = await this.supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        console.error('Error fetching post:', error)
        return null
      }

      return {
        ...data,
        category: 'Uncategorized',
        author_name: 'ParkAlgo Team',
        tags: data.tags || []
      }
    } catch (error) {
      console.error('Error in getPostById:', error)
      return null
    }
  }

  async createPost(postData: Partial<BlogPost>): Promise<BlogPost | null> {
    try {
      console.log('🔄 Creating post via API with data:', postData)
      
      const response = await fetch('/api/blog/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        console.error('❌ API Error creating post:', result)
        return null
      }
      
      if (result.success && result.post) {
        console.log('✅ Post created successfully via API:', result.post)
        return result.post
      }
      
      console.error('❌ Unexpected API response:', result)
      return null
    } catch (error) {
      console.error('❌ Exception in createPost:', error)
      return null
    }
  }

  async updatePost(id: string, updates: Partial<BlogPost>): Promise<boolean> {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    if (updates.content) {
      updateData.read_time = this.calculateReadTime(updates.content)
    }

    const { error } = await this.supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Error updating post:', error)
      return false
    }

    return true
  }

  async deletePost(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('blog_posts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting post:', error)
      return false
    }

    return true
  }

  // Categories
  async getCategories(): Promise<BlogCategory[]> {
    try {
      console.log('🔄 Fetching categories from Supabase...');
      
      const { data, error } = await this.supabase
        .from('blog_categories')
        .select('*')
        .order('name')

      if (error) {
        console.error('❌ Error fetching categories:', error)
        // Return default categories if table doesn't exist
        return [
          {
            id: 'temp-uncategorized',
            name: 'Uncategorized',
            slug: 'uncategorized',
            description: 'Default category',
            color: '#6B7280',
            created_at: new Date().toISOString()
          }
        ]
      }

      console.log('✅ Fetched', data?.length || 0, 'categories:', data?.map(c => c.name));
      return data || []
    } catch (error) {
      console.error('❌ Exception fetching categories:', error)
      // Return default categories on exception
      return [
        {
          id: 'temp-uncategorized',
          name: 'Uncategorized',
          slug: 'uncategorized',
          description: 'Default category',
          color: '#6B7280',
          created_at: new Date().toISOString()
        }
      ]
    }
  }

  async createCategory(categoryData: Partial<BlogCategory>): Promise<BlogCategory | null> {
    const { data, error } = await this.supabase
      .from('blog_categories')
      .insert([categoryData])
      .select()
      .single()

    if (error || !data) {
      console.error('Error creating category:', error)
      return null
    }

    return data
  }

  async updateCategory(id: string, updates: Partial<BlogCategory>): Promise<boolean> {
    const { error } = await this.supabase
      .from('blog_categories')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Error updating category:', error)
      return false
    }

    return true
  }

  async deleteCategory(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('blog_categories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting category:', error)
      return false
    }

    return true
  }

  // Tags
  async getTags(): Promise<BlogTag[]> {
    try {
      const { data, error } = await this.supabase
        .from('blog_tags')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching tags (table may not exist):', error)
        // Fallback: extract tags from existing blog posts
        return this.getTagsFromPosts()
      }

      return data || []
    } catch (error) {
      console.error('Exception fetching tags:', error)
      // Fallback: extract tags from existing blog posts
      return this.getTagsFromPosts()
    }
  }

  private async getTagsFromPosts(): Promise<BlogTag[]> {
    try {
      const { data, error } = await this.supabase
        .from('blog_posts')
        .select('tags')
        .eq('published', true)

      if (error || !data) {
        return []
      }

      // Extract unique tags from all posts
      const allTags = new Set<string>()
      data.forEach(post => {
        if (Array.isArray(post.tags)) {
          post.tags.forEach(tag => allTags.add(tag))
        }
      })

      // Convert to BlogTag objects
      return Array.from(allTags).map(tag => ({
        id: tag,
        name: tag,
        slug: tag.toLowerCase().replace(/\s+/g, '-'),
        color: '#3B82F6',
        usage_count: data.filter(post => 
          Array.isArray(post.tags) && post.tags.includes(tag)
        ).length,
        created_at: new Date().toISOString()
      }))
    } catch (error) {
      console.error('Error extracting tags from posts:', error)
      return []
    }
  }

  async createTag(tagData: Partial<BlogTag>): Promise<BlogTag | null> {
    const { data, error } = await this.supabase
      .from('blog_tags')
      .insert([tagData])
      .select()
      .single()

    if (error || !data) {
      console.error('Error creating tag:', error)
      return null
    }

    return data
  }

  async updateTag(id: string, updates: Partial<BlogTag>): Promise<boolean> {
    const { error } = await this.supabase
      .from('blog_tags')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Error updating tag:', error)
      return false
    }

    return true
  }

  async deleteTag(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('blog_tags')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting tag:', error)
      return false
    }

    return true
  }

  // Utility functions
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  calculateReadTime(content: string): number {
    const wordsPerMinute = 200
    const wordCount = content.split(/\s+/).length
    return Math.ceil(wordCount / wordsPerMinute)
  }
}

export const blogService = new BlogService()
