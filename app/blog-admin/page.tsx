"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Edit, Eye, Settings, Plus, FileText, Tag, Folder } from 'lucide-react'

export default function BlogAdminQuickAccess() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Blog Management Center
          </h1>
          <p className="text-xl text-gray-600">
            Quick access to all blog administration features
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Main Admin Dashboard */}
          <Link href="/admin/blog">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-500">
              <div className="flex items-center mb-4">
                <Edit className="w-8 h-8 text-blue-500 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Blog Dashboard</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Main admin interface for managing all blog content
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Open Dashboard
              </Button>
            </div>
          </Link>

          {/* Create New Post */}
          <Link href="/admin/blog/new">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-green-500">
              <div className="flex items-center mb-4">
                <Plus className="w-8 h-8 text-green-500 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">New Post</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Create a new blog post with rich editor
              </p>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                Create Post
              </Button>
            </div>
          </Link>

          {/* Manage Categories & Tags */}
          <Link href="/admin/blog/manage">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-purple-500">
              <div className="flex items-center mb-4">
                <Settings className="w-8 h-8 text-purple-500 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Manage</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Organize categories and tags
              </p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Manage Content
              </Button>
            </div>
          </Link>

          {/* View Public Blog */}
          <Link href="/blog">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-orange-500">
              <div className="flex items-center mb-4">
                <Eye className="w-8 h-8 text-orange-500 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Public Blog</h2>
              </div>
              <p className="text-gray-600 mb-4">
                View the blog as visitors see it
              </p>
              <Button className="w-full bg-orange-600 hover:bg-orange-700">
                View Blog
              </Button>
            </div>
          </Link>

          {/* Database Setup */}
          <Link href="/api/blog/setup">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-red-500">
              <div className="flex items-center mb-4">
                <FileText className="w-8 h-8 text-red-500 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Setup Check</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Verify database tables and connection
              </p>
              <Button className="w-full bg-red-600 hover:bg-red-700">
                Check Setup
              </Button>
            </div>
          </Link>

          {/* n8n Integration */}
          <Link href="/n8n-test">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-indigo-500">
              <div className="flex items-center mb-4">
                <Tag className="w-8 h-8 text-indigo-500 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">n8n Integration</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Test API endpoints for automation
              </p>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                Test n8n API
              </Button>
            </div>
          </Link>

          {/* Documentation */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-500">
            <div className="flex items-center mb-4">
              <FileText className="w-8 h-8 text-gray-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Documentation</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Complete blog system documentation
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">• BLOG_README.md</p>
              <p className="text-sm text-gray-500">• database/blog_schema_updated.sql</p>
              <p className="text-sm text-gray-500">• Complete feature list</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            <Button asChild variant="outline">
              <Link href="/admin/blog" className="flex items-center">
                <Folder className="w-4 h-4 mr-2" />
                All Posts
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/blog/new" className="flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/blog/manage" className="flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                Categories
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/blog" className="flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                View Blog
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/n8n-test" className="flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                n8n API Test
              </Link>
            </Button>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <p className="text-green-800 font-medium">
              Blog system is fully operational and ready for content creation!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
