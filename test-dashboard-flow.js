import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

async function testDashboardSubscriptionFlow() {
  console.log('🚀 Testing dashboard subscription flow...\n');
  
  // Get the user who has the subscription
  const serviceSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const { data: subscription } = await serviceSupabase
    .from('user_subscriptions')
    .select('*')
    .eq('plan_id', 'premium')
    .single();
    
  if (!subscription) {
    console.log('❌ No premium subscription found');
    return;
  }
  
  const userId = subscription.user_id;
  console.log('👤 Testing with user ID:', userId);
  console.log('📧 User email:', subscription.email);
  
  // Test what the auth provider returns
  const { data: profile } = await serviceSupabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  console.log('👤 Profile data:', {
    id: profile?.id,
    email: profile?.email,
    subscription_plan: profile?.subscription_plan,
    subscription_status: profile?.subscription_status,
    subscription_tier: profile?.subscription_tier
  });
  
  // Now simulate what happens when the dashboard loads
  console.log('\n🔍 Simulating dashboard load...');
  
  // Check what useAuth would return
  console.log('useAuth would see:', {
    user: { id: userId },
    profile: profile,
    subscription: subscription
  });
  
  // Check what useSubscription would fetch
  console.log('\n📡 Testing what useSubscription API calls would return...');
  
  // Since we can't easily make authenticated API calls, let's check the data directly
  // This simulates what the SubscriptionService.getSubscription() would return
  console.log('SubscriptionService.getSubscription() returns:', subscription);
  
  // Check the plan mapping
  const planName = subscription.plan_id === 'premium' ? 'Navigator' : subscription.plan_id;
  console.log('Plan display name:', planName);
  
  if (subscription.plan_id === 'premium' && subscription.status === 'active') {
    console.log('✅ User should see "Navigator" plan, not "Free"');
  } else {
    console.log('❌ Issue with subscription data');
  }
}

testDashboardSubscriptionFlow();
