import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Test connection first
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    
    if (testError && testError.code !== 'PGRST116') {
      return NextResponse.json({ 
        success: false, 
        error: 'Database connection failed',
        details: testError 
      })
    }
    
    // Check if tables exist
    const tables = ['blog_categories', 'blog_tags', 'blog_posts']
    const tableStatus: Record<string, string> = {}
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('id')
          .limit(1)
        
        tableStatus[table] = error ? 'missing' : 'exists'
      } catch (err) {
        tableStatus[table] = 'error'
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Blog setup status check completed',
      tableStatus,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Setup API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
