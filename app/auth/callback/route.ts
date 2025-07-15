import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRedirectUrl } from '@/lib/url-utils';

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
  '/settings',
  '/test-auth'
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
        'localhost:3001',
        'parkalgo.com',
        'www.parkalgo.com',
        'automatic-umbrella-66rqvg9j35545-3000.app.github.dev', // Old Codespace domain
        'automatic-umbrella-66rqvg9j35545-443.app.github.dev' // New Codespace domain
      ];
      
      // Allow any GitHub Codespace domain
      if (!allowedDomains.some(domain => url.host === domain) && 
          !url.host.includes('.app.github.dev')) {
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
  const requestUrl = new URL(request.url);
  
  try {
    const code = requestUrl.searchParams.get('code');
    const accessToken = requestUrl.searchParams.get('access_token');
    const returnTo = requestUrl.searchParams.get('return_to') || DEFAULT_REDIRECT;
    const error = requestUrl.searchParams.get('error');
    const errorDescription = requestUrl.searchParams.get('error_description');

    // Debug incoming parameters
    console.log('Auth callback received:', {
      hasCode: !!code,
      hasAccessToken: !!accessToken,
      returnTo: returnTo || 'none',
      error: error || 'none',
      errorDescription: errorDescription || 'none',
      url: request.url,
      origin: requestUrl.origin,
      searchParams: Object.fromEntries(requestUrl.searchParams.entries())
    });

    // Check for error parameter first
    if (error) {
      console.error('OAuth error received:', { error, errorDescription });
      return NextResponse.redirect(
        getRedirectUrl(`/auth/error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`)
      );
    }

    // Handle implicit flow (access token in URL)
    if (accessToken && !code) {
      console.log('✅ Implicit flow detected - access token received');
      const finalReturnTo = returnTo && isValidReturnUrl(returnTo, requestUrl.origin) 
        ? returnTo 
        : DEFAULT_REDIRECT;
      
      console.log('Redirecting to:', finalReturnTo);
      return NextResponse.redirect(getRedirectUrl(finalReturnTo));
    }

    // Handle PKCE flow (authorization code)
    if (!code) {
      console.error('No authorization code or access token in callback');
      return NextResponse.redirect(
        getRedirectUrl('/auth/error?error=no_code_or_token')
      );
    }

    // Continue with PKCE flow
    console.log('🔍 PKCE flow detected - processing authorization code');

    // Validate return URL
    const finalReturnTo = returnTo && isValidReturnUrl(returnTo, requestUrl.origin) 
      ? returnTo 
      : DEFAULT_REDIRECT;

    console.log('Using return URL:', finalReturnTo);

    // Create response early to set cookies
    const response = NextResponse.redirect(getRedirectUrl(finalReturnTo));
    
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            response.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    try {
      console.log('🔍 Attempting code exchange for session...');
      
      // Add timeout to prevent hanging
      const exchangePromise = supabase.auth.exchangeCodeForSession(code);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Code exchange timeout')), 10000)
      );
      
      const { data: { session }, error: sessionError } = await Promise.race([
        exchangePromise,
        timeoutPromise
      ]) as any;
      
      if (sessionError) {
        console.error('Session exchange error:', {
          error: sessionError,
          code: sessionError.code,
          message: sessionError.message,
          status: sessionError.status
        });
        
        // Handle specific error types
        if (sessionError.message?.includes('PKCE')) {
          console.error('PKCE verification failed - likely due to missing/invalid code verifier');
          throw new Error('PKCE verification failed');
        } else if (sessionError.message?.includes('invalid_grant')) {
          console.error('Invalid grant - authorization code may be expired or invalid');
          throw new Error('Invalid or expired authorization code');
        } else if (sessionError.message?.includes('400')) {
          console.error('Bad request - possibly invalid callback URL or parameters');
          throw new Error('Bad request - possibly invalid callback URL');
        }
        
        throw sessionError;
      }

      if (!session) {
        console.error('No session data received despite successful code exchange');
        throw new Error('No session data');
      }

      console.log('Auth success:', {
        hasSession: !!session,
        userId: session.user?.id,
        userEmail: session.user?.email,
        returnTo: finalReturnTo,
        redirectUrl: getRedirectUrl(finalReturnTo)
      });

      return response;
    } catch (error) {
      console.error('Auth callback error:', {
        error,
        code: error instanceof Error ? error.name : 'unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      return NextResponse.redirect(
        getRedirectUrl(`/auth/error?error=session_error&description=${encodeURIComponent(error instanceof Error ? error.message : String(error))}`)
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
      getRedirectUrl('/auth/error?error=unknown')
    );
  }
}
