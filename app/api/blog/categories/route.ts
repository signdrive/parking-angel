import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

// Interface for n8n category data
interface N8nCategory {
  name: string
  slug?: string
  description?: string
  color?: string
}

// Utility function to generate slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// POST: Create a new category via n8n
export async function POST(request: NextRequest) {
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

    const supabase = createClient()
    const categoryData: N8nCategory = await request.json()

    // Validate required fields
    if (!categoryData.name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    // Generate slug if not provided
    const slug = categoryData.slug || generateSlug(categoryData.name)

    // Check if category with this slug already exists
    const { data: existingCategory } = await supabase
      .from('blog_categories')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingCategory) {
      return NextResponse.json(
        { error: `Category with slug "${slug}" already exists` },
        { status: 409 }
      )
    }

    // Prepare category data
    const newCategoryData = {
      name: categoryData.name,
      slug,
      description: categoryData.description || null,
      color: categoryData.color || '#3B82F6', // Default blue
      created_at: new Date().toISOString()
    }

    // Insert the category
    const { data: newCategory, error } = await supabase
      .from('blog_categories')
      .insert([newCategoryData])
      .select()
      .single()

    if (error) {
      console.error('Error creating category:', error)
      return NextResponse.json(
        { error: 'Failed to create category', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      category: newCategory
    }, { status: 201 })

  } catch (error) {
    console.error('Error in category API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET: Retrieve categories
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

    const supabase = createClient()
    
    const { data: categories, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('name')

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      count: categories?.length || 0,
      categories: categories || []
    })

  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
