'use client'

import { getBrowserClient } from '@/lib/supabase/browser'
import { normalizeUrl, getBaseUrl } from '@/lib/url-utils'
import type { User, AuthError, Session } from '@supabase/supabase-js'

interface AuthResult<T> {
  data: T | null
  error: AuthError | Error | null
}

export async function signInWithGoogle(
  redirectTo: string,
): Promise<AuthResult<{ provider: string; url: string }>> {
  try {
    const supabase = getBrowserClient()
    
    // Get the base URL using the utility function
    const baseUrl = getBaseUrl();
    
    // Construct the final redirect URL
    const finalRedirectTo = redirectTo.startsWith('http') 
      ? redirectTo 
      : `${baseUrl}${redirectTo.startsWith('/') ? redirectTo : `/${redirectTo}`}`;

    console.log('Google sign-in redirect configuration:', {
      baseUrl,
      redirectTo,
      finalRedirectTo
    });

    // Configure OAuth - let Supabase handle PKCE automatically
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: finalRedirectTo,
        skipBrowserRedirect: false,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account'
        }
      }
    })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Google sign in error:', error)
    return { data: null, error: error as AuthError }
  }
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult<{ user: User | null; session: Session | null }>> {
  try {
    const supabase = getBrowserClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as AuthError }
  }
}

export async function signUpWithEmail(
  email: string,
  password: string
): Promise<AuthResult<{ user: User | null; session: Session | null }>> {
  try {
    const supabase = getBrowserClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          redirect_url: `${window.location.origin}/auth/callback`
        }
      }
    })
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Sign up error:', error)
    return { data: null, error: error as AuthError }
  }
}

export async function signOut(): Promise<{ error: AuthError | Error | null }> {
  try {
    const supabase = getBrowserClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    // Redirect to home page after successful sign out
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
    
    return { error: null }
  } catch (error) {
    console.error('Sign out error:', error)
    return { error: error as AuthError }
  }
}

export async function resetPassword(email: string): Promise<AuthResult<{}>> {
  try {
    const supabase = getBrowserClient()
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/account/update-password`,
    })
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Password reset error:', error)
    return { data: null, error: error as AuthError }
  }
}

// Session management methods
export async function getClientSession(): Promise<{ session: Session | null; error: AuthError | null }> {
  try {
    const supabase = await getBrowserClient()
    const { data, error } = await supabase.auth.getSession()
    
    if (error) throw error
    return { session: data.session, error: null }
  } catch (error) {
    console.error('Get session error:', error)
    return { session: null, error: error as AuthError }
  }
}

export async function getClientUser(): Promise<{ user: User | null; error: AuthError | null }> {
  try {
    const supabase = await getBrowserClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) throw error
    return { user, error: null }
  } catch (error) {
    console.error('Get user error:', error)
    return { user: null, error: error as AuthError }
  }
}

export async function getClientAuthStatus(): Promise<{
  isAuthenticated: boolean
  user: User | null
  error: AuthError | null
}> {
  try {
    const supabase = await getBrowserClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) throw error
    return {
      isAuthenticated: !!session,
      user: session?.user || null,
      error: null
    }
  } catch (error) {
    console.error('Auth status error:', error)
    return {
      isAuthenticated: false,
      user: null,
      error: error as AuthError
    }
  }
}

export async function refreshClientSession(): Promise<{ session: Session | null; error: AuthError | null }> {
  try {
    const supabase = await getBrowserClient()
    const { data: { session }, error } = await supabase.auth.refreshSession()
    
    if (error) throw error
    return { session, error: null }
  } catch (error) {
    console.error('Session refresh error:', error)
    return { session: null, error: error as AuthError }
  }
}

// Ensure proper session handling on page load
export async function initAuth() {
  const supabase = getBrowserClient()
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    
    if (!session) {
      // Try to exchange code for session if in URL
      const params = new URLSearchParams(window.location.search)
      if (params.has('code')) {
        await supabase.auth.exchangeCodeForSession(params.get('code')!)
      }
    }
  } catch (error) {
    console.warn('Auth initialization error:', error)
  }
}

// PKCE Helper Functions
function generateCodeVerifier() {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return base64URLEncode(array)
}

async function generateCodeChallenge(verifier: string) {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return base64URLEncode(new Uint8Array(hash))
}

function base64URLEncode(buffer: Uint8Array) {
  const base64 = btoa(String.fromCharCode.apply(null, [...buffer]))
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}
