import { createServerComponentClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { type ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'
import { SupabaseClient, createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '../types/database'

// This file is the single source of truth for creating a server-side Supabase client.
// It is used by server components, server actions, and API routes.

// Check if we're in a build environment
const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV

// For direct server-side usage without cookies (e.g., webhooks, build time)
export function getDirectServerClient(): SupabaseClient<Database> {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// For server components
export const createClient = (): SupabaseClient<Database> => {
  if (isBuildTime) {
    console.warn('Build time detected, using direct client')
    return getDirectServerClient()
  }
  
  try {
    const cookieStore = cookies()
    return createServerComponentClient<Database>({
      cookies: () => cookieStore,
    })
  } catch (error) {
    // During build time when cookies are not available, return direct client
    console.warn('Cookies not available, using direct client:', error instanceof Error ? error.message : 'Unknown error')
    return getDirectServerClient()
  }
}

// For route handlers (API routes)
export const createRouteHandler = (): SupabaseClient<Database> => {
  if (isBuildTime) {
    console.warn('Build time detected, using direct client for route handler')
    return getDirectServerClient()
  }
  
  try {
    const cookieStore = cookies()
    return createRouteHandlerClient<Database>({
      cookies: () => cookieStore,
    })
  } catch (error) {
    // During build time when cookies are not available, return direct client
    console.warn('Cookies not available for route handler, using direct client:', error instanceof Error ? error.message : 'Unknown error')
    return getDirectServerClient()
  }
}

// Create a client with service role for admin operations
export function createServiceClient(): SupabaseClient<Database> {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}
