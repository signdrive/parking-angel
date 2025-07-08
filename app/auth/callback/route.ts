import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Constants
const ALLOWED_REDIRECT_PATHS = [
  '/dashboard',
  '/checkout-redirect',
  '/plans',
  '/pricing',
  '/contact',
  '/account',
  '/settings'
];

const MAX_RETURN_URL_LENGTH = 500;
const DEFAULT_REDIRECT = '/dashboard';

// Utility function to validate return URLs
function isValidReturnUrl(returnUrl: string, origin: string): boolean {
  try {
    // Must be a relative path or absolute URL matching our domain
    if (returnUrl.startsWith('http')) {
      const url = new URL(returnUrl);
      const allowedDomains = [
        'localhost:3000',
        'parkalgo.com',
        'www.parkalgo.com'
      ];
      if (!allowedDomains.some(domain => url.host === domain)) {
        console.warn('Invalid return URL domain:', url.host);
        return false;
      }
    }

    // Check length to prevent DoS
    if (returnUrl.length > MAX_RETURN_URL_LENGTH) {
      console.warn('Return URL too long:', returnUrl.length);
      return false;
    }

    // Must start with / if relative
    if (!returnUrl.startsWith('/') && !returnUrl.startsWith('http')) {
      console.warn('Return URL must start with / or http:', returnUrl);
      return false;
    }

    // Allow only specific paths
    const path = returnUrl.startsWith('http') ? new URL(returnUrl).pathname : returnUrl;
    if (!ALLOWED_REDIRECT_PATHS.some(allowed => path.startsWith(allowed))) {
      console.warn('Return URL path not allowed:', path);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating return URL:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const returnTo = requestUrl.searchParams.get('return_to') || DEFAULT_REDIRECT;
    const error = requestUrl.searchParams.get('error');

    // Debug incoming parameters
    console.log('Auth callback received:', {
      hasCode: !!code,
      returnTo: returnTo || 'none',
      error: error || 'none',
      url: request.url
    });

    // Check for error parameter first
    if (error) {
      console.error('OAuth error received:', error);
      return NextResponse.redirect(
        new URL(`/auth/error?error=${encodeURIComponent(error)}`, requestUrl.origin)
      );
    }

    if (!code) {
      console.error('No authorization code in callback');
      return NextResponse.redirect(
        new URL('/auth/error?error=no_code', requestUrl.origin)
      );
    }

    // Validate return URL
    if (!isValidReturnUrl(returnTo, requestUrl.origin)) {
      console.warn('Invalid return URL:', returnTo);
      return NextResponse.redirect(
        new URL(DEFAULT_REDIRECT, requestUrl.origin)
      );
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
      
      console.log('Auth state:', {
        hasSession: !!session,
        returnTo
      });
      
      if (sessionError) {
        console.error('Session exchange error:', {
          error: sessionError,
          code: sessionError.code,
          message: sessionError.message,
          status: sessionError.status
        });
        throw sessionError;
      }

      if (!session) {
        console.error('No session data received');
        throw new Error('No session data');
      }

      console.log('Auth success:', {
        hasSession: !!session,
        returnTo
      });

      // Clear PKCE cookies
      const response = NextResponse.redirect(new URL(returnTo, requestUrl.origin));
      response.cookies.set('code_verifier', '', { 
        path: '/',
        expires: new Date(0),
        secure: true,
        sameSite: 'lax'
      });
      response.cookies.set('my-code-verifier', '', {
        path: '/',
        expires: new Date(0),
        secure: true,
        sameSite: 'lax'
      });
      
      return response;
    } catch (error) {
      console.error('Auth callback error:', {
        error,
        code: error instanceof Error ? error.name : 'unknown',
        message: error instanceof Error ? error.message : String(error)
      });
      
      return NextResponse.redirect(
        new URL('/auth/error?error=session_error', requestUrl.origin)
      );
    }
  } catch (error) {
    console.error('Unexpected error in auth callback:', {
      error,
      code: error instanceof Error ? error.name : 'unknown',
      message: error instanceof Error ? error.message : String(error),
      url: request.url
    });
    
    return NextResponse.redirect(
      new URL('/auth/error?error=unknown', new URL(request.url).origin)
    );
  }
}
