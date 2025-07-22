import { MetadataRoute } from 'next'

// Blog posts data (should match the data in your blog page)
const blogPosts = [
  {
    id: 'how-ai-reduces-parking-congestion',
    date: '2024-01-15',
    category: 'AI Technology',
  },
  {
    id: 'parking-algorithm-case-studies',
    date: '2024-01-10',
    category: 'Case Studies',
  },
  {
    id: 'cost-effective-parking-technology',
    date: '2024-01-08',
    category: 'Business',
  },
  {
    id: 'smart-parking-algorithms-explained',
    date: '2024-01-05',
    category: 'Technology',
  },
  {
    id: 'dynamic-parking-pricing-strategies',
    date: '2024-01-03',
    category: 'Revenue Optimization',
  },
  {
    id: 'cloud-based-parking-management',
    date: '2024-01-01',
    category: 'Infrastructure',
  },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://parkalgo.com'
  
  // Blog main page
  const blogMainPage = {
    url: `${baseUrl}/blog`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }

  // Individual blog posts
  const blogPostPages = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.id}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Blog category pages
  const categories = [...new Set(blogPosts.map(post => post.category))]
  const categoryPages = categories.map((category) => {
    const categorySlug = category.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and')
    return {
      url: `${baseUrl}/blog/category/${categorySlug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }
  })

  return [blogMainPage, ...blogPostPages, ...categoryPages]
}
