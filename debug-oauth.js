import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Environment check:');
console.log('SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_KEY:', supabaseKey ? 'Present' : 'Missing');
console.log('SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL);

const supabase = createClient(supabaseUrl, supabaseKey);

// Test the OAuth flow configuration
async function testOAuthConfig() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account'
        }
      }
    });

    if (error) {
      console.error('OAuth config error:', error);
    } else {
      console.log('OAuth config successful:', data);
    }
  } catch (err) {
    console.error('OAuth test error:', err);
  }
}

testOAuthConfig();
