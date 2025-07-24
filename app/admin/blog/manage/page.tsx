"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, X } from 'lucide-react'
import { blogService, BlogCategory, BlogTag } from '@/lib/blog/blog-service'
import { useAuth } from '@/components/auth/auth-provider'

export default function BlogManagementPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [tags, setTags] = useState<BlogTag[]>([])
  const [loading, setLoading] = useState(true)
  
  // Category form state
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategorySlug, setNewCategorySlug] = useState('')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null)
  
  // Tag form state
  const [newTagName, setNewTagName] = useState('')
  const [newTagSlug, setNewTagSlug] = useState('')
  const [newTagColor, setNewTagColor] = useState('#3B82F6')
  const [editingTag, setEditingTag] = useState<BlogTag | null>(null)

  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    setLoading(true)
    const [categoriesData, tagsData] = await Promise.all([
      blogService.getCategories(),
      blogService.getTags()
    ])
    setCategories(categoriesData)
    setTags(tagsData)
    setLoading(false)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  // Category functions
  const handleCategoryNameChange = (name: string) => {
    setNewCategoryName(name)
    if (!editingCategory) {
      setNewCategorySlug(generateSlug(name))
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName || !newCategorySlug) return
    
    const category = await blogService.createCategory({
      name: newCategoryName,
      slug: newCategorySlug,
      description: newCategoryDescription
    })
    
    if (category) {
      setNewCategoryName('')
      setNewCategorySlug('')
      setNewCategoryDescription('')
      loadData()
    }
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory || !newCategoryName || !newCategorySlug) return
    
    const updated = await blogService.updateCategory(editingCategory.id, {
      name: newCategoryName,
      slug: newCategorySlug,
      description: newCategoryDescription
    })
    
    if (updated) {
      setEditingCategory(null)
      setNewCategoryName('')
      setNewCategorySlug('')
      setNewCategoryDescription('')
      loadData()
    }
  }

  const handleEditCategory = (category: BlogCategory) => {
    setEditingCategory(category)
    setNewCategoryName(category.name)
    setNewCategorySlug(category.slug)
    setNewCategoryDescription(category.description || '')
  }

  const handleDeleteCategory = async (category: BlogCategory) => {
    if (confirm(`Delete category "${category.name}"? This action cannot be undone.`)) {
      const deleted = await blogService.deleteCategory(category.id)
      if (deleted) {
        loadData()
      }
    }
  }

  // Tag functions
  const handleTagNameChange = (name: string) => {
    setNewTagName(name)
    if (!editingTag) {
      setNewTagSlug(generateSlug(name))
    }
  }

  const handleCreateTag = async () => {
    if (!newTagName || !newTagSlug) return
    
    const tag = await blogService.createTag({
      name: newTagName,
      slug: newTagSlug,
      color: newTagColor
    })
    
    if (tag) {
      setNewTagName('')
      setNewTagSlug('')
      setNewTagColor('#3B82F6')
      loadData()
    }
  }

  const handleUpdateTag = async () => {
    if (!editingTag || !newTagName || !newTagSlug) return
    
    const updated = await blogService.updateTag(editingTag.id, {
      name: newTagName,
      slug: newTagSlug,
      color: newTagColor
    })
    
    if (updated) {
      setEditingTag(null)
      setNewTagName('')
      setNewTagSlug('')
      setNewTagColor('#3B82F6')
      loadData()
    }
  }

  const handleEditTag = (tag: BlogTag) => {
    setEditingTag(tag)
    setNewTagName(tag.name)
    setNewTagSlug(tag.slug)
    setNewTagColor(tag.color || '#3B82F6')
  }

  const handleDeleteTag = async (tag: BlogTag) => {
    if (confirm(`Delete tag "${tag.name}"? This action cannot be undone.`)) {
      const deleted = await blogService.deleteTag(tag.id)
      if (deleted) {
        loadData()
      }
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
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Blog Management</h2>
        <p className="text-gray-600">Manage blog categories and tags</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Categories Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>
                Organize your blog posts into categories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Category Form */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h4>
                <div>
                  <Label htmlFor="categoryName">Name</Label>
                  <Input
                    id="categoryName"
                    value={newCategoryName}
                    onChange={(e) => handleCategoryNameChange(e.target.value)}
                    placeholder="Category name"
                  />
                </div>
                <div>
                  <Label htmlFor="categorySlug">Slug</Label>
                  <Input
                    id="categorySlug"
                    value={newCategorySlug}
                    onChange={(e) => setNewCategorySlug(e.target.value)}
                    placeholder="category-slug"
                  />
                </div>
                <div>
                  <Label htmlFor="categoryDescription">Description</Label>
                  <Textarea
                    id="categoryDescription"
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    placeholder="Category description"
                    rows={2}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                    disabled={!newCategoryName || !newCategorySlug}
                  >
                    {editingCategory ? 'Update' : 'Create'}
                  </Button>
                  {editingCategory && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setEditingCategory(null)
                        setNewCategoryName('')
                        setNewCategorySlug('')
                        setNewCategoryDescription('')
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>

              {/* Categories List */}
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm text-gray-500">/{category.slug}</div>
                      {category.description && (
                        <div className="text-sm text-gray-600 mt-1">{category.description}</div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCategory(category)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tags Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>
                Create tags to label your blog posts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tag Form */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium">
                  {editingTag ? 'Edit Tag' : 'Add New Tag'}
                </h4>
                <div>
                  <Label htmlFor="tagName">Name</Label>
                  <Input
                    id="tagName"
                    value={newTagName}
                    onChange={(e) => handleTagNameChange(e.target.value)}
                    placeholder="Tag name"
                  />
                </div>
                <div>
                  <Label htmlFor="tagSlug">Slug</Label>
                  <Input
                    id="tagSlug"
                    value={newTagSlug}
                    onChange={(e) => setNewTagSlug(e.target.value)}
                    placeholder="tag-slug"
                  />
                </div>
                <div>
                  <Label htmlFor="tagColor">Color</Label>
                  <Input
                    id="tagColor"
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="w-20 h-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={editingTag ? handleUpdateTag : handleCreateTag}
                    disabled={!newTagName || !newTagSlug}
                  >
                    {editingTag ? 'Update' : 'Create'}
                  </Button>
                  {editingTag && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setEditingTag(null)
                        setNewTagName('')
                        setNewTagSlug('')
                        setNewTagColor('#3B82F6')
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>

              {/* Tags List */}
              <div className="space-y-2">
                {tags.map((tag) => (
                  <div key={tag.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: tag.color || '#3B82F6' }}
                      />
                      <div>
                        <div className="font-medium">{tag.name}</div>
                        <div className="text-sm text-gray-500">/{tag.slug}</div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTag(tag)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTag(tag)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
