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

    // Debug incoming parameters
    console.log('Auth callback received:', {
      hasCode: !!code,
      returnTo: returnTo || 'none',
      plan: plan || 'none'
    })

    // Get PKCE code verifier from cookies
    const cookieStore = await cookies()
    const verifier = cookieStore.get('code_verifier')?.value

    // Debug cookie state
    console.log('Cookie state:', {
      hasVerifier: !!verifier,
      cookieNames: Array.from(cookieStore.getAll()).map(cookie => cookie.name)
    })

    if (!code) {
      console.error('No authorization code in callback')
      return NextResponse.redirect(
        new URL('/auth/error?error=no_code', requestUrl.origin)
      )
    }

    if (!verifier) {
      console.error('No PKCE code verifier in cookies')
      return NextResponse.redirect(
        new URL('/auth/error?error=no_verifier', requestUrl.origin)
      )
    }

    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies })

    // Exchange code for session using code verifier
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Session exchange error:', error)
      return NextResponse.redirect(
        new URL(`/auth/error?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
      )
    }

    // Determine redirect URL (returnTo if valid, or default)
    const redirectTo = returnTo && isValidReturnUrl(returnTo, requestUrl.origin)
      ? returnTo 
      : DEFAULT_REDIRECT

    // Add plan parameter if present
    const finalRedirectUrl = new URL(
      redirectTo.startsWith('http') ? redirectTo : redirectTo,
      requestUrl.origin
    )
    if (plan) {
      finalRedirectUrl.searchParams.set('plan', plan)
    }

    // Create response with redirect
    const response = NextResponse.redirect(finalRedirectUrl)

    // Clean up all possible PKCE cookies
    response.cookies.delete('code_verifier')
    response.cookies.delete('pkce-verifier')
    response.cookies.delete('supabase-auth-token')

    // Copy the session token to a secure cookie for client access
    if (data?.session) {
      response.cookies.set({
        name: 'sb-auth-token',
        value: data.session.access_token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      })
    }

    return response
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(
      new URL('/auth/error?error=callback_failed', request.url)
    )
  }
}
