import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get('host') || '';

  // Handle canonical URL redirects
  // Redirect www to non-www
  if (host.startsWith('www.')) {
    const nonWwwUrl = new URL(request.url);
    nonWwwUrl.host = host.replace('www.', '');
    return NextResponse.redirect(nonWwwUrl, 301);
  }

  // Remove trailing slashes (except for root)
  if (pathname !== '/' && pathname.endsWith('/')) {
    const cleanUrl = new URL(request.url);
    cleanUrl.pathname = pathname.slice(0, -1);
    return NextResponse.redirect(cleanUrl, 301);
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Add canonical header for debugging
  response.headers.set('x-canonical-url', `https://parkalgo.com${pathname}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Get user session
  const { data: { user }, error } = await supabase.auth.getUser();

  // Only log auth errors for protected routes, not public pages
  const protectedRoutes = ['/dashboard', '/admin', '/profile', '/settings'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (error && isProtectedRoute) {
    console.log('Middleware auth error on protected route:', error.message);
  }

  return response;
}

// Ensure the middleware is only called for relevant paths.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /auth/callback (the auth callback route, to avoid interference)
     * - /auth/error (the auth error page)
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|auth/error).*)',
  ],
};
