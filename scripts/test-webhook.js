#!/usr/bin/env node

/**
 * Local Webhook Test Script
 * 
 * This script allows you to test your Stripe webhook handler locally
 * without needing ngrok or external tunneling.
 * 
 * Usage:
 *   node scripts/test-webhook.js
 *   node scripts/test-webhook.js --event checkout.session.completed
 *   node scripts/test-webhook.js --help
 */

const http = require('http');

// Sample webhook events for testing
const sampleEvents = {
  'checkout.session.completed': {
    "id": "evt_test_webhook",
    "object": "event",
    "api_version": "2023-10-16",
    "created": Math.floor(Date.now() / 1000),
    "data": {
      "object": {
        "id": "cs_test_a1b2c3d4e5f6g7h8i9j0k1l2",
        "object": "checkout.session",
        "amount_subtotal": 2999,
        "amount_total": 2999,
        "currency": "usd",
        "customer": "cus_test_customer_123",
        "customer_email": "test@example.com",
        "metadata": {},
        "mode": "subscription",
        "payment_status": "paid",
        "status": "complete",
        "subscription": "sub_test_subscription_123",
        "success_url": "https://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}",
        "url": null
      }
    },
    "livemode": false,
    "pending_webhooks": 1,
    "request": {
      "id": "req_test_123",
      "idempotency_key": null
    },
    "type": "checkout.session.completed"
  },

  'customer.subscription.created': {
    "id": "evt_test_subscription_created",
    "object": "event",
    "api_version": "2023-10-16",
    "created": Math.floor(Date.now() / 1000),
    "data": {
      "object": {
        "id": "sub_test_subscription_123",
        "object": "subscription",
        "cancel_at_period_end": false,
        "created": Math.floor(Date.now() / 1000),
        "current_period_end": Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
        "current_period_start": Math.floor(Date.now() / 1000),
        "customer": "cus_test_customer_123",
        "items": {
          "object": "list",
          "data": [
            {
              "id": "si_test_123",
              "object": "subscription_item",
              "price": {
                "id": "price_test_navigator",
                "object": "price",
                "currency": "usd",
                "recurring": {
                  "interval": "month"
                },
                "unit_amount": 2999
              },
              "quantity": 1
            }
          ]
        },
        "metadata": {},
        "status": "active"
      }
    },
    "livemode": false,
    "pending_webhooks": 1,
    "request": {
      "id": "req_test_456",
      "idempotency_key": null
    },
    "type": "customer.subscription.created"
  },

  'invoice.payment_succeeded': {
    "id": "evt_test_payment_succeeded",
    "object": "event",
    "api_version": "2023-10-16",
    "created": Math.floor(Date.now() / 1000),
    "data": {
      "object": {
        "id": "in_test_invoice_123",
        "object": "invoice",
        "amount_due": 2999,
        "amount_paid": 2999,
        "amount_remaining": 0,
        "billing_reason": "subscription_create",
        "currency": "usd",
        "customer": "cus_test_customer_123",
        "customer_email": "test@example.com",
        "hosted_invoice_url": "https://invoice.stripe.com/i/test",
        "invoice_pdf": "https://pay.stripe.com/invoice/test/pdf",
        "metadata": {},
        "paid": true,
        "payment_intent": "pi_test_payment_123",
        "status": "paid",
        "subscription": "sub_test_subscription_123",
        "subtotal": 2999,
        "total": 2999
      }
    },
    "livemode": false,
    "pending_webhooks": 1,
    "request": {
      "id": "req_test_789",
      "idempotency_key": null
    },
    "type": "invoice.payment_succeeded"
  }
};

function showHelp() {
  console.log(`
🎯 Stripe Webhook Local Tester

Usage:
  node scripts/test-webhook.js [options]

Options:
  --event <type>    Specify event type to test (default: checkout.session.completed)
  --port <number>   Specify port (default: 3000)
  --help           Show this help message

Available Events:
  - checkout.session.completed
  - customer.subscription.created
  - invoice.payment_succeeded

Examples:
  node scripts/test-webhook.js
  node scripts/test-webhook.js --event customer.subscription.created
  node scripts/test-webhook.js --port 3001
  `);
}

function sendWebhook(eventType = 'checkout.session.completed', port = 3000) {
  const event = sampleEvents[eventType];
  
  if (!event) {
    console.error(`❌ Unknown event type: ${eventType}`);
    console.log('Available events:', Object.keys(sampleEvents).join(', '));
    process.exit(1);
  }

  const data = JSON.stringify(event);
  
  const options = {
    hostname: 'localhost',
    port: port,
    path: '/api/stripe-webhook',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
      'stripe-signature': 'test_signature_for_local_testing',
      'User-Agent': 'Stripe/1.0 (+https://stripe.com/docs/webhooks)'
    }
  };

  console.log(`🚀 Sending webhook event: ${eventType}`);
  console.log(`📡 Target: http://localhost:${port}/api/stripe-webhook`);
  console.log(`📦 Payload size: ${Buffer.byteLength(data)} bytes`);
  console.log('');

  const req = http.request(options, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ Webhook sent successfully!');
        console.log(`📊 Response: ${res.statusCode} ${res.statusMessage}`);
        if (responseData) {
          console.log(`📝 Response body: ${responseData}`);
        }
      } else {
        console.log(`❌ Webhook failed: ${res.statusCode} ${res.statusMessage}`);
        if (responseData) {
          console.log(`📝 Error details: ${responseData}`);
        }
      }
    });
  });

  req.on('error', (error) => {
    console.error(`❌ Request failed: ${error.message}`);
    console.log('');
    console.log('💡 Make sure your Next.js development server is running:');
    console.log('   npm run dev');
  });

  req.write(data);
  req.end();
}

// Parse command line arguments
const args = process.argv.slice(2);
let eventType = 'checkout.session.completed';
let port = 3000;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === '--help' || arg === '-h') {
    showHelp();
    process.exit(0);
  } else if (arg === '--event' && i + 1 < args.length) {
    eventType = args[i + 1];
    i++; // Skip next argument
  } else if (arg === '--port' && i + 1 < args.length) {
    port = parseInt(args[i + 1]);
    i++; // Skip next argument
  }
}

// Send the webhook
sendWebhook(eventType, port);
