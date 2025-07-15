#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const isProduction = process.env.NODE_ENV === 'production';
const siteUrl = isProduction ? 'https://parkalgo.com' : 'http://localhost:3000';

console.log('🔍 Testing auth configuration...');
console.log('📍 Environment:', isProduction ? 'PRODUCTION' : 'LOCAL DEVELOPMENT');
console.log('📍 Supabase URL:', supabaseUrl);
console.log('🔗 Expected callback URL:', `${siteUrl}/auth/callback`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthConfig() {
  try {
    console.log('\n📱 Testing Google OAuth URL generation...');
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${siteUrl}/auth/callback`,
      }
    });

    if (error) {
      console.error('❌ OAuth URL generation failed:', error.message);
      return;
    }

    console.log('✅ OAuth URL generated successfully');
    console.log('🔗 Redirect URL configured for:', `${siteUrl}/auth/callback`);
    
    console.log('\n🔧 OAuth Configuration Requirements:');
    console.log('1. Supabase Dashboard → Authentication → URL Configuration');
    console.log('   - Site URL: https://parkalgo.com');
    console.log('   - Redirect URLs: https://parkalgo.com/auth/callback');
    console.log('   - Redirect URLs: https://parkalgo.com/auth/callback-implicit');
    console.log('   - Redirect URLs: http://localhost:3000/auth/callback (for local dev)');
    console.log('2. Google Cloud Console → Credentials → OAuth 2.0 Client');
    console.log('   - Add: https://parkalgo.com/auth/callback');
    console.log('   - Add: http://localhost:3000/auth/callback (for local dev)');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuthConfig();
