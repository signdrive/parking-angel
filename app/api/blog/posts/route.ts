import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

// Interface for n8n blog post data
interface N8nBlogPost {
  title: string
  content: string
  excerpt?: string
  category_slug?: string
  tags?: string[]
  featured?: boolean
  published?: boolean
  meta_title?: string
  meta_description?: string
  canonical_url?: string
  featured_image_url?: string
  author_email?: string
}

// Utility function to generate slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Calculate read time
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

// POST: Create a new blog post via n8n
export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const apiKey = headersList.get('x-api-key')
    const n8nWebhookId = headersList.get('x-n8n-webhook-id')
    
    // Validate API key (you should set this in your environment)
    const validApiKey = process.env.N8N_BLOG_API_KEY
    if (!validApiKey || apiKey !== validApiKey) {
      return NextResponse.json(
        { error: 'Invalid or missing API key' },
        { status: 401 }
      )
    }

    const supabase = createClient()
    const postData: N8nBlogPost = await request.json()

    // Validate required fields
    if (!postData.title || !postData.content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Generate slug
    const slug = generateSlug(postData.title)

    // Check if slug already exists
    const { data: existingPost } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingPost) {
      return NextResponse.json(
        { error: `Post with slug "${slug}" already exists` },
        { status: 409 }
      )
    }

    // Get category ID if category_slug is provided
    let category_id = null
    if (postData.category_slug) {
      const { data: category } = await supabase
        .from('blog_categories')
        .select('id')
        .eq('slug', postData.category_slug)
        .single()
      
      if (category) {
        category_id = category.id
      }
    }

    // Get author ID if author_email is provided, otherwise use default
    let author_id = null
    if (postData.author_email) {
      const { data: author } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', postData.author_email)
        .single()
      
      if (author) {
        author_id = author.id
      }
    }

    // If no author found, you might want to create a default system author
    if (!author_id) {
      // For now, we'll use a placeholder - you should create a system author
      author_id = '00000000-0000-0000-0000-000000000000' // Placeholder
    }

    // Prepare blog post data
    const blogPostData = {
      title: postData.title,
      slug,
      excerpt: postData.excerpt || postData.content.substring(0, 200) + '...',
      content: postData.content,
      author_id,
      category_id,
      tags: postData.tags || [],
      featured: postData.featured || false,
      published: postData.published || false,
      published_at: postData.published ? new Date().toISOString() : null,
      read_time: calculateReadTime(postData.content),
      meta_title: postData.meta_title || postData.title,
      meta_description: postData.meta_description || postData.excerpt,
      canonical_url: postData.canonical_url,
      featured_image_url: postData.featured_image_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Insert the blog post
    const { data: newPost, error } = await supabase
      .from('blog_posts')
      .insert([blogPostData])
      .select()
      .single()

    if (error) {
      console.error('Error creating blog post:', error)
      return NextResponse.json(
        { error: 'Failed to create blog post', details: error.message },
        { status: 500 }
      )
    }

    // Revalidate blog-related pages and sitemaps to include the new post
    try {
      revalidatePath('/blog')
      revalidatePath('/blog/sitemap.xml')
      revalidatePath('/sitemap.xml')
    } catch (revalidateError) {
      console.warn('Failed to revalidate paths:', revalidateError)
      // Don't fail the request if revalidation fails
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Blog post created successfully',
      post: {
        id: newPost.id,
        title: newPost.title,
        slug: newPost.slug,
        published: newPost.published,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/blog/${newPost.slug}`
      },
      n8n_webhook_id: n8nWebhookId // Echo back for n8n tracking
    }, { status: 201 })

  } catch (error) {
    console.error('Error in blog post API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET: Retrieve blog posts (for n8n to check existing content)
export async function GET(request: NextRequest) {
  try {
    const headersList = await headers()
    const apiKey = headersList.get('x-api-key')
    
    // Validate API key
    const validApiKey = process.env.N8N_BLOG_API_KEY
    if (!validApiKey || apiKey !== validApiKey) {
      return NextResponse.json(
        { error: 'Invalid or missing API key' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const published = searchParams.get('published') === 'true'

    const supabase = createClient()
    
    let query = supabase
      .from('blog_posts')
      .select(`
        id,
        title,
        slug,
        excerpt,
        published,
        published_at,
        created_at,
        blog_categories(name, slug),
        tags
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (published) {
      query = query.eq('published', true)
    }

    const { data: posts, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      count: posts?.length || 0,
      posts: posts || []
    })

  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
