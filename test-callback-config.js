// Test script to verify callback URL configuration
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing callback URL configuration...');
console.log('Supabase URL:', supabaseUrl);
console.log('Expected callback URL:', 'https://automatic-umbrella-66rqvg9j35545-3000.app.github.dev/auth/callback');

// The issue is likely that the callback URL needs to be added to Supabase dashboard
console.log('\nTo fix this issue:');
console.log('1. Go to your Supabase dashboard');
console.log('2. Navigate to Authentication > URL Configuration');
console.log('3. Add this URL to "Redirect URLs":');
console.log('   https://automatic-umbrella-66rqvg9j35545-3000.app.github.dev/auth/callback');
console.log('4. Save the configuration');
