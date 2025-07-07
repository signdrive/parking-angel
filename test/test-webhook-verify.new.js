/**
 * Test script to verify the Stripe webhook endpoint
 * 
 * Usage:
 * 1. Set environment variables in .env.local
 * 2. Run with: node test-webhook-verify.js
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import Stripe from 'stripe';
import fetch from 'node-fetch';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from parent directory's .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../.env.local') });

// Test Supabase connection before proceeding
async function testSupabaseConnection(supabase) {
  try {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    if (error) {
      throw error;
    }
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return false;
  }
}

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16' // Updated to current Stripe API version
});

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Verify required environment variables
const requiredEnvVars = {
  'STRIPE_SECRET_KEY': process.env.STRIPE_SECRET_KEY,
  'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
  'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
  'NEXT_PUBLIC_STRIPE_NAVIGATOR_PRICE_ID': process.env.NEXT_PUBLIC_STRIPE_NAVIGATOR_PRICE_ID,
  'STRIPE_WEBHOOK_SECRET': process.env.STRIPE_WEBHOOK_SECRET
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

// Helper function to create a test user in Supabase
async function createTestUser() {
  const timestamp = Date.now();
  const email = `test${timestamp}@parking-angel.com`;
  const password = `TestPass123!${timestamp}`;

  console.log('Creating test user with email:', email);

  try {
    // Create user with admin API
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: 'Test User'
      }
    });

    if (createError) {
      console.error('Error creating user:', createError);
      throw createError;
    }

    if (!userData.user) {
      throw new Error('No user data returned from creation');
    }

    // Check if profile exists first
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .single();

    if (existingProfile) {
      // Delete existing profile first
      await supabase
        .from('profiles')
        .delete()
        .eq('id', userData.user.id);
    }

    // Create profile record
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userData.user.id,
        email: userData.user.email,
        full_name: 'Test User'
      });

    if (profileError) {
      throw profileError;
    }

    console.log('Test user created successfully:', userData.user.id);
    return userData.user;
  } catch (error) {
    console.error('Error in createTestUser:', error);
    throw error;
  }
}

// Helper function to delete test user from Supabase
async function deleteTestUser(userId) {
  if (!userId) {
    return;
  }
  
  console.log('Cleaning up test user:', userId);
  try {
    // Delete from user_subscriptions first (foreign key constraint)
    const { error: subError } = await supabase
      .from('user_subscriptions')
      .delete()
      .eq('user_id', userId);
    
    if (subError) {
      console.error('Error deleting user subscriptions:', subError);
    }

    // Then delete from profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (profileError) {
      console.error('Error deleting user profile:', profileError);
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
function generateStripeSignature(rawPayload) {
  const timestamp = Math.floor(Date.now() / 1000);
  
  // Important: Construct the signed payload exactly as Stripe does
  // The signed payload must be timestamp + '.' + raw payload (no whitespace)
  const signedPayload = `${timestamp}.${rawPayload}`;
  
  // Generate the signature using the webhook secret
  const signature = crypto
    .createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET)
    .update(signedPayload)
    .digest('hex');
  
  return {
    timestamp,
    signature: `t=${timestamp},v1=${signature}`,
    signedPayload
  };
}

// Helper to verify webhook response
async function checkEndpointResponse(url, rawPayload, signature) {
  try {
    console.log(`Testing endpoint: ${url}`);
    
    // Debug logging for request details
    console.log('\nRequest details:');
    console.log('Headers:', {
      'Content-Type': 'application/json',
      'Stripe-Signature': signature
    });
    console.log('Payload length:', rawPayload.length);
    console.log('Payload preview:', rawPayload.substring(0, 100));
    
    // Send request with exact payload and headers
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': signature
      },
      body: rawPayload
    });
    
    const data = await response.text();
    console.log(`Response status: ${response.status}`);
    
    try {
      const jsonData = JSON.parse(data);
      console.log('Response body:', jsonData);
      return { status: response.status, data: jsonData };
    } catch (parseError) {
      console.log('Response body (text):', data.substring(0, 500));
      return { status: response.status, data };
    }
  } catch (error) {
    console.error('Error calling endpoint:', error);
    return { status: 500, error: error.message };
  }
}

// Initialize constants
const PRICE_TO_PLAN_MAP = {
  [process.env.NEXT_PUBLIC_STRIPE_NAVIGATOR_PRICE_ID]: 'premium',
  [process.env.NEXT_PUBLIC_STRIPE_PRO_PARKER_PRICE_ID]: 'pro',
  [process.env.NEXT_PUBLIC_STRIPE_FLEET_MANAGER_PRICE_ID]: 'enterprise'
};

// Helper to verify JSON string validity
function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    console.error('JSON validation error:', e);
    return false;
  }
}

// Main test function
async function testWebhook() {
  // Initialize variables
  let testUser = null;
  let customer = null;
  let subscription = null;
  let setupIntent = null;
  let paymentMethodId = null;
  let successfulPlan = null;
  let successfulStatus = null;

  try {
    // First test Supabase connection
    const isConnected = await testSupabaseConnection(supabase);
    if (!isConnected) {
      console.error('❌ Cannot proceed without Supabase connection');
      return;
    }

    // Clean up any existing test data
    console.log('Cleaning up any existing test data...');
    try {
      const { data: testProfiles } = await supabase
        .from('profiles')
        .select('id')
        .ilike('email', 'test%@parking-angel.com');

      if (testProfiles && testProfiles.length > 0) {
        for (const profile of testProfiles) {
          await deleteTestUser(profile.id);
        }
        console.log(`Cleaned up ${testProfiles.length} existing test profiles`);
      }
    } catch (cleanupError) {
      console.warn('Warning: Error cleaning up existing test data:', cleanupError);
    }

    // Step 1: Create a test user in Supabase
    console.log('Creating test user in Supabase...');
    testUser = await createTestUser();
    console.log('Test user created:', testUser.id);

    // Step 2: Create a Stripe customer
    console.log('Creating Stripe customer...');
    customer = await stripe.customers.create({
      email: testUser.email,
      metadata: {
        supabaseUuid: testUser.id
      }
    });
    console.log('Stripe customer created:', customer.id);

    // Step 3: Set up payment method
    console.log('Setting up payment method...');
    
    // First create a SetupIntent
    setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      payment_method_types: ['card'],
      usage: 'off_session'
    });

    // Simulate successful setup with a test payment method
    const confirmedSetupIntent = await stripe.setupIntents.confirm(
      setupIntent.id,
      {
        payment_method: 'pm_card_visa', // Use Stripe's test payment method
      }
    );

    // Set as default payment method
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: confirmedSetupIntent.payment_method
      }
    });

    paymentMethodId = confirmedSetupIntent.payment_method;

    console.log('Payment method set up:', paymentMethodId);

    // Step 4: Create initial subscription record
    console.log('Creating initial subscription record...');

    // Get the plan_id based on the price we'll use
    const initialPlanId = PRICE_TO_PLAN_MAP[process.env.NEXT_PUBLIC_STRIPE_NAVIGATOR_PRICE_ID] || 'premium';
    console.log(`Using initial plan_id: ${initialPlanId} for price: ${process.env.NEXT_PUBLIC_STRIPE_NAVIGATOR_PRICE_ID}`);

    // Create the subscription record
    const { error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: testUser.id,
        stripe_customer_id: customer.id,
        plan_id: initialPlanId,
        status: 'incomplete',
        trial_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      });

    if (subscriptionError) {
      // Check if it's a constraint violation
      if (subscriptionError.code === '23514') {
        console.error('Constraint violation. Checking database schema...');
        
        // Get table information including constraints
        const { data: tableInfo, error: tableError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .limit(1);

        if (!tableError) {
          console.error('Current subscription records:', tableInfo);
          // Query for valid plan_id values from any existing records
          const { data: planData } = await supabase
            .from('user_subscriptions')
            .select('plan_id')
            .limit(10);
          
          if (planData?.length > 0) {
            console.log('Valid plan_ids found:', [...new Set(planData.map(d => d.plan_id))]);
          }
        }

        // Use the valid plan IDs from our schema
        const planAttempts = ['premium', 'pro', 'enterprise', 'free'];
        const statusAttempts = ['incomplete', 'active', 'trialing'];
        console.error('Will try these combinations:');
        planAttempts.forEach(plan => {
          statusAttempts.forEach(status => {
            console.log(`  plan_id: ${plan}, status: ${status}`);
          });
        });

        // Try each combination of plan and status
        let foundValidCombination = false;
        for (const plan of planAttempts) {
          if (foundValidCombination) break;
          for (const status of statusAttempts) {
            console.log(`Trying plan_id: ${plan}, status: ${status}...`);
            const { error: retryError } = await supabase
              .from('user_subscriptions')
              .upsert({
                user_id: testUser.id,
                stripe_customer_id: customer.id,
                plan_id: plan,
                status: status,
                trial_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date().toISOString()
              });
            
            if (!retryError) {
              console.log(`Successfully created subscription with plan: ${plan}, status: ${status}`);
              successfulPlan = plan;
              successfulStatus = status;
              foundValidCombination = true;
              break;
            } else {
              console.error(`Failed with plan: ${plan}, status: ${status}:`, retryError.message);
            }
          }
        }

        if (!foundValidCombination) {
          throw new Error('Could not find a valid plan and status combination');
        }
      }
      console.error('Error creating initial subscription record:', subscriptionError);
      throw subscriptionError;
    }

    // Step 5: Create Stripe subscription
    console.log('Creating Stripe subscription...');
    subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        price: process.env.NEXT_PUBLIC_STRIPE_NAVIGATOR_PRICE_ID
      }],
      metadata: {
        supabaseUuid: testUser.id
      },
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent']
    });
    console.log('Stripe subscription created:', subscription.id);

    // Step 6: Update subscription record with Stripe ID
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        stripe_subscription_id: subscription.id
      })
      .eq('user_id', testUser.id);

    if (updateError) {
      console.error('Error updating subscription record:', updateError);
      throw updateError;
    }

    // Step 7: Test webhook events
    // Add small delay to ensure data propagation
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\nTesting webhook endpoints...');

    // Get fresh subscription data with all necessary expansions
    const subscriptionData = await stripe.subscriptions.retrieve(subscription.id, {
      expand: [
        'latest_invoice.payment_intent',
        'customer',
        'items.data.price.product'
      ]
    });

    // Get the actual price data from Stripe
    const priceData = await stripe.prices.retrieve(process.env.NEXT_PUBLIC_STRIPE_NAVIGATOR_PRICE_ID, {
      expand: ['product']
    });

    // Build the webhook data payload
    const webhookData = {
      id: subscriptionData.id,
      object: 'subscription',
      customer: customer.id,
      default_payment_method: paymentMethodId,
      items: {
        object: 'list',
        data: [{
          id: subscriptionData.items.data[0].id,
          object: 'subscription_item',
          price: priceData
        }]
      },
      status: 'active',
      metadata: {
        supabaseUuid: testUser.id
      },
      current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
      cancel_at_period_end: false,
      latest_invoice: {
        payment_intent: {
          id: `pi_${Math.random().toString(36).substring(2, 10)}`,
          status: 'succeeded'
        }
      }
    };

    // Create webhook event
    const webhookEvent = {
      id: `evt_${Math.random().toString(36).substring(2)}`,
      object: 'event',
      api_version: '2023-10-16',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: webhookData
      },
      livemode: false,
      pending_webhooks: 1,
      type: 'customer.subscription.created',
      request: {
        id: null,
        idempotency_key: null
      }
    };

    // Test each endpoint
    const endpoints = [
      'http://localhost:3000/api/stripe-webhook',
      'http://localhost:3000/api/stripe/webhook'
    ];

    console.log('\nPreparing webhook event payload...');
    // Create the exact payload string that will be sent and signed
    // Important: Use compact JSON format without any whitespace
    const rawPayload = JSON.stringify(webhookEvent);
    console.log('Raw payload length:', rawPayload.length);
    console.log('Raw payload first 100 chars:', rawPayload.substring(0, 100));
    console.log('Raw payload is valid JSON:', isValidJSON(rawPayload));
    
    // Generate signature using the raw payload string
    const { timestamp, signature, signedPayload } = generateStripeSignature(rawPayload);
    
    console.log('\nSignature generation details:');
    console.log('Timestamp:', timestamp);
    console.log('Generated signature:', signature);
    console.log('Signed payload first 100 chars:', signedPayload.substring(0, 100));
    
    // Verify signature locally first using the same method as the endpoint
    const localVerification = crypto
      .createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET)
      .update(signedPayload)
      .digest('hex');
    console.log('\nLocal verification details:');
    console.log('Expected signature:', localVerification);
    console.log('Generated signature:', signature.split('v1=')[1]);
    console.log('Signatures match:', localVerification === signature.split('v1=')[1]);

    // Test each endpoint with the verified payload and signature
    for (const endpoint of endpoints) {
      console.log(`\nTesting ${endpoint}...`);
      try {
        const { status, data } = await checkEndpointResponse(endpoint, rawPayload, signature);
        if (status === 200) {
          console.log(`✅ Webhook test succeeded for ${endpoint}`);
          console.log('Response:', data);
          
          // Give the database a moment to process the webhook
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Check database for subscription update
          const { data: subData, error: subError } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', testUser.id)
            .single();
            
          if (subData) {
            console.log('Updated subscription in database:', subData);
          } else if (subError) {
            console.warn('Could not verify subscription update:', subError);
          }
        } else {
          console.error(`❌ Webhook test failed for ${endpoint} (status: ${status})`);
          console.error('Error response:', data);
        }
      } catch (endpointError) {
        console.error(`Error testing endpoint ${endpoint}:`, endpointError);
      }
    }
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    try {
      console.log('\nCleaning up...');
      
      // Clean up Stripe subscription
      if (subscription?.id) {
        try {
          await stripe.subscriptions.cancel(subscription.id);
          console.log('Subscription cancelled');
        } catch (error) {
          console.error('Error cancelling subscription:', error);
        }
      }

      // Clean up payment method
      if (paymentMethodId) {
        try {
          await stripe.paymentMethods.detach(paymentMethodId);
          console.log('Payment method detached');
        } catch (error) {
          console.error('Error detaching payment method:', error);
        }
      }

      // Clean up Stripe customer
      if (customer?.id) {
        try {
          await stripe.customers.del(customer.id);
          console.log('Customer deleted');
        } catch (error) {
          console.error('Error deleting customer:', error);
        }
      }

      // Clean up test user
      if (testUser?.id) {
        try {
          await deleteTestUser(testUser.id);
          console.log('Test user deleted');
        } catch (error) {
          console.error('Error deleting test user:', error);
          
          // Try to force delete the profile if it exists
          try {
            const { error: forceDeleteError } = await supabase
              .from('profiles')
              .delete()
              .eq('id', testUser.id);
            
            if (!forceDeleteError) {
              console.log('Force deleted profile record');
            }
          } catch (forceDeleteError) {
            console.error('Error force deleting profile:', forceDeleteError);
          }
        }
      }

      console.log('Test complete');
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }
  }
}

// Run the test and handle any uncaught errors
testWebhook()
  .then(() => {
    console.log('Test completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
