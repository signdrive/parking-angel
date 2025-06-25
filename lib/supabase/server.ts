import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

import { type Database } from '@/lib/types/supabase'

// This file is the single source of truth for creating a server-side Supabase client.
// It is used by server components, server actions, and API routes.
// The createClient function is a wrapper around the Supabase createServerClient function
// that requires a cookie store from next/headers to be passed in.

// IMPORTANT: This function should not be used directly in components.
// Instead, use the `createServerClient` utility from `lib/supabase/server-utils.ts`
// which correctly handles getting and passing the cookie store.

export const createClient = (cookieStore: ReadonlyRequestCookies) => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
