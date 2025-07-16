import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugSubscriptionIssue() {
  console.log('🔍 Debugging subscription API issue...\n');
  
  // Get the most recent subscription record
  const { data: subs, error: subsError } = await supabase
    .from('user_subscriptions')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1);
    
  if (subsError) {
    console.log('❌ Error fetching subscription:', subsError.message);
    return;
  }
  
  const userSub = subs[0];
  console.log('📊 Most recent user subscription:', userSub);
  
  if (userSub) {
    console.log('\n🧪 Testing subscription API for user:', userSub.user_id);
    
    // Simulate the API call that the frontend makes
    try {
      // Test what the SubscriptionService.getSubscription() method does
      console.log('1. Fetching user subscription from DB...');
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userSub.user_id)
        .single();
      
      if (error || !data) {
        console.log('❌ No subscription found in DB for user');
      } else {
        console.log('✅ Found subscription in DB:', data);
        
        // Check if stripe_subscription_id exists
        if (!data.stripe_subscription_id) {
          console.log('🚨 ISSUE FOUND: stripe_subscription_id is null/missing!');
          console.log('This is why the API returns null subscription');
        } else {
          console.log('✅ Stripe subscription ID exists:', data.stripe_subscription_id);
        }
      }
    } catch (error) {
      console.error('🚨 Error testing subscription fetch:', error);
    }
  }
}

debugSubscriptionIssue();
