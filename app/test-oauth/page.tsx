// Simple test page to manually test OAuth without PKCE
'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

export default function TestOAuthPage() {
  const [status, setStatus] = useState('Ready');
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const startOAuth = async () => {
    try {
      setStatus('Starting OAuth...');
      
      // Simple OAuth without PKCE
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback-test?return_to=/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'
          }
        }
      });

      if (error) {
        setError(error.message);
        setStatus('Error');
      } else {
        setStatus('Redirecting to Google...');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('Error');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>OAuth Test Page</h1>
      <p>Status: {status}</p>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <button onClick={startOAuth} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Test OAuth Flow
      </button>
    </div>
  );
}
