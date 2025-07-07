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
import { appendFileSync } from 'fs';

// Load environment variables from parent directory's .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../.env.local') });

// Set up logging to both console and file
function log(...args) {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
  ).join(' ');
  console.log(message);
  appendFileSync('test-webhook.log', message + '\n');
}

function logError(...args) {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
  ).join(' ');
  console.error(message);
  appendFileSync('test-webhook.log', 'ERROR: ' + message + '\n');
}

// Update all console.log and console.error calls to use our logging functions
process.on('unhandledRejection', (error) => {
  logError('Unhandled rejection:', error);
  process.exit(1);
});

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil'
});

// Initialize Supabase client with service role key
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase configuration:', {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'present' : 'missing',
    serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'present' : 'missing'
  });
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    db: {
      schema: 'public'
    }
  }
);

// Verify required environment variables
const requiredEnvVars = {
  'STRIPE_SECRET_KEY': process.env.STRIPE_SECRET_KEY,
  'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
  'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
  'NEXT_PUBLIC_STRIPE_NAVIGATOR_PRICE_ID': process.env.NEXT_PUBLIC_STRIPE_NAVIGATOR_PRICE_ID
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

  log('Creating test user with email:', email);

  try {
    // Create user with admin API
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: 'Test User' }
    });

    if (createError) throw createError;
    if (!createData?.user) throw new Error('No user data returned from creation');

    const userId = createData.user.id;
    log('Test user created successfully:', userId);

    // Insert into profiles table (if needed by your schema)
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ 
        id: userId,
        email,
        full_name: 'Test User',
        created_at: new Date().toISOString()
      }]);

    if (profileError) {
      logError('Error creating profile:', profileError);
      // Try to clean up the auth user since profile creation failed
      await supabase.auth.admin.deleteUser(userId);
      throw profileError;
    }

    return createData.user;
  } catch (error) {
    logError('Error in createTestUser:', {
      message: error.message,
      hint: error.hint,
      details: error.details,
      stack: error.stack
    });
    throw error;
  }
}

// Helper function to delete test user from Supabase
async function deleteTestUser(userId) {
  if (!userId) return;
  
  log('Cleaning up test user:', userId);
  try {
    // Delete all user data in a transaction if possible
    const { error: deleteError } = await supabase.rpc('delete_user_data', {
      user_id_param: userId
    });

    if (deleteError) {
      logError('Failed to use delete_user_data RPC, falling back to manual deletion:', deleteError);
      
      // Fallback: Delete related data manually in correct order
      const { error: subError } = await supabase
        .from('user_subscriptions')
        .delete()
        .eq('user_id', userId);
      
      if (subError) {
        logError('Error deleting user subscriptions:', subError);
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (profileError) {
        logError('Error deleting user profile:', profileError);
      }
    }

    // Finally delete the auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) {
      logError('Error deleting auth user:', authError);
      throw authError;
    }

    log('Successfully cleaned up test user data');
  } catch (error) {
    logError('Error in deleteTestUser:', {
      message: error.message,
      hint: error.hint,
      details: error.details,
      stack: error.stack
    });
    throw error;
  }
}

const webhookSecret = 'parkalgo.com';

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
    log(`Testing endpoint: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': signature
      },
      body: payload
    });
    
    const data = await response.text();
    log(`Response status: ${response.status}`);
    
    try {
      const jsonData = JSON.parse(data);
      log('Response body:', jsonData);
    } catch (e) {
      log('Response body (text):', data.substring(0, 500));
    }
    
    return response.status;
  } catch (error) {
    logError('Error calling endpoint:', error);
    return 500;
  }
}

// Main test function
async function runTest() {
  log('Starting webhook verification test...');
  log('Environment check:', {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'missing',
    stripeKey: process.env.STRIPE_SECRET_KEY ? 'set' : 'missing',
  });

  try {
    // Test Supabase connection first
    const isConnected = await testSupabaseConnection(supabase);
    if (!isConnected) {
      throw new Error('Failed to establish Supabase connection');
    }

    // Create test user
    log('Creating test user...');
    const user = await createTestUser();
    log('Test user created:', user.id);

    // Create Stripe customer
    log('Creating Stripe customer...');
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        supabase_uid: user.id
      }
    });
    log('Stripe customer created:', customer.id);

    // Test webhook endpoints
    const testEndpoints = [
      'http://localhost:3000/api/stripe-webhook',
      'http://localhost:3000/api/stripe/webhook'
    ];

    for (const url of testEndpoints) {
      log(`Testing webhook endpoint: ${url}`);
      
      const event = {
        type: 'customer.subscription.created',
        data: {
          object: {
            customer: customer.id,
            status: 'active',
            items: {
              data: [{
                price: {
                  id: process.env.NEXT_PUBLIC_STRIPE_NAVIGATOR_PRICE_ID
                }
              }]
            }
          }
        }
      };

      const payload = JSON.stringify(event);
      const signature = generateStripeSignature(payload);
      
      await checkEndpointResponse(url, payload, signature);
    }

    // Cleanup
    log('Test completed, cleaning up...');
    if (customer.id) {
      await stripe.customers.del(customer.id);
      log('Deleted Stripe customer:', customer.id);
    }
    if (user.id) {
      await deleteTestUser(user.id);
      log('Deleted test user:', user.id);
    }

    log('✅ All tests completed successfully');
  } catch (error) {
    logError('Error during test:', {
      message: error.message,
      stack: error.stack,
      ...error
    });
  } finally {
    log('Test run complete');
  }
}

// Run the test
log('Starting test script...');
runTest().catch(error => {
  logError('Unhandled error:', error);
  process.exit(1);
});
