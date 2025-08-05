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
        flowType: 'implicit',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
        storage: {
          getItem: (key: string): string | null => {
            if (typeof window === 'undefined') return null;
            try {
              const value = localStorage.getItem(key);
              if (!value) return null;
              
              // Handle base64-encoded values that start with 'base64-'
              if (value.startsWith('base64-')) {
                try {
                  const decoded = atob(value.substring(7)); // Remove 'base64-' prefix
                  return decoded;
                } catch (e) {
                  console.warn('Failed to decode base64 value for key:', key, e);
                  // If decoding fails, return the original value
                  return value;
                }
              }
              
              return value;
            } catch (e) {
              console.warn('Failed to get item from storage:', key, e);
              return null;
            }
          },
          setItem: (key: string, value: string): void => {
            if (typeof window === 'undefined') return;
            try {
              localStorage.setItem(key, value);
            } catch (e) {
              console.warn('Failed to set item in storage:', key, e);
            }
          },
          removeItem: (key: string): void => {
            if (typeof window === 'undefined') return;
            try {
              localStorage.removeItem(key);
            } catch (e) {
              console.warn('Failed to remove item from storage:', key, e);
            }
          },
        },
      },
    }
  );
  
  _isInitializing = false;
  return _browserClient;
}

// Function to clear corrupted session data
export function clearCorruptedSession() {
  if (typeof window === 'undefined') return;
  
  // Clear all Supabase-related localStorage items
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('supabase')) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    console.log('Clearing corrupted session key:', key);
    localStorage.removeItem(key);
  });
  
  // Reset the client instance
  _browserClient = null;
  _isInitializing = false;
}
