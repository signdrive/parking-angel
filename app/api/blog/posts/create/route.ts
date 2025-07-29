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
    
    // Minimal data - only required fields
    const insertData = {
      title: postData.title || 'Untitled',
      content: postData.content || 'No content',
      slug: postData.slug || 'untitled-' + Date.now(),
      published: false
    }
    
    console.log('📝 Minimal insert data:', insertData)
    
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
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
