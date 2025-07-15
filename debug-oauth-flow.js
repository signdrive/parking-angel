// Debug script to test the full OAuth flow
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('✅ Supabase URL Configuration:');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? 'Present' : 'Missing');

console.log('\n✅ Callback URLs in Supabase (from screenshot):');
console.log('- https://automatic-umbrella-66rqvg9j35545-3000.app.github.dev/auth/callback');
console.log('- https://automatic-umbrella-66rqvg9j35545-3000.app.github.dev/auth/callback/*');

console.log('\n🔍 Next step: Test the OAuth flow manually');
console.log('1. Open: https://automatic-umbrella-66rqvg9j35545-3000.app.github.dev/auth/login');
console.log('2. Click "Sign in with Google"');
console.log('3. Complete Google authentication');
console.log('4. Check if you are redirected back successfully');

console.log('\n⚠️  If it still fails with chrome-error://chromewebdata/:');
console.log('The issue might be in the callback route processing, not URL configuration');

// Test the Supabase connection
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log('\n✅ Supabase connection test:');
    console.log('Session check:', error ? 'Error' : 'Success');
    if (error) console.log('Error details:', error.message);
  } catch (err) {
    console.log('\n❌ Supabase connection error:', err.message);
  }
}

testConnection();
