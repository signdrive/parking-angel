/**
 * Quick test to verify database permissions for service role
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '.env.local') });

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

async function testPermissions() {
  console.log('🔍 Testing database permissions...');
  
  try {
    // Test 1: Read user_subscriptions table
    console.log('\n1. Testing read access to user_subscriptions...');
    const { data: subscriptions, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .limit(1);
    
    if (subError) {
      console.error('❌ Error reading user_subscriptions:', subError.message);
    } else {
      console.log('✅ Successfully read user_subscriptions');
    }

    // Test 2: Read profiles table
    console.log('\n2. Testing read access to profiles...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profileError) {
      console.error('❌ Error reading profiles:', profileError.message);
    } else {
      console.log('✅ Successfully read profiles');
    }

    // Test 3: Test the helper function (if it exists)
    console.log('\n3. Testing helper function...');
    const { data: functionResult, error: functionError } = await supabase.rpc(
      'handle_subscription_update',
      {
        p_user_id: '00000000-0000-0000-0000-000000000000', // dummy UUID
        p_stripe_customer_id: 'test_customer',
        p_stripe_subscription_id: 'test_subscription',
        p_plan_id: 'premium',
        p_status: 'active'
      }
    );

    if (functionError) {
      console.error('❌ Error calling helper function:', functionError.message);
      if (functionError.message.includes('function') && functionError.message.includes('does not exist')) {
        console.log('ℹ️ Helper function not found - this is expected if migration not yet run');
      }
    } else {
      console.log('✅ Helper function executed successfully:', functionResult);
    }

    console.log('\n✅ Permission tests completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testPermissions()
  .then(() => {
    console.log('\n🎉 Test completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });
