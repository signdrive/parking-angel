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

import 'dotenv/config';
import Stripe from 'stripe';
import fetch from 'node-fetch';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil'
});

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Helper function to create a test user in Supabase
async function createTestUser() {
  const timestamp = Date.now();
  const email = `test.user.${timestamp}@parking-angel-test.com`;
  const password = `TestPass123!${timestamp}`;

  console.log('Creating test user with email:', email);

  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: 'Test User',
          created_at: new Date().toISOString()
        }
      }
    });

    if (signUpError) {
      console.error('Error signing up user:', signUpError);
      throw signUpError;
    }

    if (!signUpData.user) {
      throw new Error('No user data returned from signup');
    }

    // Wait for the user to be fully created
    console.log('Waiting for user to be confirmed...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify the user exists
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signUpData.user.id)
      .single();

    if (userError || !userData) {
      console.error('Error verifying user profile:', userError);
      throw new Error('Failed to verify user creation');
    }

    console.log('Test user created successfully:', signUpData.user.id);
    return signUpData.user;
  } catch (error) {
    console.error('Error in createTestUser:', error);
    throw error;
  }
}

// Helper function to delete test user from Supabase
async function deleteTestUser(userId) {
  if (!userId) return;
  
  console.log('Cleaning up test user:', userId);
  try {
    // First remove from profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (profileError) {
      console.error('Error deleting user profile:', profileError);
    }

    // Then remove from user_subscriptions table
    const { error: subError } = await supabase
      .from('user_subscriptions')
      .delete()
      .eq('user_id', userId);
    
    if (subError) {
      console.error('Error deleting user subscriptions:', subError);
    }

    // Finally delete the auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) {
      console.error('Error deleting Supabase auth user:', authError);
    }

    console.log('Successfully cleaned up test user data');
  } catch (error) {
    console.error('Error cleaning up test user:', error);
  }
}

// Helper to generate webhook signature
function generateStripeSignature(payload) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${payload}`;
  const signature = crypto
    .createHmac('sha256', webhookSecret)
    .update(signedPayload)
    .digest('hex');
  
  return `t=${timestamp},v1=${signature}`;
}

// Helper to verify webhook response
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
    return 500;
  }
}

// Use hardcoded webhook secret as specified
const webhookSecret = 'parkalgo.com';

// Get price IDs from env
const NAVIGATOR_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_NAVIGATOR_PRICE_ID;
const PRO_PARKER_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRO_PARKER_PRICE_ID;
const FLEET_MANAGER_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_FLEET_MANAGER_PRICE_ID;

if (!NAVIGATOR_PRICE_ID || !PRO_PARKER_PRICE_ID || !FLEET_MANAGER_PRICE_ID) {
  console.error('❌ One or more Stripe price IDs are not set in .env.local');
  process.exit(1);
}

// Main test function
async function testWebhook() {
  let testUser;
  let customer;
  let subscription;

  try {
    // Step 1: Create a test user in Supabase
    console.log('Creating test user in Supabase...');
    testUser = await createTestUser();
    console.log('Test user created:', testUser.id);

    // Step 2: Create a Stripe customer with the Supabase user ID
    console.log('Creating Stripe customer...');
    customer = await stripe.customers.create({
      email: testUser.email,
      metadata: {
        supabaseUuid: testUser.id
      }
    });
    console.log('Stripe customer created:', customer.id);

    // Step 3: Create a test subscription
    console.log('Creating test subscription...');
    subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: NAVIGATOR_PRICE_ID }],
      metadata: {
        supabaseUuid: testUser.id
      }
    });
    console.log('Test subscription created:', subscription.id);

    // Step 4: Generate and send webhook events
    console.log('Generating webhook events...');
    const events = [
      {
        type: 'customer.subscription.created',
        data: {
          object: subscription
        }
      }
    ];

    // Test endpoints
    const endpoints = [
      'http://localhost:3000/api/stripe-webhook',
      'http://localhost:3000/api/stripe/webhook'
    ];

    // Test each endpoint
    for (const endpoint of endpoints) {
      console.log(`\nTesting ${endpoint}...`);
      
      for (const event of events) {
        console.log(`\nTesting event type: ${event.type}`);
        
        const payload = JSON.stringify({
          id: `evt_${crypto.randomBytes(16).toString('hex')}`,
          object: 'event',
          api_version: '2025-06-30.basil',
          created: Math.floor(Date.now() / 1000),
          data: event.data,
          type: event.type,
          livemode: false
        });

        const signature = generateStripeSignature(payload);
        const status = await checkEndpointResponse(endpoint, payload, signature);

        if (status === 200) {
          console.log(`✅ Webhook test succeeded for ${endpoint} with ${event.type}`);
        } else {
          console.error(`❌ Webhook test failed for ${endpoint} with ${event.type} (status: ${status})`);
        }
      }
    }

  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    // Clean up resources
    console.log('Cleaning up...');
    
    if (subscription) {
      try {
        await stripe.subscriptions.del(subscription.id);
        console.log('Subscription deleted');
      } catch (error) {
        console.error('Error deleting subscription:', error);
      }
    }

    if (customer) {
      try {
        await stripe.customers.del(customer.id);
        console.log('Customer deleted');
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }

    if (testUser?.id) {
      try {
        await deleteTestUser(testUser.id);
        console.log('Test user deleted');
      } catch (error) {
        console.error('Error deleting test user:', error);
      }
    }
  }
}

// Run the test
testWebhook().catch(console.error);
