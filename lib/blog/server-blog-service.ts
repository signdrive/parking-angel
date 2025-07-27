import { createClient } from '@/lib/supabase/server'
import type { BlogPost, BlogCategory, BlogTag } from './blog-service'

export class ServerBlogService {
  private supabase = createClient()

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

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const { data, error } = await this.supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error || !data) {
        console.error('Error fetching post by slug:', error)
        return null
      }

      return {
        ...data,
        category: 'Uncategorized',
        author_name: 'ParkAlgo Team',
        tags: data.tags || []
      }
    } catch (error) {
      console.error('Error in getPostBySlug:', error)
      return null
    }
  }

  async getCategories(): Promise<BlogCategory[]> {
    try {
      const { data, error } = await this.supabase
        .from('blog_categories')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching categories (table may not exist):', error)
        // Return default categories if table doesn't exist
        return [
          {
            id: 'uncategorized',
            name: 'Uncategorized',
            slug: 'uncategorized',
            description: 'Default category',
            color: '#6B7280',
            created_at: new Date().toISOString()
          }
        ]
      }

      return data || []
    } catch (error) {
      console.error('Exception fetching categories:', error)
      // Return default categories on exception
      return [
        {
          id: 'uncategorized',
          name: 'Uncategorized',
          slug: 'uncategorized',
          description: 'Default category',
          color: '#6B7280',
          created_at: new Date().toISOString()
        }
      ]
    }
  }

  async getCategoryBySlug(slug: string): Promise<BlogCategory | null> {
    try {
      const { data, error } = await this.supabase
        .from('blog_categories')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error || !data) {
        console.error('Error fetching category by slug (table may not exist):', error)
        // Return default category if requested slug matches
        if (slug === 'uncategorized') {
          return {
            id: 'uncategorized',
            name: 'Uncategorized',
            slug: 'uncategorized',
            description: 'Default category',
            color: '#6B7280',
            created_at: new Date().toISOString()
          }
        }
        return null
      }

      return data
    } catch (error) {
      console.error('Exception fetching category by slug:', error)
      // Return default category if requested slug matches
      if (slug === 'uncategorized') {
        return {
          id: 'uncategorized',
          name: 'Uncategorized',
          slug: 'uncategorized',
          description: 'Default category',
          color: '#6B7280',
          created_at: new Date().toISOString()
        }
      }
      return null
    }
  }

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

  async getTagBySlug(slug: string): Promise<BlogTag | null> {
    // Since blog_tags table might not exist, we'll create a virtual tag
    // from the existing tags in blog posts
    const { data, error } = await this.supabase
      .from('blog_posts')
      .select('tags')
      .eq('published', true)

    if (error) {
      console.error('Error fetching posts for tag lookup:', error)
      return null
    }

    // Check if any post has this tag
    const hasTag = data?.some(post => 
      Array.isArray(post.tags) && post.tags.includes(slug)
    )

    if (!hasTag) {
      return null
    }

    // Return a virtual tag object
    return {
      id: slug,
      name: slug,
      slug: slug,
      color: '#3B82F6',
      usage_count: data?.filter(post => 
        Array.isArray(post.tags) && post.tags.includes(slug)
      ).length || 0,
      created_at: new Date().toISOString()
    }
  }

  async getPostsByCategory(categoryId: string, limit: number = 10, excludeIds: string[] = []): Promise<BlogPost[]> {
    try {
      let query = this.supabase
        .from('blog_posts')
        .select('*')
        .eq('category_id', categoryId)
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(limit)

      if (excludeIds.length > 0) {
        query = query.not('id', 'in', `(${excludeIds.join(',')})`)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching posts by category:', error)
        return []
      }

      return (data || []).map((post: any) => ({
        ...post,
        category: 'Uncategorized',
        author_name: 'ParkAlgo Team',
        tags: post.tags || []
      }))
    } catch (error) {
      console.error('Error in getPostsByCategory:', error)
      return []
    }
  }

  async getPostsByTag(tagName: string): Promise<BlogPost[]> {
    try {
      const { data, error } = await this.supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false })

      if (error) {
        console.error('Error fetching posts by tag:', error)
        return []
      }

      // Filter posts that contain the tag
      const filteredPosts = (data || []).filter((post: any) => 
        Array.isArray(post.tags) && post.tags.includes(tagName)
      )

      return filteredPosts.map((post: any) => ({
        ...post,
        category: 'Uncategorized',
        author_name: 'ParkAlgo Team',
        tags: post.tags || []
      }))
    } catch (error) {
      console.error('Error in getPostsByTag:', error)
      return []
    }
  }
}

export const serverBlogService = new ServerBlogService()
