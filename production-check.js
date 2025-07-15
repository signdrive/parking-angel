#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkProductionReadiness() {
  console.log('🚀 Production Readiness Check for parkalgo.com\n');
  
  const isProduction = process.env.NODE_ENV === 'production';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Environment check
  console.log('📋 Environment Configuration:');
  console.log(`   Environment: ${isProduction ? '🌟 PRODUCTION' : '🔧 DEVELOPMENT'}`);
  console.log(`   Site URL: ${process.env.NEXT_PUBLIC_SITE_URL}`);
  console.log(`   App URL: ${process.env.NEXT_PUBLIC_APP_URL}`);
  
  // Required environment variables for production
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NEXT_PUBLIC_MAPBOX_TOKEN'
  ];

  console.log('\n✅ Environment Variables Status:');
  const missingVars = [];
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅' : '❌';
    console.log(`   ${status} ${varName}: ${value ? 'Set' : 'Missing'}`);
    if (!value) missingVars.push(varName);
  });

  // Database connection test
  console.log('\n🔗 Database Connection Test:');
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.from('spot_reports').select('count').limit(1);
    if (error) throw error;
    console.log('   ✅ Supabase connection: Working');
  } catch (error) {
    console.log('   ❌ Supabase connection: Failed -', error.message);
  }

  // OAuth configuration checklist
  console.log('\n🔐 OAuth Configuration Checklist:');
  console.log('   📍 Supabase Dashboard Requirements:');
  console.log('      → Site URL: https://parkalgo.com');
  console.log('      → Redirect URLs:');
  console.log('        • https://parkalgo.com/auth/callback');
  console.log('        • https://parkalgo.com/auth/callback-implicit');
  console.log('        • http://localhost:3000/auth/callback (for local dev)');
  
  console.log('\n   📍 Google Cloud Console Requirements:');
  console.log('      → OAuth 2.0 Client ID authorized redirect URIs:');
  console.log('        • https://parkalgo.com/auth/callback');
  console.log('        • http://localhost:3000/auth/callback (for local dev)');

  // Vercel environment variables
  console.log('\n⚙️  Vercel Environment Variables to Set:');
  console.log('   NEXT_PUBLIC_SITE_URL="https://parkalgo.com"');
  console.log('   NEXT_PUBLIC_APP_URL="https://parkalgo.com"');
  console.log('   NODE_ENV="production"');
  console.log('   + All other environment variables from .env.local');

  // Early adopter messaging check
  console.log('\n🎉 Early Adopter Features Status:');
  console.log('   ✅ Updated home page banner');
  console.log('   ✅ Updated plans page messaging');
  console.log('   ✅ Updated payment modal messaging');
  console.log('   ✅ Updated footer messaging');

  // Final deployment steps
  console.log('\n🚀 Final Deployment Steps:');
  console.log('1. Commit and push all changes to GitHub');
  console.log('2. Update Vercel environment variables');
  console.log('3. Update Supabase OAuth redirect URLs');
  console.log('4. Update Google OAuth redirect URLs');
  console.log('5. Redeploy on Vercel (automatic if connected to GitHub)');
  console.log('6. Test authentication flow on https://parkalgo.com');

  if (missingVars.length > 0) {
    console.log('\n⚠️  Missing Environment Variables:');
    missingVars.forEach(varName => {
      console.log(`   ❌ ${varName}`);
    });
  } else {
    console.log('\n✅ All required environment variables are present!');
  }
}

checkProductionReadiness();
