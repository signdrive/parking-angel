import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, Clock, ArrowLeft, Tag } from 'lucide-react'
import { serverBlogService } from '@/lib/blog/server-blog-service'

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await serverBlogService.getCategoryBySlug(params.slug)
  
  if (!category) {
    return {
      title: 'Category Not Found | ParkAlgo Blog',
      description: 'The requested category could not be found.'
    }
  }

  return {
    title: `${category.name} | ParkAlgo Blog`,
    description: category.description || `Read all articles in the ${category.name} category on ParkAlgo blog.`,
    openGraph: {
      title: `${category.name} - ParkAlgo Blog`,
      description: category.description || `Articles about ${category.name}`,
      type: 'website',
    }
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await serverBlogService.getCategoryBySlug(params.slug)
  
  if (!category) {
    notFound()
  }

  const posts = await serverBlogService.getPostsByCategory(category.id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/blog">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {category.description}
              </p>
            )}
            <div className="mt-4">
              <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                {posts.length} {posts.length === 1 ? 'Article' : 'Articles'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {posts.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                    <CalendarDays className="w-4 h-4" />
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    {post.read_time && (
                      <>
                        <Clock className="w-4 h-4 ml-4" />
                        <span>{post.read_time} min read</span>
                      </>
                    )}
                    {post.featured && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium ml-2">
                        Featured
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-xl hover:text-blue-600 transition-colors">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">{post.author_name}</span>
                    </div>
                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="ghost" size="sm">
                        Read More →
                      </Button>
                    </Link>
                  </div>
                  
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No articles in this category yet</h2>
            <p className="text-gray-600 mb-6">Check back soon for new content in {category.name}.</p>
            <Link href="/blog">
              <Button>
                Browse All Articles
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
