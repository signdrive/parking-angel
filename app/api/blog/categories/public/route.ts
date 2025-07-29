import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET: Get all blog categories (public endpoint)
export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Fetching categories from Supabase...')
    
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
    
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('name')

    if (error) {
      console.error('❌ Error fetching categories:', error)
      return NextResponse.json(
        { error: 'Failed to fetch categories', details: error },
        { status: 500 }
      )
    }

    console.log(`✅ Fetched ${data?.length || 0} categories:`, data)
    
    return NextResponse.json({
      success: true,
      categories: data || []
    })
    
  } catch (error) {
    console.error('❌ Exception in GET /api/blog/categories/public:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
