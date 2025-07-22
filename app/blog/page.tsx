"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, Clock, ArrowLeft, TrendingUp, Zap, Users } from 'lucide-react'
import { StructuredData } from '@/components/seo/structured-data'
import { trackPageView, trackUserInteraction } from '@/components/analytics/google-analytics-provider'
import { useEffect } from 'react'

const blogPosts = [
  {
    id: 'how-ai-reduces-parking-congestion',
    title: 'How AI Reduces Parking Congestion in Urban Areas: 5 Proven Strategies',
    excerpt: 'Discover the 5 most effective AI-powered strategies that smart cities are using to reduce parking congestion by up to 40%. Real case studies and implementation insights.',
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
    author: 'Sarah Chen',
    date: '2024-01-10',
    readTime: '12 min read',
    category: 'Case Studies',
    tags: ['parking algorithm case studies', 'smart cities', 'ROI analysis'],
    featured: true,
  },
  {
    id: 'cost-effective-parking-technology',
    title: 'Cost-Effective Parking Technology: AI vs Traditional Systems ROI',
    excerpt: 'Compare the total cost of ownership between AI-powered parking systems and traditional solutions. Includes implementation costs, maintenance, and revenue impact.',
    author: 'Mike Rodriguez',
    date: '2024-01-08',
    readTime: '6 min read',
    category: 'Business',
    tags: ['cost-effective parking technology', 'ROI analysis', 'parking management software'],
    featured: false,
  },
  {
    id: 'smart-parking-algorithms-explained',
    title: 'Smart Parking Algorithms Explained: Machine Learning in Action',
    excerpt: 'Deep dive into how machine learning algorithms optimize parking space allocation, predict occupancy patterns, and improve user experience.',
    author: 'Dr. Alex Kumar',
    date: '2024-01-05',
    readTime: '10 min read',
    category: 'Technology',
    tags: ['smart parking algorithms', 'machine learning', 'predictive analytics'],
    featured: false,
  },
  {
    id: 'dynamic-parking-pricing-strategies',
    title: 'Dynamic Parking Pricing: Maximizing Revenue with AI',
    excerpt: 'Learn how dynamic pricing algorithms can increase parking revenue by 25-35% while improving space utilization and user satisfaction.',
    author: 'Jennifer Park',
    date: '2024-01-03',
    readTime: '7 min read',
    category: 'Revenue Optimization',
    tags: ['dynamic parking pricing', 'revenue optimization', 'automated parking solutions'],
    featured: false,
  },
  {
    id: 'cloud-based-parking-management',
    title: 'Cloud-Based Parking Management: Scalability and Security',
    excerpt: 'Explore the advantages of cloud-based parking management systems: scalability, security, real-time data processing, and integration capabilities.',
    author: 'David Kim',
    date: '2024-01-01',
    readTime: '9 min read',
    category: 'Infrastructure',
    tags: ['cloud-based parking management', 'scalability', 'parking management software'],
    featured: false,
  },
]

export default function BlogPage() {
  useEffect(() => {
    trackPageView('/blog', 'Parking Technology Blog | AI & Smart City Insights')
  }, [])

  const handlePostClick = (postId: string) => {
    trackUserInteraction('blog_post', `click_${postId}`)
  }

  const featuredPosts = blogPosts.filter(post => post.featured)
  const regularPosts = blogPosts.filter(post => !post.featured)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Parking Technology Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Expert insights on AI parking optimization, smart city solutions, and the future of parking management technology.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
              Featured Articles
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                      <CalendarDays className="w-4 h-4" />
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                      <Clock className="w-4 h-4 ml-4" />
                      <span>{post.readTime}</span>
                    </div>
                    <CardTitle className="text-xl hover:text-blue-600 transition-colors">
                      <Link 
                        href={`/blog/${post.id}`}
                        onClick={() => handlePostClick(post.id)}
                      >
                        {post.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">{post.author}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-blue-600 font-medium">{post.category}</span>
                      </div>
                      <Link 
                        href={`/blog/${post.id}`}
                        onClick={() => handlePostClick(post.id)}
                      >
                        <Button variant="ghost" size="sm">
                          Read More →
                        </Button>
                      </Link>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* All Articles */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
            <Zap className="w-6 h-6 mr-2 text-green-600" />
            All Articles
          </h2>
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
            {regularPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                    <CalendarDays className="w-4 h-4" />
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                    <Clock className="w-4 h-4 ml-4" />
                    <span>{post.readTime}</span>
                  </div>
                  <CardTitle className="text-lg hover:text-blue-600 transition-colors">
                    <Link 
                      href={`/blog/${post.id}`}
                      onClick={() => handlePostClick(post.id)}
                    >
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm leading-relaxed">
                    {post.excerpt.substring(0, 120)}...
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">{post.author}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-blue-600 font-medium">{post.category}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Link 
                      href={`/blog/${post.id}`}
                      onClick={() => handlePostClick(post.id)}
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        Read Article
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Categories & Topics */}
        <section className="mt-16 bg-white rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Users className="w-6 h-6 mr-2 text-purple-600" />
            Popular Topics
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">AI Technology</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/blog/category/ai-technology" className="hover:text-blue-600">Smart Parking Algorithms</Link></li>
                <li><Link href="/blog/category/ai-technology" className="hover:text-blue-600">Machine Learning in Parking</Link></li>
                <li><Link href="/blog/category/ai-technology" className="hover:text-blue-600">Predictive Analytics</Link></li>
                <li><Link href="/blog/category/ai-technology" className="hover:text-blue-600">Computer Vision</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Business & ROI</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/blog/category/business" className="hover:text-blue-600">Cost-Effective Solutions</Link></li>
                <li><Link href="/blog/category/business" className="hover:text-blue-600">Revenue Optimization</Link></li>
                <li><Link href="/blog/category/business" className="hover:text-blue-600">Implementation Strategies</Link></li>
                <li><Link href="/blog/category/business" className="hover:text-blue-600">Market Analysis</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Smart Cities</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/blog/category/smart-cities" className="hover:text-blue-600">Urban Planning</Link></li>
                <li><Link href="/blog/category/smart-cities" className="hover:text-blue-600">Traffic Management</Link></li>
                <li><Link href="/blog/category/smart-cities" className="hover:text-blue-600">Sustainability</Link></li>
                <li><Link href="/blog/category/smart-cities" className="hover:text-blue-600">Public Policy</Link></li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* Structured Data */}
      <StructuredData type="website" />
      <StructuredData type="organization" />
    </div>
  )
}
