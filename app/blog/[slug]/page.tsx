import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CalendarDays, Clock, ArrowLeft, Tag } from 'lucide-react'
import { StructuredData } from '@/components/seo/structured-data'
import { serverBlogService } from '@/lib/blog/server-blog-service'

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await serverBlogService.getPostBySlug(params.slug)
  
  if (!post) {
    return {
      title: 'Post Not Found | ParkAlgo Blog',
      description: 'The requested blog post could not be found.'
    }
  }

  return {
    title: post.meta_title || `${post.title} | ParkAlgo Blog`,
    description: post.meta_description || post.excerpt || `Read about ${post.title} on the ParkAlgo blog.`,
    keywords: post.tags.join(', '),
    authors: [{ name: post.author_name }],
    openGraph: {
      title: post.title,
      description: post.excerpt || '',
      type: 'article',
      publishedTime: post.published_at || post.created_at,
      authors: [post.author_name],
      tags: post.tags,
      images: post.featured_image_url ? [post.featured_image_url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || '',
      images: post.featured_image_url ? [post.featured_image_url] : [],
    }
  }
}

// Convert markdown-like content to HTML (simple implementation)
function formatContent(content: string): string {
  return content
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gray-900 mb-6">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-gray-900 mb-4 mt-8">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-gray-900 mb-3 mt-6">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/\n\n/g, '</p><p class="text-gray-700 leading-relaxed mb-4">')
    .replace(/^\s*\n/gm, '')
    .trim()
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await serverBlogService.getPostBySlug(params.slug)
  
  if (!post || !post.published) {
    notFound()
  }

  const formattedContent = formatContent(post.content)
  const relatedPosts = await serverBlogService.getPostsByCategory(post.category_id, 3, [post.id])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-4 mb-6">
            <Link href="/blog">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
          
          <article className="max-w-4xl mx-auto">
            <header className="text-center mb-8">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                  {post.category}
                </span>
                <div className="flex items-center space-x-2">
                  <CalendarDays className="w-4 h-4" />
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
                {post.read_time && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{post.read_time} min read</span>
                  </div>
                )}
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {post.title}
              </h1>
              
              {post.excerpt && (
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  {post.excerpt}
                </p>
              )}
              
              <div className="flex items-center justify-center space-x-4 mt-6 text-sm text-gray-600">
                <span>By <strong>{post.author_name}</strong></span>
              </div>
              
              {post.tags.length > 0 && (
                <div className="flex items-center justify-center flex-wrap gap-2 mt-4">
                  <Tag className="w-4 h-4 text-gray-500" />
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {post.featured_image_url && (
              <div className="mb-8">
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}
          </article>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <article className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: `<p class="text-gray-700 leading-relaxed mb-4">${formattedContent}</p>` 
              }}
            />
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Articles</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <div key={relatedPost.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    <Link 
                      href={`/blog/${relatedPost.slug}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {relatedPost.title}
                    </Link>
                  </h3>
                  {relatedPost.excerpt && (
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {relatedPost.excerpt.length > 100 
                        ? relatedPost.excerpt.substring(0, 100) + '...' 
                        : relatedPost.excerpt
                      }
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{new Date(relatedPost.created_at).toLocaleDateString()}</span>
                    {relatedPost.read_time && <span>{relatedPost.read_time} min read</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Structured Data */}
      <StructuredData 
        type="article" 
        data={{
          headline: post.title,
          description: post.excerpt || '',
          author: post.author_name,
          datePublished: post.published_at || post.created_at,
          dateModified: post.updated_at,
          image: post.featured_image_url || '',
          keywords: post.tags.join(', ')
        }}
      />
    </div>
  )
}
