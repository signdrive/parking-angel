'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/types/supabase';
import { useRouter } from 'next/navigation';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  error: Error | null;
}

const supabase = createClientComponentClient<Database>();

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

      // Clear any existing verifier cookies first
      document.cookie = 'my-code-verifier=; path=/auth; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'code_verifier=; path=/auth; expires=Thu, 01 Jan 1970 00:00:00 GMT';

      // Generate PKCE verifier and challenge
      const verifier = generatePKCEVerifier();
      const challenge = await generatePKCEChallenge(verifier);

      // Set cookies with proper attributes - use root path to ensure availability
      const cookieOptions = 'path=/; secure; samesite=lax; max-age=300';
      document.cookie = `my-code-verifier=${verifier}; ${cookieOptions}`;
      document.cookie = `code_verifier=${verifier}; ${cookieOptions}`;
      
      // Debug cookie setting
      console.log('PKCE cookies set:', {
        verifierLength: verifier.length,
        cookiePresent: document.cookie.includes('code_verifier'),
        allCookies: document.cookie
      });

      // Debug logging
      console.log('Starting OAuth flow with PKCE', {
        challenge,
        hasCookies: document.cookie.includes('code_verifier')
      });

      // Start OAuth flow with proper return_to parameter
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
            code_challenge: challenge,
            code_challenge_method: 'S256',
            response_type: 'code',
            return_to: redirectTo // Pass return_to as a query param
          }
        }
      });

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

// PKCE Helper Functions
function generatePKCEVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

async function generatePKCEChallenge(verifier: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(hash));
}

function base64URLEncode(buffer: Uint8Array) {
  const base64 = btoa(String.fromCharCode.apply(null, [...buffer]));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}