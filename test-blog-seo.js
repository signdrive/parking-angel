#!/usr/bin/env node

// Test dynamic blog SEO and sitemap functionality

async function testBlogSEO() {
  console.log('=== Testing Dynamic Blog SEO ===\n');
  
  const testUrls = [
    '/blog',
    '/blog/category/ai-parking',
    '/blog/tag/optimization',
    '/sitemap.xml',
    '/blog/sitemap.xml'
  ];
  
  for (const url of testUrls) {
    console.log(`\n--- Testing: ${url} ---`);
    
    try {
      const response = await fetch(`https://parkalgo.com${url}`, {
        headers: {
          'User-Agent': 'Screaming Frog SEO Spider/19.1'
        }
      });
      
      const content = await response.text();
      
      if (url.includes('sitemap.xml')) {
        // Test sitemap
        const hasUrlEntries = content.includes('<url>') || content.includes('<sitemap>');
        const isValidXML = content.includes('<?xml') && content.includes('</urlset>') || content.includes('</sitemapindex>');
        
        console.log(`Status: ${response.status}`);
        console.log(`Content-Type: ${response.headers.get('content-type')}`);
        console.log(`Has URL entries: ${hasUrlEntries}`);
        console.log(`Valid XML: ${isValidXML}`);
        
        if (content.length < 1000) {
          console.log('Content preview:', content.substring(0, 500));
        } else {
          console.log(`Content length: ${content.length} characters`);
        }
      } else {
        // Test SEO content
        const titleMatch = content.match(/<title>(.*?)<\/title>/);
        const canonicalMatch = content.match(/rel="canonical" href="([^"]+)"/);
        const descriptionMatch = content.match(/name="description" content="([^"]+)"/);
        const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/);
        
        console.log(`Status: ${response.status}`);
        console.log('Title:', titleMatch ? titleMatch[1] : 'NOT FOUND');
        console.log('Canonical:', canonicalMatch ? canonicalMatch[1] : 'NOT FOUND');
        console.log('Description:', descriptionMatch ? descriptionMatch[1].substring(0, 80) + '...' : 'NOT FOUND');
        console.log('H1:', h1Match ? h1Match[1] : 'NOT FOUND');
        
        // Check if canonical matches the URL
        const expectedCanonical = `https://parkalgo.com${url}`;
        const hasCorrectCanonical = canonicalMatch && canonicalMatch[1] === expectedCanonical;
        console.log(`Canonical Status: ${hasCorrectCanonical ? '✅ CORRECT' : '❌ INCORRECT'}`);
      }
      
    } catch (error) {
      console.error(`Error testing ${url}:`, error.message);
    }
  }
}

// Test if there are actual blog posts in the sitemap
async function testBlogPostsInSitemap() {
  console.log('\n\n=== Testing Blog Posts in Sitemap ===\n');
  
  try {
    const response = await fetch('https://parkalgo.com/blog/sitemap.xml');
    const sitemap = await response.text();
    
    console.log(`Blog Sitemap Status: ${response.status}`);
    console.log(`Content Length: ${sitemap.length} characters`);
    
    // Extract URLs from sitemap
    const urlMatches = sitemap.match(/<loc>(.*?)<\/loc>/g);
    if (urlMatches) {
      console.log(`\nFound ${urlMatches.length} URLs in blog sitemap:`);
      urlMatches.slice(0, 5).forEach((match, index) => {
        const url = match.replace(/<\/?loc>/g, '');
        console.log(`${index + 1}. ${url}`);
      });
      
      if (urlMatches.length > 5) {
        console.log(`... and ${urlMatches.length - 5} more`);
      }
      
      // Test one blog post
      if (urlMatches.length > 0) {
        const firstBlogUrl = urlMatches[0].replace(/<\/?loc>/g, '').replace('https://parkalgo.com', '');
        console.log(`\n--- Testing individual blog post: ${firstBlogUrl} ---`);
        
        const blogResponse = await fetch(`https://parkalgo.com${firstBlogUrl}`, {
          headers: {
            'User-Agent': 'Screaming Frog SEO Spider/19.1'
          }
        });
        
        const blogContent = await blogResponse.text();
        const titleMatch = blogContent.match(/<title>(.*?)<\/title>/);
        const canonicalMatch = blogContent.match(/rel="canonical" href="([^"]+)"/);
        
        console.log(`Status: ${blogResponse.status}`);
        console.log('Title:', titleMatch ? titleMatch[1] : 'NOT FOUND');
        console.log('Canonical:', canonicalMatch ? canonicalMatch[1] : 'NOT FOUND');
        
        const expectedCanonical = `https://parkalgo.com${firstBlogUrl}`;
        const hasCorrectCanonical = canonicalMatch && canonicalMatch[1] === expectedCanonical;
        console.log(`Canonical Status: ${hasCorrectCanonical ? '✅ CORRECT' : '❌ INCORRECT'}`);
      }
    } else {
      console.log('No URLs found in blog sitemap');
    }
    
  } catch (error) {
    console.error('Error testing blog sitemap:', error.message);
  }
}

async function runTests() {
  await testBlogSEO();
  await testBlogPostsInSitemap();
}

runTests();
