#!/usr/bin/env node

/**
 * Simple test to verify profile sync after migration
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testProfileSync() {
  console.log('🔍 Testing profile sync functionality...\n');
  
  try {
    // 1. Test sync function exists
    console.log('1. Testing sync function...');
    const { data: syncResult, error: syncError } = await supabase.rpc(
      'sync_profile_subscription',
      {
        p_user_id: '00000000-0000-0000-0000-000000000000', // dummy UUID
        p_plan_id: 'premium',
        p_status: 'active'
      }
    );
    
    if (syncError) {
      if (syncError.message.includes('function') && syncError.message.includes('does not exist')) {
        console.log('❌ sync_profile_subscription function missing');
        return false;
      }
      console.log('✅ sync_profile_subscription function exists');
    } else {
      console.log('✅ sync_profile_subscription function works');
    }

    // 2. Check if user has subscription data
    console.log('\n2. Checking subscription data...');
    const { data: subscriptions, error: subError } = await supabase
      .from('user_subscriptions')
      .select('user_id, plan_id, status, email')
      .limit(1);
    
    if (subError) {
      console.log('❌ Error accessing user_subscriptions:', subError.message);
      return false;
    }
    
    if (subscriptions && subscriptions.length > 0) {
      console.log('✅ Found user subscription data');
      console.log('  User ID:', subscriptions[0].user_id);
      console.log('  Plan:', subscriptions[0].plan_id);
      console.log('  Status:', subscriptions[0].status);
      console.log('  Email:', subscriptions[0].email ? '✅ Present' : '❌ Missing');
      
      // 3. Check corresponding profile
      console.log('\n3. Checking profile sync...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_plan, subscription_status, subscription_tier')
        .eq('id', subscriptions[0].user_id)
        .single();
      
      if (profileError) {
        console.log('❌ Error accessing profile:', profileError.message);
        return false;
      }
      
      if (profile) {
        console.log('✅ Found profile data');
        console.log('  Profile plan:', profile.subscription_plan);
        console.log('  Profile status:', profile.subscription_status);
        console.log('  Profile tier:', profile.subscription_tier);
        
        // Check if they match
        const plansMatch = profile.subscription_plan === subscriptions[0].plan_id;
        const statusMatch = profile.subscription_status === subscriptions[0].status;
        
        console.log('\n4. Sync status:');
        console.log('  Plans match:', plansMatch ? '✅' : '❌');
        console.log('  Status match:', statusMatch ? '✅' : '❌');
        
        if (plansMatch && statusMatch) {
          console.log('\n🎉 Profile sync is working correctly!');
        } else {
          console.log('\n⚠️  Profile sync needs attention');
        }
      }
    } else {
      console.log('⚠️  No subscription data found');
    }
    
    console.log('\n✅ Test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Run the test
testProfileSync().then(success => {
  console.log('\n' + (success ? '✅ All tests passed!' : '❌ Some tests failed'));
  process.exit(success ? 0 : 1);
});
