/**
 * Test script to verify the complete subscription flow
 * Run this after starting the development server
 */

const BASE_URL = 'http://localhost:3001';

// Test data
const testPlans = ['navigator', 'pro_parker', 'fleet_manager'];

async function testEndpoint(url, options = {}) {
  try {
    console.log(`Testing: ${url}`);
    const response = await fetch(url, options);
    const data = await response.text();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${data.substring(0, 200)}...`);
    console.log('---');
    
    return { status: response.status, data };
  } catch (error) {
    console.error(`Error testing ${url}:`, error.message);
    return { error: error.message };
  }
}

async function testSubscriptionFlow() {
  console.log('🚀 Testing ParkAlgo Subscription Flow\n');
  
  // 1. Test subscription page
  console.log('1. Testing subscription page...');
  await testEndpoint(`${BASE_URL}/subscription`);
  
  // 2. Test checkout session creation (requires auth, so expect 401)
  console.log('2. Testing checkout session creation...');
  await testEndpoint(`${BASE_URL}/api/stripe/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tier: 'navigator' })
  });
  
  // 3. Test webhook endpoint (expect 400 due to missing signature)
  console.log('3. Testing webhook endpoint...');
  await testEndpoint(`${BASE_URL}/api/stripe/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ test: 'data' })
  });
  
  // 4. Test verify session (expect 400 due to missing session_id)
  console.log('4. Testing verify session endpoint...');
  await testEndpoint(`${BASE_URL}/api/stripe/verify-session`);
  
  // 5. Test payment success page
  console.log('5. Testing payment success page...');
  await testEndpoint(`${BASE_URL}/payment-success`);
  
  // 6. Test payment failed page
  console.log('6. Testing payment failed page...');
  await testEndpoint(`${BASE_URL}/failed`);
  
  console.log('✅ Flow test complete!');
  console.log('\nNext steps:');
  console.log('1. Visit http://localhost:3001/subscription to test the UI');
  console.log('2. Login with Google OAuth');
  console.log('3. Select a plan and test the Stripe checkout');
  console.log('4. Use Stripe test cards: 4242424242424242');
}

// Run the test
testSubscriptionFlow().catch(console.error);
