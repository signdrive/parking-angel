import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, Clock, ArrowLeft, Tag } from 'lucide-react'
import { serverBlogService } from '@/lib/blog/server-blog-service'

interface TagPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params
  const tag = await serverBlogService.getTagBySlug(slug)
  
  if (!tag) {
    return {
      title: 'Tag Not Found | ParkAlgo Blog',
      description: 'The requested tag could not be found.'
    }
  }

  const canonicalUrl = `https://parkalgo.com/blog/tag/${slug}`

  return {
    title: `#${tag.name} | ParkAlgo Blog`,
    description: `Read all articles tagged with ${tag.name} on ParkAlgo blog.`,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title: `#${tag.name} - ParkAlgo Blog`,
      description: `Articles tagged with ${tag.name}`,
      type: 'website',
      url: canonicalUrl
    }
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params
  const tag = await serverBlogService.getTagBySlug(slug)
  
  if (!tag) {
    notFound()
  }

  const posts = await serverBlogService.getPostsByTag(tag.name)

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
            <div className="flex items-center justify-center mb-4">
              <div 
                className="w-6 h-6 rounded mr-3"
                style={{ backgroundColor: tag.color || '#3B82F6' }}
              />
              <h1 className="text-4xl font-bold text-gray-900">
                #{tag.name}
              </h1>
            </div>
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
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      {post.category}
                    </span>
                    <CalendarDays className="w-4 h-4 ml-2" />
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
                      {post.tags.map((postTag) => (
                        <span
                          key={postTag}
                          className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${
                            postTag === tag.name 
                              ? 'bg-blue-100 text-blue-700 font-medium' 
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <Tag className="w-3 h-3" />
                          {postTag}
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No articles with this tag yet</h2>
            <p className="text-gray-600 mb-6">Check back soon for new content tagged with #{tag.name}.</p>
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
