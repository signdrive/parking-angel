// Admin-specific Supabase client
import { SupabaseClient, createClient } from '@supabase/supabase-js'
import { isSupabaseConfigured } from '../supabase'

// Optionally, create a separate admin client if needed
export function getAdminSupabase(): SupabaseClient | null {
  if (typeof window === 'undefined') {
    return null // Return null during SSR
  }

  if (!isSupabaseConfigured()) {
    console.error('Supabase configuration missing')
    return null
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
    // Create a new client with a unique storage key for admin
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: 'admin-auth-token',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined
      }
    })
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error)
    return null
  }
}

// Export a safe version that throws if no instance is available
export function getAdminSupabaseOrThrow() {
  const client = getAdminSupabase()
  if (!client) {
    throw new Error('Failed to initialize Supabase client')
  }
  return client
}

export const adminSupabase = getAdminSupabaseOrThrow()
