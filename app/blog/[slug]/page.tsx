import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Script from 'next/script'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  date: string
  readTime: string
  category: string
  tags: string[]
  featured: boolean
}

// Blog posts data (should match your blog page data)
const blogPosts: BlogPost[] = [
  {
    id: 'how-ai-reduces-parking-congestion',
    title: 'How AI Reduces Parking Congestion in Urban Areas: 5 Proven Strategies',
    excerpt: 'Discover the 5 most effective AI-powered strategies that smart cities are using to reduce parking congestion by up to 40%. Real case studies and implementation insights.',
    content: `
# How AI Reduces Parking Congestion in Urban Areas: 5 Proven Strategies

Parking congestion in urban areas is a growing problem that affects millions of drivers daily. However, artificial intelligence (AI) is revolutionizing how cities approach parking management, offering solutions that can reduce congestion by up to 40%.

## 1. Real-Time Occupancy Detection

AI-powered sensors and computer vision systems can detect parking space availability in real-time, providing drivers with accurate information about available spots before they start circling blocks.

## 2. Predictive Analytics for Peak Hours

Machine learning algorithms analyze historical data to predict when and where parking demand will be highest, allowing cities to implement dynamic pricing and direct traffic flow accordingly.

## 3. Smart Routing and Navigation

AI systems can route drivers to the most optimal parking locations based on their destination, reducing unnecessary traffic in congested areas.

## 4. Dynamic Pricing Optimization

Demand-based pricing algorithms adjust parking rates in real-time to balance supply and demand, encouraging turnover in high-demand areas.

## 5. Integrated Mobility Solutions

AI platforms can integrate parking with public transportation, ride-sharing, and other mobility options to provide comprehensive urban transportation solutions.

## Case Studies

Cities like San Francisco, Barcelona, and Singapore have implemented these strategies with remarkable success, seeing significant reductions in parking-related congestion and improvements in air quality.
    `,
    author: 'Parkalgo Team',
    date: '2024-01-15',
    readTime: '8 min read',
    category: 'AI Technology',
    tags: ['AI parking optimization', 'urban planning', 'smart cities'],
    featured: true,
  },
  {
    id: 'parking-algorithm-case-studies',
    title: 'Parking Algorithm Case Studies: Real Results from Smart Cities',
    excerpt: 'Explore detailed case studies from 3 major cities that implemented smart parking algorithms. See the ROI, efficiency gains, and user satisfaction metrics.',
    content: `
# Parking Algorithm Case Studies: Real Results from Smart Cities

This comprehensive analysis examines how three major cities implemented smart parking algorithms and the measurable results they achieved.

## San Francisco: ParkSense Implementation

San Francisco's implementation of AI-powered parking algorithms resulted in:
- 35% reduction in time spent searching for parking
- 28% increase in parking revenue
- 22% reduction in traffic congestion
- 85% user satisfaction rate

## Barcelona: Smart Parking Ecosystem

Barcelona's comprehensive smart parking solution delivered:
- 40% improvement in parking space utilization
- 30% reduction in emissions from parking-related traffic
- €2.3M annual revenue increase
- 90% merchant satisfaction in commercial districts

## Singapore: Integrated Mobility Platform

Singapore's integrated approach combining parking with public transport showed:
- 45% reduction in peak-hour parking demand in CBD
- 50% increase in public transport usage
- 95% system reliability and uptime
- S$5.2M in operational cost savings annually

## Key Success Factors

1. **Data Integration**: All successful implementations relied on comprehensive data collection and integration
2. **User Experience**: Intuitive mobile apps and clear signage were crucial for adoption
3. **Dynamic Pricing**: Flexible pricing models that respond to demand patterns
4. **Stakeholder Buy-in**: Strong support from government, businesses, and citizens

## Lessons Learned

The most successful implementations focused on solving specific local challenges rather than implementing generic solutions.
    `,
    author: 'Sarah Chen',
    date: '2024-01-10',
    readTime: '12 min read',
    category: 'Case Studies',
    tags: ['parking algorithm case studies', 'smart cities', 'ROI analysis'],
    featured: true,
  },
  // Add other blog posts here...
]

interface Props {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.id,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = blogPosts.find((post) => post.id === params.slug)
  
  if (!post) {
    return {
      title: 'Blog Post Not Found | Parkalgo',
    }
  }

  return {
    title: `${post.title} | Parkalgo Blog`,
    description: post.excerpt,
    keywords: post.tags.join(', '),
    authors: [{ name: post.author }],
    alternates: {
      canonical: `https://parkalgo.com/blog/${post.id}`
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      url: `https://parkalgo.com/blog/${post.id}`,
      siteName: 'Parkalgo Blog',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  }
}

export default function BlogPostPage({ params }: Props) {
  const post = blogPosts.find((post) => post.id === params.slug)

  if (!post) {
    notFound()
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Parkalgo',
      logo: {
        '@type': 'ImageObject',
        url: 'https://parkalgo.com/logo.png',
      },
    },
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://parkalgo.com/blog/${post.id}`,
    },
    keywords: post.tags.join(', '),
    articleSection: post.category,
  }

  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <article className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-12">
            <div className="mb-6">
              <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                {post.category}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center space-x-4 text-gray-600 mb-8">
              <span>By {post.author}</span>
              <span>•</span>
              <time>{new Date(post.date).toLocaleDateString()}</time>
              <span>•</span>
              <span>{post.readTime}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Enjoyed this article? Share it with your network!
              </p>
              <div className="flex justify-center space-x-4">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://parkalgo.com/blog/${post.id}`)}`}
                  className="text-blue-600 hover:text-blue-800"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Share on Twitter
                </a>
                <a
                  href={`https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://parkalgo.com/blog/${post.id}`)}`}
                  className="text-blue-600 hover:text-blue-800"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Share on LinkedIn
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </article>
    </>
  )
}
