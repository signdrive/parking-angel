import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Calculate read time
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

// POST: Create a new blog post
export async function POST(request: NextRequest) {
  try {
    const postData = await request.json()
    
    console.log('📝 Creating blog post via API:', postData)
    
    // Use service role for database operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // Include all required database fields
    const insertData = {
      title: postData.title || 'Untitled',
      content: postData.content || 'No content',
      slug: postData.slug || 'untitled-' + Date.now(),
      published: postData.published || false,
      author_name: postData.author_name || 'System Author',
      category: postData.category_id || null,
      excerpt: postData.excerpt || '',
      tags: postData.tags || [],
      read_time: calculateReadTime(postData.content || 'No content'),
      featured: postData.featured || false,
      featured_image_url: postData.featured_image_url || null,
      meta_title: postData.meta_title || null,
      meta_description: postData.meta_description || null
    }
    
    console.log('📝 Insert data:', insertData)
    
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating post:', error)
      return NextResponse.json(
        { 
          error: 'Failed to create blog post', 
          message: error.message,
          code: error.code
        },
        { status: 500 }
      )
    }

    console.log('✅ Post created successfully:', data)
    
    return NextResponse.json({
      success: true,
      post: data
    })
    
  } catch (error) {
    console.error('❌ Exception in POST /api/blog/posts/create:', error)
    const errorMessage =
      typeof error === 'object' && error !== null && 'message' in error
        ? (error as { message?: string }).message
        : String(error)
    return NextResponse.json(
      { error: 'Internal server error', message: errorMessage },
      { status: 500 }
    )
  }
}
