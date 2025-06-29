/**
 * Test script to simulate a Stripe webhook event for subscription updates
 * 
 * Usage: 
 * 1. Make sure your dev server is running
 * 2. Run: node test-webhook-debug.js
 */

const fetch = require('node-fetch');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

// Use the webhook secret from .env only - never hardcode this
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'test_secret_key_placeholder';
// Set the endpoint URL - use production URL if needed for live testing
// Make sure this matches the URL of your webhook handler API route
const ENDPOINT_URL = process.env.WEBHOOK_TEST_URL || 'http://localhost:3001/api/stripe-webhook';
// Use a real user ID from your database for testing
// Try to get it from env first, then fall back to a recent test user
const userId = process.env.TEST_USER_ID || '0462d759-46bf-4e66-8f4b-43d42d2f30d4';

// Sample event object similar to what Stripe would send
const createEvent = (type) => {
  const eventId = `evt_${Math.random().toString(36).substring(2, 15)}`;
  
  // The customer ID from the checkout session
  const customerId = `cus_${Math.random().toString(36).substring(2, 12)}`;
  
  // Create sample checkout session completed event
  if (type === 'checkout.session.completed') {
    return {
      id: eventId,
      object: 'event',
      api_version: '2025-05-28.basil',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: `cs_test_${Math.random().toString(36).substring(2, 15)}`,
          object: 'checkout.session',
          customer: customerId,
          payment_status: 'paid',
          metadata: {
            userId: userId,
            tier: 'navigator'  // Use one of: navigator, pro_parker, fleet_manager
          }
        }
      },
      type: 'checkout.session.completed'
    };
  }
  
  // Other event types can be added here
  return null;
};

// Sign the payload with the webhook secret
const signPayload = (payload, secret) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const toSign = `${timestamp}.${payload}`;
  const signature = crypto.createHmac('sha256', secret).update(toSign).digest('hex');
  return {
    timestamp,
    signature,
    header: `t=${timestamp},v1=${signature}`
  };
};

async function sendWebhookEvent() {
  try {
    // Create an event
    const event = createEvent('checkout.session.completed');
    const payload = JSON.stringify(event);
    
    // Sign the payload
    const { header } = signPayload(payload, WEBHOOK_SECRET);
    
    console.log(`Sending ${event.type} event to ${ENDPOINT_URL}...`);
    console.log(`Event ID: ${event.id}`);
    console.log(`User ID: ${userId}`);
    console.log(`Plan: ${event.data.object.metadata.tier}`);
    
    // Send the request
    const response = await fetch(ENDPOINT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': header
      },
      body: payload
    });
    
    try {
      const result = await response.json();
      console.log(`Status: ${response.status}`);
      console.log('Response:', result);
    } catch (e) {
      console.log(`Status: ${response.status}`);
      console.log('Response text:', await response.text());
    }
    
  } catch (error) {
    console.error('Error sending webhook event:', error);
  }
}

sendWebhookEvent();
