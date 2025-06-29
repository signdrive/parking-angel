/**
 * Test script to verify the Stripe webhook endpoint
 * 
 * Usage:
 * 1. Set STRIPE_SECRET_KEY in your .env.local file
 * 2. Run with: node test-webhook-verify.js
 * 
 * This will:
 * - Create a test checkout session with Stripe
 * - Extract its metadata
 * - Create a mock webhook event
 * - Send it to your local webhook endpoint
 * - Verify the response
 */

require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');
const fetch = require('node-fetch');
const crypto = require('crypto');

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil'
});

// Your webhook secret for testing 
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Helper to verify response
async function checkEndpointResponse(url, payload, signature) {
  try {
    console.log(`Testing endpoint: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': signature
      },
      body: payload
    });
    
    const data = await response.text();
    console.log(`Response status: ${response.status}`);
    
    try {
      const jsonData = JSON.parse(data);
      console.log('Response body:', jsonData);
    } catch (e) {
      console.log('Response body (text):', data.substring(0, 500));
    }
    
    return response.status;
  } catch (error) {
    console.error('Error calling endpoint:', error);
    return null;
  }
}

// Helper to generate a webhook signature
function generateWebhookSignature(payload, secret) {
  const timestamp = Math.floor(Date.now() / 1000);
  const payloadToSign = `${timestamp}.${payload}`;
  const signature = crypto.createHmac('sha256', secret)
    .update(payloadToSign)
    .digest('hex');
  
  return `t=${timestamp},v1=${signature}`;
}

async function testWebhook() {
  try {
    console.log('🧪 Testing Stripe webhook functionality...');
    
    // Generate a random test user ID
    const testUserId = `test_${crypto.randomUUID()}`;
    
    // Create a test checkout session (this won't charge anyone)
    console.log('📝 Creating test checkout session...');
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.NEXT_PUBLIC_STRIPE_NAVIGATOR_PRICE_ID,
          quantity: 1
        }
      ],
      success_url: 'http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/failed',
      metadata: {
        userId: testUserId,
        tier: 'navigator',
        test: true
      },
      subscription_data: {
        metadata: {
          userId: testUserId,
          tier: 'navigator',
          test: true
        }
      }
    });
    
    console.log(`✅ Test session created: ${session.id}`);
    console.log(`   User ID: ${testUserId}`);
    console.log(`   Tier: navigator`);
    
    // Create a mock completed checkout session event
    const eventData = {
      id: `evt_test_${Date.now()}`,
      object: 'event',
      api_version: '2025-05-28.basil',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          ...session,
          payment_status: 'paid',
          status: 'complete'
        }
      },
      livemode: false,
      pending_webhooks: 1,
      request: { id: null },
      type: 'checkout.session.completed'
    };
    
    const payload = JSON.stringify(eventData);
    
    // Generate a valid signature (if we have the secret)
    let signature = 'test_signature';
    if (endpointSecret) {
      signature = generateWebhookSignature(payload, endpointSecret);
      console.log('✅ Generated valid webhook signature');
    } else {
      console.warn('⚠️ No webhook secret found, using test signature (will fail signature verification)');
    }
    
    // Test the main webhook endpoint
    console.log('\n🔍 Testing primary webhook endpoint...');
    const mainStatus = await checkEndpointResponse(
      'http://localhost:3000/api/stripe-webhook',
      payload,
      signature
    );
    
    // Test the alternative webhook endpoint
    console.log('\n🔍 Testing alternative webhook endpoint...');
    const altStatus = await checkEndpointResponse(
      'http://localhost:3000/api/stripe/webhook',
      payload,
      signature
    );
    
    console.log('\n📊 Test Results:');
    console.log(`Primary webhook endpoint: ${mainStatus === 200 ? '✅ Success' : '❌ Failed'}`);
    console.log(`Alternative webhook endpoint: ${altStatus === 200 ? '✅ Success' : '❌ Failed'}`);
    
    // Test with invalid signature
    console.log('\n🔍 Testing with invalid signature (should fail)...');
    const invalidSig = 't=1234567890,v1=invalid_signature';
    const invalidStatus = await checkEndpointResponse(
      'http://localhost:3000/api/stripe-webhook',
      payload,
      invalidSig
    );
    
    console.log(`Invalid signature test: ${invalidStatus === 400 ? '✅ Correctly rejected' : '❌ Failed (should be rejected)'}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testWebhook();
