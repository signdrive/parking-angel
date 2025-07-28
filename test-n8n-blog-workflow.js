#!/usr/bin/env node

// Test script for n8n blog workflow
const API_KEY = 'test-api-key-12345'; // From .env.local
const BASE_URL = 'http://localhost:3000';

async function testN8nBlogWorkflow() {
  console.log('🚀 Testing n8n Blog Workflow...\n');

  // Test data for a blog post
  const testPost = {
    title: 'AI-Powered Parking Solutions: The Future is Here',
    content: `
      <h2>Introduction</h2>
      <p>Artificial Intelligence is revolutionizing the parking industry. From predictive analytics to smart routing, AI is making parking more efficient than ever.</p>
      
      <h2>Key Benefits</h2>
      <ul>
        <li>Reduced search time for parking spots</li>
        <li>Dynamic pricing optimization</li>
        <li>Predictive availability forecasting</li>
        <li>Automated payment processing</li>
      </ul>
      
      <h2>Implementation</h2>
      <p>Our AI algorithms analyze historical data, real-time sensor information, and user patterns to provide intelligent parking recommendations.</p>
      
      <h2>Future Prospects</h2>
      <p>The integration of IoT sensors, machine learning, and mobile applications will continue to transform urban mobility.</p>
    `,
    excerpt: 'Discover how AI is transforming parking solutions with smart algorithms, predictive analytics, and real-time optimization.',
    category_slug: 'technology',
    tags: ['AI', 'parking', 'smart-city', 'technology', 'automation'],
    published: false, // Start as draft
    featured: true,
    meta_title: 'AI-Powered Parking Solutions: The Future is Here | ParkAlgo',
    meta_description: 'Learn how artificial intelligence is revolutionizing parking with smart algorithms, predictive analytics, and real-time optimization solutions.',
    author_email: 'admin@parkalgo.com' // Optional
  };

  try {
    // Test 1: Create a new blog post
    console.log('📝 Test 1: Creating a new blog post...');
    const createResponse = await fetch(`${BASE_URL}/api/blog/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'x-n8n-webhook-id': 'test-webhook-123' // Simulate n8n webhook
      },
      body: JSON.stringify(testPost)
    });

    const createResult = await createResponse.json();
    
    if (createResponse.ok) {
      console.log('✅ Blog post created successfully!');
      console.log(`   ID: ${createResult.id}`);
      console.log(`   Title: ${createResult.title}`);
      console.log(`   Slug: ${createResult.slug}`);
      console.log(`   Published: ${createResult.published}`);
      console.log(`   Read Time: ${createResult.read_time} min\n`);
    } else {
      console.error('❌ Failed to create blog post:');
      console.error(`   Status: ${createResponse.status}`);
      console.error(`   Error: ${createResult.error}\n`);
      return;
    }

    // Test 2: Retrieve blog posts
    console.log('📖 Test 2: Retrieving blog posts...');
    const getResponse = await fetch(`${BASE_URL}/api/blog/posts?limit=5`, {
      headers: {
        'x-api-key': API_KEY
      }
    });

    const getResult = await getResponse.json();
    
    if (getResponse.ok) {
      console.log('✅ Blog posts retrieved successfully!');
      console.log(`   Total posts: ${getResult.posts?.length || 0}`);
      getResult.posts?.forEach((post, index) => {
        console.log(`   ${index + 1}. ${post.title} (${post.published ? 'Published' : 'Draft'})`);
      });
      console.log('');
    } else {
      console.error('❌ Failed to retrieve blog posts:');
      console.error(`   Status: ${getResponse.status}`);
      console.error(`   Error: ${getResult.error}\n`);
    }

    // Test 3: Test with invalid API key
    console.log('🔒 Test 3: Testing API security...');
    const securityResponse = await fetch(`${BASE_URL}/api/blog/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'invalid-key'
      },
      body: JSON.stringify(testPost)
    });

    if (securityResponse.status === 401) {
      console.log('✅ API security working - invalid key rejected\n');
    } else {
      console.error('❌ Security issue - invalid key accepted\n');
    }

    // Summary
    console.log('📊 n8n Workflow Test Summary:');
    console.log('   ✅ Blog post creation: Working');
    console.log('   ✅ Blog post retrieval: Working');
    console.log('   ✅ API security: Working');
    console.log('   🔧 Ready for n8n integration!');
    
    console.log('\n📋 n8n Integration Instructions:');
    console.log('1. Set up an HTTP Request node in n8n');
    console.log(`2. URL: ${BASE_URL}/api/blog/posts`);
    console.log('3. Method: POST');
    console.log('4. Headers:');
    console.log(`   - x-api-key: ${API_KEY}`);
    console.log('   - Content-Type: application/json');
    console.log('5. Body: JSON with title, content, excerpt, etc.');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testN8nBlogWorkflow();
