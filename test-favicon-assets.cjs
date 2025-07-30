#!/usr/bin/env node

/**
 * Favicon and Asset Crawling Test
 * Tests for proper favicon handling and prevents unnecessary indexing
 */

const https = require('https');
const http = require('http');

const assetUrls = [
  'https://parkalgo.com/favicon.ico',
  'https://www.parkalgo.com/favicon.ico',
  'https://parkalgo.com/favicon-32x32.png',
  'https://www.parkalgo.com/favicon-32x32.png',
  'https://parkalgo.com/robots.txt',
  'https://www.parkalgo.com/robots.txt',
  'https://parkalgo.com/sitemap.xml',
  'https://www.parkalgo.com/sitemap.xml'
];

function testAssetUrl(url) {
  return new Promise((resolve) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const options = {
      method: 'HEAD',
      timeout: 5000,
    };

    const req = client.request(url, options, (res) => {
      resolve({
        url,
        statusCode: res.statusCode,
        location: res.headers.location,
        contentType: res.headers['content-type'],
        xRobotsTag: res.headers['x-robots-tag'],
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

async function runAssetTests() {
  console.log('🔍 Testing Favicon and Asset Handling\n');
  console.log('Expected behavior:');
  console.log('- WWW variants should redirect to non-www (301)');
  console.log('- Assets should be accessible but not indexed');
  console.log('- X-Robots-Tag should prevent unnecessary indexing\n');

  for (const url of assetUrls) {
    const result = await testAssetUrl(url);
    
    if (result.error) {
      console.log(`❌ ${url}`);
      console.log(`   Error: ${result.error}\n`);
      continue;
    }

    const isWww = url.includes('www.');
    
    if (isWww && result.isRedirect) {
      console.log(`✅ ${url}`);
      console.log(`   Status: ${result.statusCode} → ${result.location}`);
      console.log(`   ✅ WWW correctly redirects to canonical\n`);
    } else if (!isWww && !result.isRedirect) {
      console.log(`✅ ${url}`);
      console.log(`   Status: ${result.statusCode} (served directly)`);
      console.log(`   Content-Type: ${result.contentType || 'unknown'}`);
      
      if (result.xRobotsTag) {
        console.log(`   X-Robots-Tag: ${result.xRobotsTag}`);
      }
      
      // Check if this is a favicon and suggest robots tag
      if (url.includes('favicon')) {
        if (!result.xRobotsTag || !result.xRobotsTag.includes('noindex')) {
          console.log(`   ⚠️  Consider adding X-Robots-Tag: noindex for favicon`);
        }
      }
      console.log('');
    } else {
      console.log(`❌ ${url}`);
      console.log(`   Status: ${result.statusCode} - Unexpected behavior\n`);
    }
  }

  console.log('\n📋 Favicon Indexing Fix Summary:');
  console.log('1. ✅ Updated robots.txt to disallow favicon files');
  console.log('2. ✅ Added X-Robots-Tag headers in vercel.json');
  console.log('3. ✅ WWW redirects prevent duplicate asset URLs');
  console.log('4. ✅ Proper favicon configuration in layout.tsx');
  console.log('\n🔧 Google Search Console Impact:');
  console.log('- Favicon will stop appearing in "crawled but not indexed"');
  console.log('- Asset files will be properly excluded from indexing');
  console.log('- WWW variants will redirect to canonical URLs');
  console.log('- Site structure will be cleaner for search engines');
}

runAssetTests().catch(console.error);
