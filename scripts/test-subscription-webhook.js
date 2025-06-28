#!/usr/bin/env node
const crypto = require('crypto');
const http = require('http');

// Get the webhook secret from env or use test secret
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret';

// Generate a valid UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Create a test checkout session event
const createTestEvent = (type = 'checkout.session.completed') => {
  const timestamp = Math.floor(Date.now() / 1000);
  const testUserId = generateUUID();
  return {
    id: `evt_test_${Date.now()}`,
    object: 'event',
    api_version: '2025-05-28.basil',
    created: timestamp,
    type,
    data: {
      object: {
        id: `cs_test_${Date.now()}`,
        object: 'checkout.session',
        amount_subtotal: 2999,
        amount_total: 2999,
        currency: 'usd',
        customer: 'cus_test_123',
        customer_email: 'test@example.com',
        metadata: {
          userId: testUserId,
          tier: 'navigator',
          customerEmail: 'test@example.com'
        },
        mode: 'subscription',
        payment_status: 'paid',
        status: 'complete',
        subscription: `sub_test_${Date.now()}`,
      }
    },
    account: 'acct_test_123',
    livemode: false
  };
};

// Generate Stripe signature
const generateStripeSignature = (timestamp, payload) => {
  // Create the payload string to sign (timestamp + '.' + payload)
  const payloadToSign = `${timestamp}.${payload}`;
  
  // Create the signature using the webhook secret
  const signature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payloadToSign)
    .digest('hex');
  
  // Return the Stripe signature format
  return `t=${timestamp},v1=${signature}`;
};

// Send webhook request
const sendWebhook = (eventType = 'checkout.session.completed', port = 3001) => {
  const event = createTestEvent(eventType);
  const payload = JSON.stringify(event);
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = generateStripeSignature(timestamp, payload);
  
  const options = {
    hostname: 'localhost',
    port,
    path: '/api/stripe/webhook',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      'stripe-signature': signature,
      'User-Agent': 'Stripe/v1 TestClient/1.0',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Accept-Encoding': 'gzip, deflate, br',
      'Stripe-Version': '2025-05-28.basil'
    }
  };

  console.log('\n🚀 Testing Stripe Subscription Webhook');
  console.log('━'.repeat(50));
  console.log('Event Type:', eventType);
  console.log('Endpoint:', `http://localhost:${port}/api/stripe/webhook`);
  console.log('User ID:', event.data.object.metadata.userId);
  console.log('Plan:', event.data.object.metadata.tier);
  console.log('━'.repeat(50), '\n');

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', res.statusCode, res.statusMessage);
      try {
        const responseData = data ? JSON.parse(data) : {};
        console.log('Response Data:', JSON.stringify(responseData, null, 2));
      } catch (err) {
        console.error('Error parsing response:', err);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error sending webhook:', error);
  });

  req.write(payload);
  req.end();
};

// Parse command line arguments
const args = process.argv.slice(2);
const eventType = args[0] || 'checkout.session.completed';
const port = parseInt(args[1], 10) || 3001;

// Run the test
sendWebhook(eventType, port);
