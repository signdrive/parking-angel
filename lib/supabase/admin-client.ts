// Admin-specific Supabase client
import { SupabaseClient, createClient } from '@supabase/supabase-js'
import { isSupabaseConfigured } from '../supabase'

let adminClientInstance: SupabaseClient | null = null;

// Optionally, create a separate admin client if needed
export function getAdminSupabase(): SupabaseClient | null {
  if (typeof window === 'undefined') {
    // console.log("getAdminSupabase called on server, returning null");
    return null // Return null during SSR
  }

  if (adminClientInstance) {
    // console.log("Returning existing admin client instance");
    return adminClientInstance;
  }

  if (!isSupabaseConfigured()) {
    console.error('Supabase configuration missing for admin client')
    return null
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase URL or Anon Key is missing for admin client.')
      return null
    }
    // console.log("Creating new admin client instance");
    adminClientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: 'admin-auth-token', // Use a distinct storage key for admin
        // storage: window.localStorage, // Already default for client
      }
    })
    return adminClientInstance;
  } catch (error) {
    console.error('Failed to initialize Supabase admin client:', error)
    adminClientInstance = null; // Reset on error
    return null
  }
}

// Export a safe version that throws if no instance is available
export function getAdminSupabaseOrThrow(): SupabaseClient {
  const client = getAdminSupabase()
  if (!client) {
    // Potentially throw a more specific error or handle it
    // For now, this matches previous behavior but with better SSR handling
    throw new Error('Supabase admin client is not available. Ensure it\'s called client-side and configured.')
  }
  return client
}

// REMOVED: export const adminSupabase = getAdminSupabaseOrThrow()
// The client should be fetched by calling getAdminSupabaseOrThrow() at runtime within services/hooks.





