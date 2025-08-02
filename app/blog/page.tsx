"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, Clock, ArrowLeft, TrendingUp, Zap, Users } from 'lucide-react'
import { StructuredData } from '@/components/seo/structured-data'
import { trackPageView, trackUserInteraction } from '@/components/analytics/google-analytics-provider'
import { blogService, BlogPost, BlogCategory } from '@/lib/blog/blog-service'

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    trackPageView('/blog', 'Parking Technology Blog | AI & Smart City Insights')
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [postsData, categoriesData] = await Promise.all([
      blogService.getAllPosts(),
      blogService.getCategories()
    ])
    setPosts(postsData)
    setCategories(categoriesData)
    setLoading(false)
  }

  const handlePostClick = (postSlug: string) => {
    trackUserInteraction('blog_post', `click_${postSlug}`)
  }

  const featuredPosts = posts.filter(post => post.featured)
  const regularPosts = posts.filter(post => !post.featured)

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading blog posts...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Parking Technology Blog
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Expert insights on AI parking optimization, smart city solutions, and the future of parking management technology.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-primary" />
              Featured Articles
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                      <CalendarDays className="w-4 h-4" />
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      {post.read_time && (
                        <>
                          <Clock className="w-4 h-4 ml-4" />
                          <span>{post.read_time} min read</span>
                        </>
                      )}
                    </div>
                    <CardTitle className="text-xl hover:text-primary transition-colors">
                      <Link 
                        href={`/blog/${post.slug}`}
                        onClick={() => handlePostClick(post.slug)}
                      >
                        {post.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="text-muted-foreground leading-relaxed">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-foreground">{post.author_name}</span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-primary font-medium">{post.category}</span>
                      </div>
                      <Link 
                        href={`/blog/${post.slug}`}
                        onClick={() => handlePostClick(post.slug)}
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
                          className="inline-block bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded"
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
        {regularPosts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center">
              <Zap className="w-6 h-6 mr-2 text-green-600" />
              All Articles
            </h2>
            <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
              {regularPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                      <CalendarDays className="w-4 h-4" />
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      {post.read_time && (
                        <>
                          <Clock className="w-4 h-4 ml-4" />
                          <span>{post.read_time} min read</span>
                        </>
                      )}
                    </div>
                    <CardTitle className="text-lg hover:text-primary transition-colors">
                      <Link 
                        href={`/blog/${post.slug}`}
                        onClick={() => handlePostClick(post.slug)}
                      >
                        {post.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-sm leading-relaxed">
                      {post.excerpt ? (post.excerpt.length > 120 ? post.excerpt.substring(0, 120) + '...' : post.excerpt) : 'No excerpt available'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-foreground">{post.author_name}</span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-primary font-medium">{post.category}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="inline-block bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4">
                      <Link 
                        href={`/blog/${post.slug}`}
                        onClick={() => handlePostClick(post.slug)}
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
        )}

        {/* No posts message */}
        {posts.length === 0 && (
          <section className="text-center py-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">No blog posts yet</h2>
            <p className="text-muted-foreground">Check back soon for expert insights on parking technology.</p>
          </section>
        )}

        {/* Categories & Topics */}
        {categories.length > 0 && (
          <section className="mt-16 bg-card rounded-lg border border-border p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
              <Users className="w-6 h-6 mr-2 text-purple-600" />
              Categories
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {categories.slice(0, 6).map((category) => (
                <div key={category.id}>
                  <h3 className="font-semibold text-foreground mb-3">{category.name}</h3>
                  {category.description && (
                    <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                  )}
                  <Link 
                    href={`/blog/category/${category.slug}`} 
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    View posts →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Structured Data */}
      <StructuredData type="website" />
      <StructuredData type="organization" />
    </div>
  )
}


