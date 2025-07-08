import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  
  const supabase = createMiddlewareClient({
    req: request,
    res,
  });

  // Refresh session if expired and get the session - this is critical for SSR
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Session refresh error:', error);
  }

  return res;
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
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/callback).*)',
  ],
};
