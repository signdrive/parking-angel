/**
 * Health check script for ParkAlgo subscription flow
 * 
 * This script performs a comprehensive check of the entire subscription infrastructure,
 * verifying database schema, Stripe configuration, and API endpoints.
 * 
 * Usage:
 * 1. Set required environment variables in .env.local
 * 2. Run with: node verify-subscription-health.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');
const fetch = require('node-fetch');

// Check for required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing ${envVar} environment variable`);
    console.log(`Make sure you have all required variables in your .env.local file`);
    process.exit(1);
  }
}

// Create clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil'
});

// Base URL for API checks
const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL.includes('localhost') 
  ? 'http://localhost:3000' 
  : 'https://parkalgo.com';

async function checkDatabaseSchema() {
  console.log('\n🔍 Checking database schema...');
  
  try {
    // Check profiles table
    const { data: profileColumns, error: profileError } = await supabase
      .rpc('get_column_info', { table_name: 'profiles' });
    
    if (profileError) {
      console.error('❌ Error checking profiles table:', profileError);
      return false;
    }
    
    // Look for subscription columns
    const requiredColumns = ['subscription_tier', 'subscription_status', 'stripe_customer_id'];
    const missingColumns = [];
    
    for (const column of requiredColumns) {
      if (!profileColumns.some(c => c.column_name === column)) {
        missingColumns.push(column);
      }
    }
    
    if (missingColumns.length > 0) {
      console.error(`❌ Missing columns in profiles table: ${missingColumns.join(', ')}`);
      return false;
    }
    
    // Check subscription_events table
    const { data: eventsTable, error: eventsError } = await supabase
      .from('subscription_events')
      .select('count')
      .limit(1);
    
    if (eventsError) {
      console.error('❌ Error checking subscription_events table:', eventsError);
      return false;
    }
    
    // Check subscription_tier enum
    const { data: tierEnum, error: enumError } = await supabase
      .rpc('get_enum_values', { enum_name: 'subscription_tier' });
    
    if (enumError) {
      console.error('❌ Error checking subscription_tier enum:', enumError);
      return false;
    }
    
    const requiredTiers = ['free', 'premium', 'pro', 'enterprise'];
    const missingTiers = [];
    
    for (const tier of requiredTiers) {
      if (!tierEnum.includes(tier)) {
        missingTiers.push(tier);
      }
    }
    
    if (missingTiers.length > 0) {
      console.error(`❌ Missing values in subscription_tier enum: ${missingTiers.join(', ')}`);
      return false;
    }
    
    console.log('✅ Database schema looks good');
    return true;
  } catch (error) {
    console.error('❌ Unexpected error checking database schema:', error);
    return false;
  }
}

async function checkStripeConfiguration() {
  console.log('\n🔍 Checking Stripe configuration...');
  
  try {
    // Check Stripe products and prices
    const products = await stripe.products.list({ active: true, limit: 100 });
    const prices = await stripe.prices.list({ active: true, limit: 100 });
    
    console.log(`Found ${products.data.length} active products and ${prices.data.length} active prices`);
    
    // Look for required price IDs
    const requiredPriceNames = ['navigator', 'pro_parker', 'fleet_manager'];
    const foundPrices = [];
    
    for (const price of prices.data) {
      const metadata = price.product.metadata || {};
      if (requiredPriceNames.includes(metadata.plan_id)) {
        foundPrices.push(metadata.plan_id);
      }
    }
    
    const missingPrices = requiredPriceNames.filter(name => !foundPrices.includes(name));
    
    if (missingPrices.length > 0) {
      console.warn(`⚠️ Missing price IDs in Stripe: ${missingPrices.join(', ')}`);
    } else {
      console.log('✅ All required Stripe prices found');
    }
    
    // Check webhook configuration
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
    
    if (webhooks.data.length === 0) {
      console.error('❌ No webhook endpoints configured in Stripe');
      return false;
    }
    
    const productionDomain = process.env.NEXT_PUBLIC_SUPABASE_URL.includes('parkalgo.com') 
      ? 'parkalgo.com' 
      : 'localhost';
    
    const webhookForCurrentEnv = webhooks.data.find(w => w.url.includes(productionDomain));
    
    if (!webhookForCurrentEnv) {
      console.warn(`⚠️ No webhook found for ${productionDomain}`);
    } else {
      console.log(`✅ Found webhook for ${productionDomain}: ${webhookForCurrentEnv.url}`);
      
      const requiredEvents = ['checkout.session.completed', 'customer.subscription.deleted'];
      const missingEvents = [];
      
      for (const event of requiredEvents) {
        if (!webhookForCurrentEnv.enabled_events.includes(event) && 
            !webhookForCurrentEnv.enabled_events.includes('*')) {
          missingEvents.push(event);
        }
      }
      
      if (missingEvents.length > 0) {
        console.warn(`⚠️ Webhook missing required events: ${missingEvents.join(', ')}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error checking Stripe configuration:', error);
    return false;
  }
}

async function checkAPIEndpoints() {
  console.log('\n🔍 Checking API endpoints...');
  
  try {
    // Check if the webhook endpoint is accessible
    const webhookUrl = `${BASE_URL}/api/stripe-webhook`;
    console.log(`Checking webhook endpoint: ${webhookUrl}`);
    
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'ping' })
    });
    
    if (webhookResponse.status === 400) {
      console.log('✅ Webhook endpoint is accessible (returned 400 for invalid signature, which is correct)');
    } else {
      console.warn(`⚠️ Webhook endpoint returned unexpected status: ${webhookResponse.status}`);
    }
    
    // Check verify-session endpoint
    const verifySessionUrl = `${BASE_URL}/api/stripe/verify-session?session_id=test`;
    console.log(`Checking verify-session endpoint: ${verifySessionUrl}`);
    
    const verifyResponse = await fetch(verifySessionUrl);
    
    if (verifyResponse.status === 400 || verifyResponse.status === 404) {
      console.log('✅ Verify-session endpoint is accessible (returned 400/404 for invalid session ID, which is correct)');
    } else {
      console.warn(`⚠️ Verify-session endpoint returned unexpected status: ${verifyResponse.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error checking API endpoints:', error);
    return false;
  }
}

async function runHealthCheck() {
  console.log('🚀 Starting ParkAlgo subscription flow health check');
  console.log(`Database URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
  
  const databaseOk = await checkDatabaseSchema();
  const stripeOk = await checkStripeConfiguration();
  const apiOk = await checkAPIEndpoints();
  
  console.log('\n📊 Health Check Results:');
  console.log(`Database Schema: ${databaseOk ? '✅ OK' : '❌ Issues found'}`);
  console.log(`Stripe Configuration: ${stripeOk ? '✅ OK' : '❌ Issues found'}`);
  console.log(`API Endpoints: ${apiOk ? '✅ OK' : '❌ Issues found'}`);
  
  if (databaseOk && stripeOk && apiOk) {
    console.log('\n🎉 All systems operational! Subscription flow should be working correctly.');
  } else {
    console.log('\n⚠️ Some issues were detected. Please review the output above.');
  }
}

// Run the health check
runHealthCheck()
  .catch(error => {
    console.error('Unexpected error during health check:', error);
  })
  .finally(() => {
    // Exit the process
    process.exit(0);
  });
