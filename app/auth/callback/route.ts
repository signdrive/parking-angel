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
    const returnTo = requestUrl.searchParams.get('redirect_to');
    const plan = requestUrl.searchParams.get('plan');

    // Debug incoming parameters
    console.log('Auth callback received:', {
      hasCode: !!code,
      returnTo: returnTo || 'none',
      plan: plan || 'none'
    });

    // Get PKCE code verifier from cookies (try both names)
    const cookieStore = await cookies();
    const legacyVerifier = cookieStore.get('code_verifier')?.value;
    const newVerifier = cookieStore.get('my-code-verifier')?.value;
    const verifier = newVerifier || legacyVerifier;

    // Debug cookie state
    console.log('Cookie state:', {
      hasLegacyVerifier: !!legacyVerifier,
      hasNewVerifier: !!newVerifier,
      cookieNames: cookieStore.getAll().map((cookie: { name: string }) => cookie.name)
    });

    if (!code) {
      console.error('No authorization code in callback');
      return NextResponse.redirect(
        new URL('/auth/error?error=no_code', requestUrl.origin)
      );
    }

    if (!verifier) {
      console.error('No PKCE code verifier in cookies', {
        cookieNames: cookieStore.getAll().map((cookie: { name: string }) => cookie.name),
        legacyVerifierExists: !!legacyVerifier,
        newVerifierExists: !!newVerifier
      });
      return NextResponse.redirect(
        new URL('/auth/error?error=no_verifier', requestUrl.origin)
      );
    }

    // Create Supabase client with enhanced logging
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
      // Exchange code for session
      const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('Failed to exchange code for session:', exchangeError);
        return NextResponse.redirect(
          new URL(`/auth/error?error=exchange_failed&message=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
        );
      }

      // Validate and clean return URL
      let redirectUrl = returnTo || DEFAULT_REDIRECT;
      if (!isValidReturnUrl(redirectUrl, requestUrl.origin)) {
        console.warn('Invalid return URL, using default:', redirectUrl);
        redirectUrl = DEFAULT_REDIRECT;
      }

      // Clean up PKCE cookies
      const response = NextResponse.redirect(new URL(redirectUrl, requestUrl.origin));
      response.cookies.delete('code_verifier');
      response.cookies.delete('my-code-verifier');

      // Add plan parameter if present
      if (plan) {
        const redirectUrlObj = new URL(redirectUrl, requestUrl.origin);
        redirectUrlObj.searchParams.set('plan', plan);
        return NextResponse.redirect(redirectUrlObj);
      }

      return response;
    } catch (error) {
      console.error('Unexpected error in auth callback:', error);
      return NextResponse.redirect(
        new URL('/auth/error?error=unexpected', requestUrl.origin)
      );
    }
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(
      new URL('/auth/error?error=callback_failed', request.url)
    );
  }
}
