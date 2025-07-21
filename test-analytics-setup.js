#!/usr/bin/env node

/**
 * Test Google Analytics setup for parking-angel
 * This script checks if GA is properly configured and provides debugging info
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Google Analytics Setup Checker for Park Algo\n');

// Check environment variables
console.log('1️⃣ Checking Environment Variables:');
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const gaId = envContent.match(/NEXT_PUBLIC_GA_MEASUREMENT_ID="(.+?)"/);
  if (gaId) {
    console.log('✅ GA_MEASUREMENT_ID found:', gaId[1]);
  } else {
    console.log('❌ GA_MEASUREMENT_ID not found in .env.local');
  }
} else {
  console.log('❌ .env.local file not found');
}

// Check layout.tsx
console.log('\n2️⃣ Checking Layout Configuration:');
const layoutPath = path.join(process.cwd(), 'app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  
  if (layoutContent.includes('GoogleAnalyticsProvider')) {
    console.log('✅ GoogleAnalyticsProvider imported');
  } else {
    console.log('❌ GoogleAnalyticsProvider not imported');
  }
  
  if (layoutContent.includes('NEXT_PUBLIC_GA_MEASUREMENT_ID')) {
    console.log('✅ Environment variable used for GA ID');
  } else {
    console.log('❌ Environment variable not used');
  }
} else {
  console.log('❌ layout.tsx not found');
}

// Check analytics provider
console.log('\n3️⃣ Checking Analytics Provider:');
const providerPath = path.join(process.cwd(), 'components/analytics/google-analytics-provider.tsx');
if (fs.existsSync(providerPath)) {
  console.log('✅ GoogleAnalyticsProvider component exists');
} else {
  console.log('❌ GoogleAnalyticsProvider component not found');
}

// Production deployment check
console.log('\n4️⃣ Production Deployment Check:');
console.log('📋 For Vercel deployment, ensure these environment variables are set:');
console.log('   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XDLGR86H8Q');
console.log('   NODE_ENV=production');

console.log('\n5️⃣ Testing Instructions:');
console.log('🔧 Local Testing:');
console.log('   1. Run: npm run dev');
console.log('   2. Open browser dev tools (F12)');
console.log('   3. Go to Network tab');
console.log('   4. Visit pages and look for requests to googletagmanager.com');
console.log('   5. Check Console for GA messages');

console.log('\n🚀 Production Testing:');
console.log('   1. Visit https://parkalgo.com');
console.log('   2. Open browser dev tools');
console.log('   3. In Console, type: window.gtag');
console.log('   4. Should return: function gtag(){dataLayer.push(arguments);}');
console.log('   5. Check Google Analytics Real-time reports');

console.log('\n📊 Google Analytics Dashboard:');
console.log('   Visit: https://analytics.google.com/');
console.log('   Select Property: Park Algo');
console.log('   Check: Real-time → Overview for live visitors');

console.log('\n🐛 Debugging Commands:');
console.log('   • Check dataLayer: window.dataLayer');
console.log('   • Manual event: gtag("event", "test_event", {test: true})');
console.log('   • Check GA ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID');

console.log('\n✅ Setup Complete! Deploy to production to start tracking.');
