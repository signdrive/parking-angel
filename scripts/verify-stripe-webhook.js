#!/usr/bin/env node

/**
 * Stripe Webhook Verification Script
 * Run with: node scripts/verify-stripe-webhook.js
 */

const https = require('https');
const crypto = require('crypto');

// Configuration
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:3000/api/stripe-webhook';
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_12345678901234567890123456789012';

// Test payload
const testPayload = JSON.stringify({
  id: 'evt_test_webhook',
  object: 'event',
  api_version: '2023-10-16',
  created: Math.floor(Date.now() / 1000),
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_123',
      customer: 'cus_test_123',
      metadata: {
        userId: 'test-user-id',
        tier: 'premium'
      }
    }
  }
});

// Generate Stripe signature
function generateStripeSignature(payload, secret) {
  const timestamp = Math.floor(Date.now() / 1000);
  const payloadToSign = `${timestamp}.${payload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadToSign, 'utf8')
    .digest('hex');
  
  return `t=${timestamp},v1=${signature}`;
}

// Test webhook endpoint
async function testWebhook() {
  console.log('🧪 Testing Stripe Webhook Setup...\n');
  
  const signature = generateStripeSignature(testPayload, WEBHOOK_SECRET);
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(testPayload),
      'stripe-signature': signature,
      'User-Agent': 'Stripe-Webhook-Test/1.0'
    }
  };

  console.log('📍 Webhook URL:', WEBHOOK_URL);
  console.log('🔐 Signature:', signature.substring(0, 50) + '...');
  console.log('📦 Payload length:', testPayload.length, 'bytes\n');

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: options.headers,
      body: testPayload
    });

    console.log('📊 Response Status:', response.status);
    console.log('📄 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📝 Response Body:', responseText || '(empty)');

    if (response.ok) {
      console.log('\n✅ Webhook test SUCCESSFUL!');
      console.log('Your Stripe webhook is properly configured and responding.');
    } else {
      console.log('\n❌ Webhook test FAILED!');
      console.log('Check your webhook implementation and signature verification.');
    }

  } catch (error) {
    console.log('\n🚨 Error testing webhook:');
    console.error(error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Possible solutions:');
      console.log('1. Make sure your Next.js server is running (npm run dev)');
      console.log('2. Verify the webhook URL is correct');
      console.log('3. Check if localhost:3000 is accessible');
    }
  }
}

// Environment validation
function validateEnvironment() {
  console.log('🔍 Environment Check:\n');
  
  const requiredVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  let allValid = true;
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
    } else {
      console.log(`❌ ${varName}: Not set`);
      allValid = false;
    }
  });

  if (!allValid) {
    console.log('\n⚠️  Some environment variables are missing!');
    console.log('Make sure to set them in your .env.local file.');
    return false;
  }

  console.log('\n✅ All required environment variables are set!\n');
  return true;
}

// Main execution
if (require.main === module) {
  console.log('🎯 Stripe Webhook Verification Tool\n');
  console.log('=' .repeat(50));
  
  if (validateEnvironment()) {
    testWebhook();
  }
}

module.exports = { testWebhook, validateEnvironment };
