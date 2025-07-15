import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing callback URL validation...');

// Test different callback URLs
const testUrls = [
  'https://automatic-umbrella-66rqvg9j35545-3000.app.github.dev/auth/callback',
  'http://localhost:3000/auth/callback',
  'https://automatic-umbrella-66rqvg9j35545-3001.app.github.dev/auth/callback'
];

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCallbackUrls() {
  for (const url of testUrls) {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: url,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'
          }
        }
      });

      console.log(`URL: ${url}`);
      if (error) {
        console.log(`  Error: ${error.message}`);
      } else {
        console.log(`  Success: ${data.url ? 'Valid' : 'Invalid'}`);
      }
    } catch (err) {
      console.log(`  Exception: ${err.message}`);
    }
  }
}

testCallbackUrls();
