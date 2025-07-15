'use client'

import { createBrowserClient } from '@supabase/ssr'
import { Database } from '../types/database'

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
        httpOnly: false
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
