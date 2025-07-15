'use client';

import { useEffect } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';

export default function AuthDebugPage() {
  useEffect(() => {
    const clearAuthState = async () => {
      const supabase = getBrowserClient();
      
      console.log('🧹 Clearing authentication state...');
      
      // Clear Supabase session
      await supabase.auth.signOut();
      
      // Clear localStorage
      const keys = Object.keys(localStorage);
      const authKeys = keys.filter(key => 
        key.includes('supabase') || 
        key.includes('auth') || 
        key.includes('sb-')
      );
      
      authKeys.forEach(key => {
        console.log('Removing:', key);
        localStorage.removeItem(key);
      });
      
      // Clear sessionStorage
      const sessionKeys = Object.keys(sessionStorage);
      const authSessionKeys = sessionKeys.filter(key => 
        key.includes('supabase') || 
        key.includes('auth') || 
        key.includes('sb-')
      );
      
      authSessionKeys.forEach(key => {
        console.log('Removing session:', key);
        sessionStorage.removeItem(key);
      });
      
      console.log('✅ Authentication state cleared');
      
      // Reload the page to ensure clean state
      setTimeout(() => {
        window.location.href = '/test-auth';
      }, 1000);
    };
    
    clearAuthState();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Clearing Authentication State...</h1>
      <p>Please wait while we clear cached authentication data.</p>
      <p>You will be redirected to the test auth page in a moment.</p>
    </div>
  );
}
