'use client';

import { useEffect, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import type { User } from '@supabase/supabase-js';

export default function TestAuthPage() {
  const [status, setStatus] = useState('Loading...');
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = getBrowserClient();

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          setError(error.message);
          setStatus('Error checking session');
          return;
        }

        if (session) {
          setUser(session.user);
          setStatus('Authenticated');
        } else {
          setStatus('Not authenticated');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus('Error');
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      if (session) {
        setUser(session.user);
        setStatus('Authenticated');
      } else {
        setUser(null);
        setStatus('Not authenticated');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async () => {
    try {
      setStatus('Starting sign in...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback-implicit?return_to=/test-auth`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'
          }
        }
      });

      if (error) {
        setError(error.message);
        setStatus('Sign in error');
      } else {
        setStatus('Redirecting to Google...');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('Error');
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setStatus('Signed out');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Authentication Test</h1>
      <p><strong>Status:</strong> {status}</p>
      {user && (
        <div>
          <p><strong>User ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      )}
      {error && <p style={{ color: 'red' }}><strong>Error:</strong> {error}</p>}
      
      <div style={{ marginTop: '20px' }}>
        {!user ? (
          <button onClick={signIn} style={{ padding: '10px 20px', fontSize: '16px' }}>
            Sign In with Google
          </button>
        ) : (
          <button onClick={signOut} style={{ padding: '10px 20px', fontSize: '16px' }}>
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
}
