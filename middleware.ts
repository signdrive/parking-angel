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
    const res = NextResponse.next()

    // Check required environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing required environment variables:', {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      })
      throw new Error('Missing Supabase configuration')
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get: (name) => {
            const cookie = request.cookies.get(name)
            console.debug('Getting cookie:', name, !!cookie)
            return cookie?.value
          },
          set: (name, value, options) => {
            console.debug('Setting cookie:', name, !!value)
            res.cookies.set({
              name,
              value,
              ...options,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              path: '/',
            })
          },
          remove: (name, options) => {
            console.debug('Removing cookie:', name)
            res.cookies.delete({
              name,
              ...options,
              path: '/',
            })
          },
        },
      }
    )

    // Get and validate session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Session error in middleware:', {
        error: sessionError,
        path: request.nextUrl.pathname,
      })
      
      // Check if this is an API route
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({
          error: 'Authentication error',
          error_code: 'auth_error',
          msg: sessionError.message
        }, { status: 401 })
      }
      
      // For non-API routes, redirect to login if needed
      const isAuthRoute = request.nextUrl.pathname.startsWith('/auth/')
      if (!isAuthRoute) {
        const redirectUrl = new URL('/auth/login', request.url)
        redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }
    }

    // Add user context to headers if authenticated
    if (session?.user) {
      res.headers.set('x-user-id', session.user.id)
      if (session.user.role) {
        res.headers.set('x-user-role', session.user.role)
      }
      res.headers.set('x-session-active', 'true')
    }

    // Log request details for debugging
    console.debug('Middleware processed:', {
      path: request.nextUrl.pathname,
      authenticated: !!session,
      method: request.method,
    })

    return res
  } catch (error) {
    console.error('Middleware error:', {
      error,
      path: request.nextUrl.pathname,
      method: request.method,
    })

    // Return JSON error for API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({
        error: 'Server error',
        error_code: 'middleware_error',
        msg: 'An error occurred while processing your request'
      }, { status: 500 })
    }

    // Redirect to error page for other routes
    const errorUrl = new URL('/error', request.url)
    return NextResponse.redirect(errorUrl)
  }
}

export const config = {
  matcher: [
    // Match all paths except static assets
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
