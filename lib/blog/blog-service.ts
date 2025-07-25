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
    const query = this.supabase
      .from('blog_posts')
      .select(`
        *,
        blog_categories(name),
        profiles(display_name)
      `)
      .order('published_at', { ascending: false })

    if (published) {
      query.eq('published', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching posts:', error)
      return []
    }

    return (data || []).map((post: any) => ({
      ...post,
      category: post.blog_categories?.name || '',
      author_name: post.profiles?.display_name || '',
      tags: post.tags || []
    }))
  }

  async getPostById(id: string): Promise<BlogPost | null> {
    const { data, error } = await this.supabase
      .from('blog_posts')
      .select(`
        *,
        blog_categories(name),
        profiles(display_name)
      `)
      .eq('id', id)
      .single()

    if (error || !data) {
      console.error('Error fetching post:', error)
      return null
    }

    return {
      ...data,
      category: data.blog_categories?.name || '',
      author_name: data.profiles?.display_name || '',
      tags: data.tags || []
    }
  }

  async createPost(postData: Partial<BlogPost>): Promise<BlogPost | null> {
    const { data, error } = await this.supabase
      .from('blog_posts')
      .insert([{
        ...postData,
        read_time: postData.content ? this.calculateReadTime(postData.content) : undefined
      }])
      .select()
      .single()

    if (error || !data) {
      console.error('Error creating post:', error)
      return null
    }

    return this.getPostById(data.id)
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
    const { data, error } = await this.supabase
      .from('blog_categories')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }

    return data || []
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
    const { data, error } = await this.supabase
      .from('blog_tags')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching tags:', error)
      return []
    }

    return data || []
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
