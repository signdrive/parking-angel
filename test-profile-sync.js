/**
 * Test the profile sync functionality after running the SQL migration
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

async function testProfileSync() {
  console.log('🔍 Testing profile sync functionality...');
  
  try {
    // Test 1: Get a real user with subscription
    console.log('\n1. Finding user with subscription...');
    const { data: userWithSub, error: userError } = await supabase
      .from('user_subscriptions')
      .select('user_id, plan_id, status, email')
      .not('user_id', 'is', null)
      .limit(1)
      .single();
    
    if (userError || !userWithSub) {
      console.log('❌ No user subscriptions found:', userError?.message);
      return;
    }
    
    console.log('✅ Found user:', userWithSub.user_id, 'with plan:', userWithSub.plan_id);

    // Test 2: Check current profile state
    console.log('\n2. Checking current profile state...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_plan, subscription_status, subscription_tier')
      .eq('id', userWithSub.user_id)
      .single();
    
    if (profileError) {
      console.error('❌ Error reading profile:', profileError.message);
      return;
    }
    
    console.log('Profile before sync:', profile);

    // Test 3: Test the sync function
    console.log('\n3. Testing sync function...');
    const { data: syncResult, error: syncError } = await supabase.rpc(
      'sync_profile_subscription',
      {
        p_user_id: userWithSub.user_id,
        p_plan_id: userWithSub.plan_id,
        p_status: userWithSub.status || 'active'
      }
    );

    if (syncError) {
      console.error('❌ Error calling sync function:', syncError.message);
      return;
    }
    
    console.log('✅ Sync function result:', syncResult);

    // Test 4: Verify profile was updated
    console.log('\n4. Verifying profile update...');
    const { data: updatedProfile, error: updatedError } = await supabase
      .from('profiles')
      .select('subscription_plan, subscription_status, subscription_tier')
      .eq('id', userWithSub.user_id)
      .single();
    
    if (updatedError) {
      console.error('❌ Error reading updated profile:', updatedError.message);
      return;
    }
    
    console.log('Profile after sync:', updatedProfile);

    // Test 5: Test the full subscription update function
    console.log('\n5. Testing full subscription update function...');
    const { data: fullSyncResult, error: fullSyncError } = await supabase.rpc(
      'handle_subscription_update_with_profile_sync',
      {
        p_user_id: userWithSub.user_id,
        p_stripe_customer_id: 'test_customer_123',
        p_stripe_subscription_id: 'test_sub_123',
        p_plan_id: 'premium',
        p_status: 'active',
        p_email: userWithSub.email || 'test@example.com'
      }
    );

    if (fullSyncError) {
      console.error('❌ Error calling full sync function:', fullSyncError.message);
    } else {
      console.log('✅ Full sync function result:', fullSyncResult);
    }

    console.log('\n✅ Profile sync tests completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testProfileSync()
  .then(() => {
    console.log('\n🎉 Test completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });
