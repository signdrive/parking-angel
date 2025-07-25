"use client"

import { useAuth } from '@/components/auth/auth-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AdminDebugPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="p-8">Loading authentication...</div>
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Access Debug</CardTitle>
          <CardDescription>Debug page to check admin access and authentication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Authentication Status</h3>
            <p>User: {user ? '✅ Authenticated' : '❌ Not authenticated'}</p>
            {user && (
              <div className="mt-2 text-sm text-gray-600">
                <p>Email: {user.email}</p>
                <p>ID: {user.id}</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Admin Routes Test</h3>
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/blog">
                <Button variant="outline">Admin Blog</Button>
              </Link>
              <Link href="/admin/blog/new">
                <Button variant="outline">New Post</Button>
              </Link>
              <Link href="/admin/blog/manage">
                <Button variant="outline">Manage Posts</Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Current URL</h3>
            <p className="text-sm text-gray-600">{typeof window !== 'undefined' ? window.location.href : 'Server-side'}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Environment Check</h3>
            <p className="text-sm text-gray-600">
              Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
