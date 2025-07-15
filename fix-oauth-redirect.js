#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Fixing OAuth redirect configuration...\n');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Make sure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRedirectConfig() {
  try {
    console.log('📍 Current Supabase URL:', supabaseUrl);
    console.log('🔗 Target redirect URL: http://localhost:3000/auth/callback\n');
    
    console.log('⚠️  ISSUE IDENTIFIED:');
    console.log('   Your OAuth provider is redirecting to: http://localhost/auth/callback-implicit');
    console.log('   But your Next.js server is running on: http://localhost:3000\n');
    
    console.log('🛠️  SOLUTION - Update these configurations:\n');
    
    console.log('1. 🔥 SUPABASE CONFIGURATION:');
    console.log('   → Go to: https://supabase.com/dashboard/projects/' + supabaseUrl.split('.')[0].split('//')[1] + '/auth/url-configuration');
    console.log('   → Set Site URL to: http://localhost:3000');
    console.log('   → Add redirect URL: http://localhost:3000/auth/callback');
    console.log('   → Add redirect URL: http://localhost:3000/auth/callback-implicit\n');
    
    console.log('2. 🔥 GOOGLE OAUTH CONFIGURATION:');
    console.log('   → Go to: https://console.cloud.google.com/apis/credentials');
    console.log('   → Find your OAuth 2.0 Client ID');
    console.log('   → Add authorized redirect URI: http://localhost:3000/auth/callback');
    console.log('   → Save changes\n');
    
    console.log('3. 🔥 TEMPORARY WORKAROUND:');
    console.log('   When you get redirected to: http://localhost/auth/callback-implicit?code=...');
    console.log('   Manually change it to: http://localhost:3000/auth/callback-implicit?code=...');
    console.log('   (Just add :3000 after localhost)\n');
    
    console.log('4. 🔥 FOR YOUR CURRENT CALLBACK:');
    console.log('   Copy this URL and paste it in your browser:');
    console.log('   http://localhost:3000/auth/callback-implicit?code=7330dfcd-ab76-49ca-bcb0-b9e8dc98b056&return_to=%2Fdashboard\n');
    
    console.log('✅ After updating the OAuth configurations, new logins will redirect correctly!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixRedirectConfig();
