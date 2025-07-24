"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Copy, Send, Eye, Key } from 'lucide-react'

export default function N8nBlogTester() {
  const [apiKey, setApiKey] = useState('')
  const [postData, setPostData] = useState({
    title: 'Test Post from n8n',
    content: '<h2>Introduction</h2><p>This is a test post created via the n8n API integration.</p><p>It demonstrates how external systems can automatically create blog content.</p>',
    excerpt: 'A test post demonstrating n8n integration',
    category_slug: 'technology',
    tags: ['test', 'n8n', 'automation'],
    published: false,
    featured: false
  })
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testCreatePost = async () => {
    if (!apiKey) {
      alert('Please enter an API key')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/blog/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify(postData)
      })
      
      const data = await res.json()
      setResponse({ status: res.status, data })
    } catch (error) {
      setResponse({ status: 'error', data: { error: error instanceof Error ? error.message : 'Unknown error' } })
    } finally {
      setLoading(false)
    }
  }

  const testGetPosts = async () => {
    if (!apiKey) {
      alert('Please enter an API key')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/blog/posts?limit=5', {
        headers: {
          'x-api-key': apiKey
        }
      })
      
      const data = await res.json()
      setResponse({ status: res.status, data })
    } catch (error) {
      setResponse({ status: 'error', data: { error: error instanceof Error ? error.message : 'Unknown error' } })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const curlExample = `curl -X POST http://localhost:3000/api/blog/posts \\
  -H "x-api-key: ${apiKey || 'your-api-key'}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(postData, null, 2)}'`

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            n8n Blog API Tester
          </h1>
          <p className="text-gray-600">
            Test the blog API endpoints that n8n can use to create content
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  API Configuration
                </CardTitle>
                <CardDescription>
                  Set up your API key and test data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">API Key</label>
                  <Input
                    type="password"
                    placeholder="Enter your N8N_BLOG_API_KEY"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Set N8N_BLOG_API_KEY in your environment variables
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Post Data</CardTitle>
                <CardDescription>
                  Configure the blog post data to send
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <Input
                    value={postData.title}
                    onChange={(e) => setPostData({...postData, title: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Content (HTML)</label>
                  <Textarea
                    rows={4}
                    value={postData.content}
                    onChange={(e) => setPostData({...postData, content: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Excerpt</label>
                  <Input
                    value={postData.excerpt}
                    onChange={(e) => setPostData({...postData, excerpt: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Category Slug</label>
                  <Input
                    value={postData.category_slug}
                    onChange={(e) => setPostData({...postData, category_slug: e.target.value})}
                  />
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={postData.published}
                      onChange={(e) => setPostData({...postData, published: e.target.checked})}
                      className="mr-2"
                    />
                    Published
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={postData.featured}
                      onChange={(e) => setPostData({...postData, featured: e.target.checked})}
                      className="mr-2"
                    />
                    Featured
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={testCreatePost} 
                  disabled={loading}
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? 'Creating...' : 'Create Blog Post'}
                </Button>
                
                <Button 
                  onClick={testGetPosts} 
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {loading ? 'Loading...' : 'Get Blog Posts'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>cURL Example</CardTitle>
                <CardDescription>
                  Copy this command to test from terminal or n8n
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                    {curlExample}
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(curlExample)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {response && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    API Response
                    <Badge 
                      variant={response.status === 201 ? "default" : "destructive"}
                      className="ml-2"
                    >
                      {response.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                      {JSON.stringify(response.data, null, 2)}
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(JSON.stringify(response.data, null, 2))}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>n8n Workflow Example</CardTitle>
                <CardDescription>
                  Use this JSON in your n8n HTTP Request node
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
{`{
  "method": "POST",
  "url": "https://your-domain.com/api/blog/posts",
  "headers": {
    "x-api-key": "{{$env.N8N_BLOG_API_KEY}}",
    "Content-Type": "application/json"
  },
  "body": {
    "title": "{{$json.title}}",
    "content": "{{$json.content}}",
    "category_slug": "news",
    "tags": ["automated"],
    "published": true
  }
}`}
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(`{
  "method": "POST",
  "url": "https://your-domain.com/api/blog/posts",
  "headers": {
    "x-api-key": "{{$env.N8N_BLOG_API_KEY}}",
    "Content-Type": "application/json"
  },
  "body": {
    "title": "{{$json.title}}",
    "content": "{{$json.content}}",
    "category_slug": "news",
    "tags": ["automated"],
    "published": true
  }
}`)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 text-center space-x-4">
          <Button asChild variant="outline">
            <a href="/admin/blog" target="_blank">Blog Admin</a>
          </Button>
          <Button asChild variant="outline">
            <a href="/blog" target="_blank">Public Blog</a>
          </Button>
          <Button asChild variant="outline">
            <a href="/api/blog/setup" target="_blank">API Setup</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
