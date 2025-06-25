import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

// Admin client is a singleton for server-side admin operations
let adminClient: SupabaseClient<Database, 'public'> | undefined

/**
 * Get the Supabase admin client for privileged server-side operations.
 * This should only be used in secure server contexts.
 */
export function getAdminSupabaseOrThrow(): SupabaseClient<Database, 'public'> {
  if (typeof window !== 'undefined') {
    throw new Error('Admin client should only be used on the server')
  }

  if (!adminClient) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase admin environment variables')
    }

    adminClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        db: {
          schema: 'public'
        },
        global: {
          headers: { 'x-client-info': '@supabase/admin' }
        }
      }
    )
  }

  return adminClient
}

// Backwards compatibility export
export const createAdminClient = getAdminSupabaseOrThrow
