'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '../types/supabase'

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export function getBrowserClient() {
  if (typeof window === 'undefined') {
    throw new Error('getBrowserClient should only be called in the browser')
  }

  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          flowType: 'pkce',
          detectSessionInUrl: true,
          persistSession: true,
          autoRefreshToken: true
        },
        cookies: {
          get(name: string) {
            const cookie = document.cookie
              .split('; ')
              .find((row) => row.startsWith(name + '='))
            return cookie ? cookie.split('=')[1] : undefined
          },
          set(name: string, value: string, options: any) {
            let cookie = name + '=' + value
            if (options.maxAge) {
              cookie += '; Max-Age=' + options.maxAge
            }
            if (options.path) {
              cookie += '; Path=' + options.path
            }
            document.cookie = cookie
          },
          remove(name: string, options: any) {
            document.cookie = name + '=; Max-Age=-1; Path=' + (options.path || '/')
          }
        }
      }
    )
  }

  return browserClient
}

// Handle HMR in development
if (process.env.NODE_ENV === 'development') {
  if ((module as any).hot) {
    (module as any).hot.dispose(() => {
      browserClient = null
    })
  }
}
