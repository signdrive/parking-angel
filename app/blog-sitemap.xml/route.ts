import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // Fetch all published blog posts
    const { data: posts, error: postsError } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (postsError) {
      console.error('Error fetching blog posts:', postsError)
      return new NextResponse('Error fetching blog posts', { status: 500 })
    }

    // Fetch all categories with published posts
    const { data: categories, error: categoriesError } = await supabase
      .from('blog_categories')
      .select(`
        slug, 
        updated_at,
        blog_posts!inner(published)
      `)
      .eq('blog_posts.published', true)

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError)
    }

    // Fetch all tags with published posts
    const { data: tags, error: tagsError } = await supabase
      .from('blog_tags')
      .select(`
        slug, 
        updated_at,
        blog_post_tags!inner(
          blog_posts!inner(published)
        )
      `)
      .eq('blog_post_tags.blog_posts.published', true)

    if (tagsError) {
      console.error('Error fetching tags:', tagsError)
    }

    const baseUrl = 'https://parkalgo.com'
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Blog Index -->
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`

    // Add blog posts
    if (posts && posts.length > 0) {
      for (const post of posts) {
        const lastmod = post.updated_at || post.created_at
        sitemap += `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${new Date(lastmod).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
      }
    }

    // Add category pages
    if (categories && categories.length > 0) {
      for (const category of categories) {
        sitemap += `
  <url>
    <loc>${baseUrl}/blog/category/${category.slug}</loc>
    <lastmod>${new Date(category.updated_at || new Date()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
      }
    }

    // Add tag pages
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        sitemap += `
  <url>
    <loc>${baseUrl}/blog/tag/${tag.slug}</loc>
    <lastmod>${new Date(tag.updated_at || new Date()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`
      }
    }

    sitemap += `
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Error generating blog sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}
