#!/usr/bin/env node

/**
 * Test canonical URL configuration for Google Search Console
 * This script verifies our canonical URL setup is working correctly
 */

const https = require('https');
const http = require('http');

const testUrls = [
  'https://www.parkalgo.com/',
  'https://www.parkalgo.com/auth/login',
  'https://www.parkalgo.com/auth/signup',
  'http://parkalgo.com/',
  'http://www.parkalgo.com/',
  'https://parkalgo.com/',
  'https://parkalgo.com/auth/login',
  'https://parkalgo.com/auth/signup'
];

function testRedirect(url) {
  return new Promise((resolve) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const options = {
      method: 'HEAD',
      timeout: 5000,
      // Don't follow redirects automatically
      agent: false
    };

    const req = client.request(url, options, (res) => {
      resolve({
        url,
        statusCode: res.statusCode,
        location: res.headers.location,
        canonical: res.headers['x-canonical-url'],
        isRedirect: res.statusCode >= 300 && res.statusCode < 400
      });
    });

    req.on('error', (error) => {
      resolve({
        url,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        error: 'Timeout'
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('🔍 Testing Canonical URL Configuration for Google Search Console\n');
  console.log('Expected behavior:');
  console.log('- All www URLs should redirect to non-www (301)');
  console.log('- All HTTP URLs should redirect to HTTPS (301)');
  console.log('- Final canonical should always be https://parkalgo.com/path\n');

  for (const url of testUrls) {
    const result = await testRedirect(url);
    
    if (result.error) {
      console.log(`❌ ${url}`);
      console.log(`   Error: ${result.error}\n`);
      continue;
    }

    const isWww = url.includes('www.');
    const isHttp = url.startsWith('http://');
    const expectedRedirect = isWww || isHttp;

    if (expectedRedirect && result.isRedirect) {
      console.log(`✅ ${url}`);
      console.log(`   Status: ${result.statusCode} → ${result.location}`);
      
      // Verify redirect target is canonical
      if (result.location && !result.location.includes('www.') && result.location.startsWith('https://parkalgo.com')) {
        console.log(`   ✅ Redirects to canonical URL`);
      } else {
        console.log(`   ❌ Redirect target is not canonical: ${result.location}`);
      }
    } else if (!expectedRedirect && !result.isRedirect) {
      console.log(`✅ ${url}`);
      console.log(`   Status: ${result.statusCode} (served directly)`);
      
      if (result.canonical) {
        console.log(`   Canonical header: ${result.canonical}`);
      }
    } else {
      console.log(`❌ ${url}`);
      console.log(`   Status: ${result.statusCode} - Unexpected behavior`);
      console.log(`   Expected redirect: ${expectedRedirect}, Got redirect: ${result.isRedirect}`);
    }
    
    console.log('');
  }

  console.log('\n📋 Google Search Console Fix Summary:');
  console.log('1. All www variants redirect to non-www (fixes duplicate content)');
  console.log('2. All pages have explicit canonical URLs in metadata');
  console.log('3. Robots.txt specifies canonical host');
  console.log('4. Sitemap only includes canonical URLs');
  console.log('\nNext steps:');
  console.log('- Deploy these changes to production');
  console.log('- Request re-validation in Google Search Console');
  console.log('- Monitor GSC for 24-48 hours for validation');
}

runTests().catch(console.error);
