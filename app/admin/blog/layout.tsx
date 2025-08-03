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
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/" className="text-xl font-bold text-primary">
                ParkAlgo
              </Link>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">Blog Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin/blog" 
                className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md"
              >
                Posts
              </Link>
              <Link 
                href="/admin/blog/manage" 
                className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md"
              >
                Categories & Tags
              </Link>
              <Link 
                href="/admin/blog/new" 
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
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
