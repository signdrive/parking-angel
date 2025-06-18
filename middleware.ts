import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip middleware for static assets and public files
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/static') ||
    request.nextUrl.pathname.startsWith('/api/health') ||
    request.nextUrl.pathname === '/favicon.ico' ||
    request.nextUrl.pathname.startsWith('/public')
  ) {
    return NextResponse.next()
  }

  try {
    let response = NextResponse.next()

    // Check required environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing required environment variables')
      throw new Error('Missing Supabase configuration')
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return request.cookies.get(name)?.value
          },
          set(name, value, options) {
            // Set new cookie
            response.cookies.set({
              name,
              value,
              ...options,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              path: '/',
              domain: process.env.NODE_ENV === 'production' ? '.parkalgo.com' : undefined,
            })
          },
          remove(name, options) {
            // Remove cookie
            response.cookies.set({
              name,
              value: '',
              ...options,
              path: '/',
              domain: process.env.NODE_ENV === 'production' ? '.parkalgo.com' : undefined,
              maxAge: 0
            })
          },
        },
      }
    )

    // Refresh session if needed
    const { data: { session }, error } = await supabase.auth.getSession()

    // Handle auth paths
    if (request.nextUrl.pathname.startsWith('/auth')) {
      if (session) {
        // If logged in and trying to access auth pages, redirect to dashboard
        const redirectUrl = new URL('/dashboard', request.url)
        return NextResponse.redirect(redirectUrl)
      }
      // Allow access to auth pages if not logged in
      return response
    }

    // Handle protected routes
    if (
      request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/profile')
    ) {
      if (!session) {
        // If not logged in, redirect to login
        const redirectUrl = new URL('/auth/login', request.url)
        return NextResponse.redirect(redirectUrl)
      }
    }

    return response
  } catch (e) {
    console.error('Middleware error:', e)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    // Match all paths except static assets
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
