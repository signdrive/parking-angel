'use client'

import { createBrowserClient } from '@supabase/ssr'
import { Database } from '../types/database'

// Global singleton client to prevent multiple instances
let _browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;
let _isInitializing = false;

// Simple browser client using PKCE flow (most secure)
export function getBrowserClient() {
  // If already created, return it
  if (_browserClient) return _browserClient;
  
  // Prevent multiple simultaneous initializations
  if (_isInitializing) {
    throw new Error('Supabase client is already being initialized');
  }
  
  _isInitializing = true;
  
  _browserClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
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
  
  _isInitializing = false;
  return _browserClient;
}
