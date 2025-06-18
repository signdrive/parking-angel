import { supabase } from "./supabase"
import { User } from '@supabase/supabase-js'

export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Sign in error:', error)
    return { data: null, error }
  }
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/callback`,
  })
  return { data, error }
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export async function getAuthStatus() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Error checking auth status:', error)
    return { isAuthenticated: false, user: null, error }
  }
  return {
    isAuthenticated: !!session,
    user: session?.user || null,
    error: null
  }
}

export async function refreshSession() {
  const { data: { session }, error } = await supabase.auth.refreshSession()
  return { session, error }
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null)
  })
}

export async function getUserProfile() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error fetching user profile:', error)
    return { user: null, error }
  }
  return { user, error: null }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return { user, error: null }
  } catch (error) {
    console.error('Error getting current user:', error)
    return { user: null, error }
  }
}

export async function createOrUpdateProfile(userData: {
  id: string
  email?: string
  full_name?: string
  avatar_url?: string
  updated_at?: string
}) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        avatar_url: userData.avatar_url,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return { profile: data, error: null }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { profile: null, error }
  }
}
