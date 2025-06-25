'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '../types/supabase'

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined

export function getBrowserClient() {
  if (typeof window === 'undefined') {
    throw new Error('getBrowserClient should only be called in the browser')
  }

  if (!browserClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    browserClient = createBrowserClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
        debug: process.env.NODE_ENV === 'development'
      }
    })
  }

  if (!browserClient) {
    throw new Error('Failed to initialize Supabase client')
  }

  return browserClient
}

// HMR support
if (process.env.NODE_ENV === 'development') {
  if ((module as any).hot) {
    (module as any).hot.dispose(() => {
      browserClient = undefined
    })
  }
}
