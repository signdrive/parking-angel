import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    // Skip middleware for non-auth requests
    if (request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.startsWith('/static') ||
        request.nextUrl.pathname.startsWith('/api/health') ||
        request.nextUrl.pathname === '/favicon.ico') {
      return NextResponse.next()
    }

    const res = NextResponse.next()
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json(
        { 
          error: 'Configuration error',
          error_code: 'missing_config',
          msg: 'Server configuration error'
        },
        { status: 500 }
      )
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get: (name) => request.cookies.get(name)?.value,
          set: (name, value, options) => {
            res.cookies.set({
              name,
              value,
              ...options,
              // Ensure cookies are sent with cross-site requests
              sameSite: 'lax',
              // Use secure cookies in production
              secure: process.env.NODE_ENV === 'production',
            })
          },
          remove: (name, options) => {
            res.cookies.delete({
              name,
              ...options,
            })
          },
        },
      }
    )

    try {
      // Refresh session if expired
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Session error:', error)
        // Don't block the request on session errors
        return res
      }

      // Add session user to request headers for API routes
      if (session?.user) {
        res.headers.set('x-user-id', session.user.id)
        // Only set role if it exists
        if (session.user.role) {
          res.headers.set('x-user-role', session.user.role)
        }
      }

      return res
    } catch (sessionError) {
      console.error('Session refresh error:', sessionError)
      return res
    }
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.json(
      { 
        error: 'Unexpected error',
        error_code: 'unexpected_failure',
        msg: 'Unexpected failure, please check server logs for more information'
      },
      { status: 500 }
    )
  }
}

// Add paths that require authentication
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
