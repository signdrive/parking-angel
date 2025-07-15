'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { getBrowserClient } from '@/lib/supabase/browser';
import type { Database } from '@/lib/types/supabase';
import { useRouter } from 'next/navigation';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  error: Error | null;
}

// Use single client instance
const supabase = getBrowserClient();

export function useAuth(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        setLoading(false);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async (redirectTo: string = '/dashboard') => {
    try {
      setLoading(true);
      setError(null);

      // Get the base URL without any port issues
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

      // Ensure the URL doesn't have double ports
      const cleanBaseUrl = baseUrl.replace(/:3000$/, '');

      console.log('🔍 Starting OAuth with implicit flow');
      
      // Use implicit flow to avoid PKCE completely
      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${cleanBaseUrl}/auth/callback-implicit?return_to=${encodeURIComponent(redirectTo)}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'
          }
        }
      });

      console.log('OAuth result:', { data, error: signInError });
      if (signInError) throw signInError;

    } catch (err) {
      console.error('Google sign in error:', err);
      setError(err instanceof Error ? err : new Error('Failed to sign in with Google'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    user, 
    loading,
    signInWithGoogle,
    error 
  } as const;
}