#!/usr/bin/env node

// Test the SEO API to see if dynamic content is working

const testPaths = [
  '/',
  '/features',
  '/blog',
  '/plans',
  '/contact'
];

async function testSEOEndpoint(path) {
  console.log(`\n=== Testing path: ${path} ===`);
  
  try {
    const response = await fetch(`https://parkalgo.com/api/seo?path=${encodeURIComponent(path)}`, {
      headers: {
        'User-Agent': 'Screaming Frog SEO Spider/19.1'
      }
    });
    
    const html = await response.text();
    
    // Extract key elements
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const canonicalMatch = html.match(/rel="canonical" href="([^"]+)"/);
    const descriptionMatch = html.match(/name="description" content="([^"]+)"/);
    
    console.log('Title:', titleMatch ? titleMatch[1] : 'NOT FOUND');
    console.log('Canonical:', canonicalMatch ? canonicalMatch[1] : 'NOT FOUND');
    console.log('Description:', descriptionMatch ? descriptionMatch[1].substring(0, 80) + '...' : 'NOT FOUND');
    
    // Check if it's dynamic or static
    const isHomepage = canonicalMatch && canonicalMatch[1] === 'https://parkalgo.com/';
    const hasCorrectCanonical = canonicalMatch && canonicalMatch[1] === `https://parkalgo.com${path === '/' ? '' : path}`;
    
    console.log('Status:', hasCorrectCanonical ? '✅ CORRECT' : (isHomepage ? '❌ POINTS TO HOMEPAGE' : '❌ INCORRECT'));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function runTests() {
  console.log('Testing SEO API dynamic content generation...\n');
  
  for (const path of testPaths) {
    await testSEOEndpoint(path);
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
  }
}

runTests();
