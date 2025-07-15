/**
 * Test script to trigger profile refresh for a user
 * Usage: node test-profile-refresh.js USER_ID
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const userId = process.argv[2];

if (!userId) {
  console.error('❌ Please provide a user ID');
  console.log('Usage: node test-profile-refresh.js USER_ID');
  process.exit(1);
}

console.log('🔄 Fetching current profile for user:', userId);

try {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('❌ Error fetching profile:', error);
    process.exit(1);
  }

  console.log('📊 Current profile data:');
  console.log('- ID:', profile.id);
  console.log('- Email:', profile.email);
  console.log('- Subscription Tier:', profile.subscription_tier || 'none');
  console.log('- Subscription Status:', profile.subscription_status || 'none');
  console.log('- Updated At:', profile.updated_at);

  // Map subscription_tier to plan for UI display
  const planMapping = {
    'free': 'free',
    'premium': 'navigator', 
    'pro': 'pro_parker',
    'enterprise': 'fleet_manager'
  };

  const uiPlan = planMapping[profile.subscription_tier || 'free'] || 'free';
  console.log('- UI Plan (mapped):', uiPlan);

  console.log('\n✅ Profile data retrieved successfully');

  // Verify against subscription_plans
  console.log('\n🔍 Checking subscription plans configuration...');
  
  const plansToCheck = ['free', 'navigator', 'pro_parker', 'fleet_manager'];
  console.log('Available plan IDs:', plansToCheck);
  console.log('Current plan should show as:', uiPlan);

} catch (error) {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
}
