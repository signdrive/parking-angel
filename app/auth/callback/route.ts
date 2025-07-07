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

    // Path must be allowed
    const path = returnUrl.startsWith('http')
      ? new URL(returnUrl).pathname
      : returnUrl.split('?')[0]

    if (!ALLOWED_REDIRECT_PATHS.some(allowed => path.startsWith(allowed))) {
      console.warn('Return URL path not allowed:', path)
      return false
    }

    // If URL is absolute, must match origin
    if (returnUrl.startsWith('http')) {
      const url = new URL(returnUrl)
      if (url.origin !== origin) {
        console.warn('Return URL origin mismatch:', url.origin, '!==', origin)
        return false
      }
    }

    return true
  } catch (err) {
    console.error('Error validating return URL:', err)
    return false
  }
}

export async function GET(request: NextRequest) {
  const requestUrl = request.nextUrl
  try {
    // Get all relevant parameters
    const code = requestUrl.searchParams.get('code')
    const return_to = requestUrl.searchParams.get('return_to')
    const error = requestUrl.searchParams.get('error')
    const error_description = requestUrl.searchParams.get('error_description')
    const plan = requestUrl.searchParams.get('plan')
    
    console.log('Auth callback received:', { 
      code: code ? 'present' : 'missing',
      return_to,
      error,
      plan
    })

    // If there's an error, redirect to error page
    if (error) {
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(error_description || '')}`
      )
    }

    // Validate code is present
    if (!code) {
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/error?error=no_code&description=${encodeURIComponent('No code provided')}`
      )
    }

    // Exchange code for session
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Auth callback error:', exchangeError)
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/error?error=session_error&description=${encodeURIComponent(exchangeError.message)}`
      )
    }

    // Get the current session to verify everything worked
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      console.error('Error getting session:', sessionError)
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/error?error=session_validation&description=${encodeURIComponent('Could not validate session')}`
      )
    }

    // Determine redirect URL with precedence:
    // 1. return_to from URL (if valid)
    // 2. checkout redirect with plan (if present)
    // 3. default dashboard
    let finalRedirectUrl = DEFAULT_REDIRECT

    // First check explicit return_to
    if (return_to && isValidReturnUrl(return_to, requestUrl.origin)) {
      finalRedirectUrl = return_to
      console.log('Using return_to URL:', finalRedirectUrl)
    }
    
    // If going to checkout and we have a plan, ensure it's included
    if (plan && (finalRedirectUrl.includes('/checkout-redirect') || !return_to)) {
      const planParam = `plan=${encodeURIComponent(plan)}`
      finalRedirectUrl = finalRedirectUrl.includes('?') 
        ? `${finalRedirectUrl}&${planParam}`
        : `/checkout-redirect?${planParam}`
      console.log('Using checkout redirect with plan:', plan)
    }

    // Log success for monitoring
    console.log('Auth callback successful:', {
      userId: session.user.id,
      email: session.user.email,
      provider: session.user.app_metadata.provider,
      redirectTo: finalRedirectUrl
    })

    // Always use absolute URLs for redirects
    return NextResponse.redirect(`${requestUrl.origin}${finalRedirectUrl}`)

  } catch (err) {
    console.error('Unexpected auth callback error:', err)
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/error?error=unexpected&description=${encodeURIComponent('An unexpected error occurred')}`
    )
  }
}
