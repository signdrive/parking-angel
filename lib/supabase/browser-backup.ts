'use client'

import { createBrowserClient } from '@supabase/ssr'
import { Database } from '../types/database'
import { CookieOptions } from '@supabase/ssr'

// No longer a singleton. A new client is created on each call.
// This ensures that the latest cookie state is always used, which is
// crucial for the PKCE flow to succeed.
export function getBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: 'sb-auth-token',
        domain: process.env.NODE_ENV === 'development' ? undefined : 'parkalgo.com',
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV !== 'development',
        httpOnly: false // Client-side cookies can't be httpOnly
      },
      auth: {
        detectSessionInUrl: false,
        persistSession: true,
        autoRefreshToken: true,
        storage: {
          getItem: (key: string): string | null => {
            if (typeof window === 'undefined') return null;
            return localStorage.getItem(key);
          },
          setItem: (key: string, value: string): void => {
            if (typeof window === 'undefined') return;
            localStorage.setItem(key, value);
          },
          removeItem: (key: string): void => {
            if (typeof window === 'undefined') return;
            localStorage.removeItem(key);
          },
        },
      },
    }
  );
}
