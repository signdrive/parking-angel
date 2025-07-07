import { createServerComponentClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { type ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'
import { SupabaseClient, createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '../types/database'

// This file is the single source of truth for creating a server-side Supabase client.
// It is used by server components, server actions, and API routes.

// For server components
export const createClient = () => {
  return createServerComponentClient<Database>({
    cookies,
  })
}

// For route handlers (API routes)
export const createRouteHandler = () => {
  return createRouteHandlerClient<Database>({
    cookies,
  })
}

// For direct server-side usage without cookies (e.g., webhooks)
export function getDirectServerClient(): SupabaseClient<Database> {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
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
