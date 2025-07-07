import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

// Constants
const ALLOWED_REDIRECT_PATHS = [
  '/dashboard',
  '/checkout-redirect',
  '/plans',
  '/pricing',
  '/contact',
  '/account',
  '/settings'
]

const MAX_RETURN_URL_LENGTH = 500
const DEFAULT_REDIRECT = '/dashboard'
const PKCE_CODE_VERIFIER = 'pkce-verifier' // Supabase's PKCE cookie name
const SUPABASE_AUTH_CODE_VERIFIER = 'code_verifier' // Browser's PKCE cookie name

// Utility function to validate return URLs
function isValidReturnUrl(returnUrl: string, origin: string): boolean {
  try {
    // Must be a relative path or absolute URL matching our domain
    if (returnUrl.startsWith('http')) {
      const url = new URL(returnUrl)
      const allowedDomains = [
        'localhost:3000',
        'parkalgo.com',
        'www.parkalgo.com'
      ]
      if (!allowedDomains.some(domain => url.host === domain)) {
        console.warn('Invalid return URL domain:', url.host)
        return false
      }
    }

    // Check length to prevent DoS
    if (returnUrl.length > MAX_RETURN_URL_LENGTH) {
      console.warn('Return URL too long:', returnUrl.length)
      return false
    }

    // Must start with / if relative
    if (!returnUrl.startsWith('/') && !returnUrl.startsWith('http')) {
      console.warn('Return URL must start with / or http:', returnUrl)
      return false
    }

    // Allow only specific paths
    const path = returnUrl.startsWith('http') ? new URL(returnUrl).pathname : returnUrl
    if (!ALLOWED_REDIRECT_PATHS.some(allowed => path.startsWith(allowed))) {
      console.warn('Return URL path not allowed:', path)
      return false
    }

    return true
  } catch (error) {
    console.error('Error validating return URL:', error)
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const returnTo = requestUrl.searchParams.get('return_to')
    const plan = requestUrl.searchParams.get('plan')

    // Get both PKCE verifier cookies
    const cookieStore = await cookies()
    const pkceVerifier = cookieStore.get(PKCE_CODE_VERIFIER)?.value
    const authVerifier = cookieStore.get(SUPABASE_AUTH_CODE_VERIFIER)?.value
    const verifier = pkceVerifier || authVerifier

    // Debug logging
    console.log('Auth callback params:', {
      code: code ? 'present' : 'missing',
      returnTo: returnTo || 'none',
      plan: plan || 'none',
      pkceVerifier: pkceVerifier ? 'present' : 'missing',
      authVerifier: authVerifier ? 'present' : 'missing'
    })

    if (!code) {
      console.error('No code in callback')
      return NextResponse.redirect(new URL('/auth/error?error=no_code', requestUrl.origin))
    }

    if (!verifier) {
      console.error('No PKCE verifier in cookies')
      return NextResponse.redirect(new URL('/auth/error?error=no_verifier', requestUrl.origin))
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Exchange code with both verifiers
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code:', error)
      const errorUrl = new URL('/auth/error', requestUrl.origin)
      errorUrl.searchParams.set('error', error.message)
      return NextResponse.redirect(errorUrl)
    }

    // Clean up cookies after successful exchange
    const response = returnTo && isValidReturnUrl(returnTo, requestUrl.origin)
      ? NextResponse.redirect(new URL(returnTo, requestUrl.origin))
      : NextResponse.redirect(new URL(DEFAULT_REDIRECT, requestUrl.origin))

    // Copy access token to cookie for client-side access
    response.cookies.set('sb-access-token', data.session.access_token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    // Delete PKCE verifier cookies
    response.cookies.delete(PKCE_CODE_VERIFIER)
    response.cookies.delete(SUPABASE_AUTH_CODE_VERIFIER)

    return response
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(new URL('/auth/error?error=callback_failed', request.url))
  }
}
