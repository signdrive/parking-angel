#!/usr/bin/env node

// Clear corrupted session data to fix authentication
console.log('🧹 Clearing corrupted session data...');

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearSession() {
  try {
    // Sign out to clear any corrupted session
    await supabase.auth.signOut();
    console.log('✅ Session cleared successfully');
    
    // Clear localStorage if running in browser context
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
      window.sessionStorage.clear();
      console.log('✅ Browser storage cleared');
    }
    
    console.log('🎉 All session data cleared. Please try logging in again.');
  } catch (error) {
    console.error('❌ Error clearing session:', error.message);
  }
}

clearSession();
