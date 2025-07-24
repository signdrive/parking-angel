import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Blog Admin - ParkAlgo',
  description: 'Manage blog posts and content',
  robots: 'noindex, nofollow'
}

export default function BlogAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/" className="text-xl font-bold text-blue-600">
                ParkAlgo
              </Link>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600">Blog Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin/blog" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md"
              >
                Posts
              </Link>
              <Link 
                href="/admin/blog/manage" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md"
              >
                Categories & Tags
              </Link>
              <Link 
                href="/admin/blog/new" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                New Post
              </Link>
            </div>
          </nav>
        </div>
      </header>
      <main>
        {children}
      </main>
    </div>
  )
}
