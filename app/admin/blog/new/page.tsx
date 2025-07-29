"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { X, Save, Eye, AlertCircle } from 'lucide-react'
import { blogService, BlogCategory, BlogTag } from '@/lib/blog/blog-service'
import { useAuth } from '@/components/auth/auth-provider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import RichTextEditor from '@/components/ui/rich-text-editor'

interface BlogEditorProps {
  postId?: string
}

export default function BlogEditor({ postId }: BlogEditorProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [slug, setSlug] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [published, setPublished] = useState(false)
  const [featured, setFeatured] = useState(false)
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [availableTags, setAvailableTags] = useState<BlogTag[]>([])
  const [newTag, setNewTag] = useState('')
  
  const [loading, setLoading] = useState(!!postId)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    loadInitialData()
  }, [user, router, postId])

  const loadInitialData = async () => {
    console.log('🔄 Loading blog data...');
    
    // Load categories and tags
    try {
      const [categoriesData, tagsData] = await Promise.all([
        blogService.getCategories(),
        blogService.getTags()
      ])
      
      console.log('📁 Loaded categories:', categoriesData);
      console.log('🏷️ Loaded tags:', tagsData);
      
      // Force state update with proper validation
      if (Array.isArray(categoriesData) && categoriesData.length > 0) {
        setCategories(categoriesData)
        console.log('✅ Categories state updated successfully:', categoriesData.length)
      } else {
        console.warn('⚠️ Categories data is empty or invalid:', categoriesData)
        setCategories([])
      }
      
      if (Array.isArray(tagsData)) {
        setAvailableTags(tagsData)
      } else {
        setAvailableTags([])
      }
    } catch (error) {
      console.error('❌ Error loading blog data:', error);
      setErrors(['Failed to load categories and tags. Please refresh the page.']);
    }

    // If editing existing post, load its data
    if (postId) {
      setLoading(true)
      try {
        const post = await blogService.getPostById(postId)
        if (post) {
          setTitle(post.title)
          setContent(post.content)
          setExcerpt(post.excerpt || '')
          setSlug(post.slug)
          setCategoryId(post.category_id)
          setTags(post.tags)
          setPublished(post.published)
          setFeatured(post.featured)
          setMetaTitle(post.meta_title || '')
          setMetaDescription(post.meta_description || '')
          setFeaturedImage(post.featured_image_url || '')
        }
      } catch (error) {
        console.error('❌ Error loading post:', error);
        setErrors(['Failed to load the blog post. Please try again.']);
      }
      setLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!postId && !slug) { // Only auto-generate slug for new posts
      setSlug(generateSlug(value))
    }
  }

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/blog/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      return result.url
    } catch (error) {
      console.error('Image upload error:', error)
      throw error
    }
  }

  const handleSave = async (publishNow = false) => {
    // Clear previous errors
    setErrors([])
    const validationErrors: string[] = []

    // Validate required fields with clear messages
    if (!title.trim()) {
      validationErrors.push('Blog post title is required')
    }
    if (!content.trim()) {
      validationErrors.push('Blog post content is required')
    }
    if (!categoryId) {
      validationErrors.push('Please select a category for your blog post')
    }
    if (!slug.trim()) {
      validationErrors.push('URL slug is required')
    }
    if (!user) {
      validationErrors.push('You must be logged in to create a blog post')
    }
    if (!user?.id) {
      validationErrors.push('User ID is missing - please log in again')
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setSaving(true)
    
    const postData = {
      title,
      content,
      excerpt,
      slug,
      category_id: categoryId,
      tags,
      published: publishNow || published,
      featured,
      meta_title: metaTitle || title,
      meta_description: metaDescription || excerpt,
      featured_image_url: featuredImage,
      author_id: user?.id,
      published_at: (publishNow || published) ? new Date().toISOString() : undefined
    }

    console.log('📝 Post data being sent:', postData)
    console.log('👤 User object:', user)

    let success = false
    if (postId) {
      success = await blogService.updatePost(postId, postData)
    } else {
      const newPost = await blogService.createPost(postData)
      success = !!newPost
    }

    setSaving(false)
    
    if (success) {
      router.push('/admin/blog')
    } else {
      setErrors(['Failed to save blog post. Please check your connection and try again.'])
    }
  }

  if (!user) {
    return <div>Access denied</div>
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading post...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            {postId ? 'Edit Post' : 'New Post'}
          </h2>
          <p className="text-gray-600">
            {postId ? 'Update your blog post' : 'Create a new blog post'}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/blog')}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            <Eye className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-semibold">Please fix the following issues:</p>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>
                Write your blog post content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter post title"
                />
              </div>

              <div>
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="url-friendly-slug"
                />
                <p className="text-sm text-gray-500 mt-1">
                  URL: /blog/{slug}
                </p>
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief description of the post"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <div className="mt-2">
                  <RichTextEditor
                    content={content}
                    onChange={setContent}
                    placeholder="Write your blog post content here..."
                    onImageUpload={handleImageUpload}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Rich text editor with support for formatting, links, and image uploads.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="published">Published</Label>
                <Switch
                  id="published"
                  checked={published}
                  onCheckedChange={setPublished}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Featured</Label>
                <Switch
                  id="featured"
                  checked={featured}
                  onCheckedChange={setFeatured}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category & Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                {/* Debug info */}
                <p className="text-xs text-gray-400 mb-1">
                  Categories loaded: {categories.length} (Debug: {JSON.stringify(categories.map(c => c.name))})
                </p>
                <select 
                  value={categoryId} 
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-md"
                  required
                >
                  <option value="">
                    {categories.length > 0 ? "Select category" : "Loading categories..."}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.slug})
                    </option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <p className="text-sm text-amber-600 mt-1">
                    Failed to load categories. Please refresh the page.
                  </p>
                )}
              </div>
              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag"
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} variant="outline" size="sm">
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="SEO title (defaults to post title)"
                />
              </div>

              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="SEO description (defaults to excerpt)"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="featuredImage">Featured Image</Label>
                <div className="space-y-3 mt-2">
                  <div className="flex gap-2">
                    <Input
                      id="featuredImage"
                      value={featuredImage}
                      onChange={(e) => setFeaturedImage(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = 'image/*'
                        input.onchange = async (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0]
                          if (file) {
                            try {
                              const url = await handleImageUpload(file)
                              setFeaturedImage(url)
                            } catch (error) {
                              alert('Failed to upload image. Please try again.')
                            }
                          }
                        }
                        input.click()
                      }}
                    >
                      Upload
                    </Button>
                  </div>
                  {featuredImage && (
                    <div className="relative">
                      <img 
                        src={featuredImage} 
                        alt="Featured image preview" 
                        className="max-w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  <p className="text-sm text-gray-500">
                    Enter an image URL or upload an image file.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
