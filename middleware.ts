import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  
  const supabase = createMiddlewareClient({
    req: request,
    res,
  });

  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Session error:', sessionError);
      return res;
    }

    // If we have a session, refresh it
    if (session) {
      const { data: { session: refreshedSession }, error: refreshError } = 
        await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('Session refresh error:', refreshError);
        return res;
      }

      if (refreshedSession) {
        // Set refreshed session
        await supabase.auth.setSession({
          access_token: refreshedSession.access_token,
          refresh_token: refreshedSession.refresh_token!
        });
      }
    }
  } catch (error) {
    console.error('Middleware session error:', error);
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
