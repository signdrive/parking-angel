import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

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
    
    // Clean the data - only include fields that should be in the database
    const insertData = {
      title: postData.title,
      content: postData.content,
      excerpt: postData.excerpt || '',
      slug: postData.slug,
      category_id: postData.category_id,
      tags: postData.tags || [],
      published: postData.published || false,
      featured: postData.featured || false,
      meta_title: postData.meta_title || postData.title,
      meta_description: postData.meta_description || postData.excerpt || '',
      featured_image_url: postData.featured_image_url || '',
      author_id: postData.author_id,
      published_at: postData.published_at,
      read_time: postData.content ? calculateReadTime(postData.content) : 1
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
        { error: 'Failed to create blog post', details: error },
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
