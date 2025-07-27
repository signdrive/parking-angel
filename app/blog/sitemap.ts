import { MetadataRoute } from 'next'
import { serverBlogService } from '@/lib/blog/server-blog-service'

// Revalidate every 3600 seconds (1 hour) to pick up new posts
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://parkalgo.com'
  
  try {
    // Fetch all published blog posts from database
    const blogPosts = await serverBlogService.getAllPosts(true)
    
    // Blog main page
    const blogMainPage = {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }

    // Individual blog posts - dynamically generated from database
    const blogPostPages = blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at || post.created_at),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

    // Get categories from posts (since we don't have a categories table)
    const categories = await serverBlogService.getCategories()
    const categoryPages = categories.map((category) => ({
      url: `${baseUrl}/blog/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    // Get tags from posts
    const tags = await serverBlogService.getTags()
    const tagPages = tags.map((tag) => ({
      url: `${baseUrl}/blog/tag/${tag.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }))

    return [blogMainPage, ...blogPostPages, ...categoryPages, ...tagPages]
  } catch (error) {
    console.error('Error generating blog sitemap:', error)
    
    // Return minimal sitemap if database fails
    return [
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }
    ]
  }
}
