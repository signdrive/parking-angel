import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixSubscriptionMapping() {
  console.log('🔧 Fixing subscription plan ID mapping...\n');
  
  try {
    // 1. Update user_subscriptions table to use correct plan IDs
    console.log('1️⃣ Updating user_subscriptions table...');
    
    const { data: updatedSubs, error: subError } = await supabase
      .from('user_subscriptions')
      .update({ plan_id: 'navigator' })
      .eq('plan_id', 'premium')
      .select('*');
    
    if (subError) {
      console.error('❌ Error updating user_subscriptions:', subError);
    } else {
      console.log('✅ Updated user_subscriptions:', updatedSubs);
    }
    
    // 2. Update profiles table to use correct plan IDs
    console.log('\n2️⃣ Updating profiles table...');
    
    const { data: updatedProfiles, error: profileError } = await supabase
      .from('profiles')
      .update({ 
        subscription_plan: 'navigator',
        subscription_tier: 'navigator'
      })
      .eq('subscription_plan', 'premium')
      .select('*');
    
    if (profileError) {
      console.error('❌ Error updating profiles:', profileError);
    } else {
      console.log('✅ Updated profiles:', updatedProfiles);
    }
    
    // 3. Verify the changes
    console.log('\n3️⃣ Verifying the changes...');
    
    const { data: currentSubs, error: verifySubs } = await supabase
      .from('user_subscriptions')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(3);
    
    if (verifySubs) {
      console.error('❌ Error verifying subscriptions:', verifySubs);
    } else {
      console.log('✅ Current subscriptions:');
      currentSubs.forEach(sub => {
        console.log(`  - User: ${sub.user_id}, Plan: ${sub.plan_id}, Status: ${sub.status}`);
      });
    }
    
    const { data: currentProfiles, error: verifyProfiles } = await supabase
      .from('profiles')
      .select('id, email, subscription_plan, subscription_tier, subscription_status')
      .order('updated_at', { ascending: false })
      .limit(3);
    
    if (verifyProfiles) {
      console.error('❌ Error verifying profiles:', verifyProfiles);
    } else {
      console.log('✅ Current profiles:');
      currentProfiles.forEach(profile => {
        console.log(`  - User: ${profile.id}, Plan: ${profile.subscription_plan}, Tier: ${profile.subscription_tier}, Status: ${profile.subscription_status}`);
      });
    }
    
  } catch (error) {
    console.error('🚨 Error fixing subscription mapping:', error);
  }
}

fixSubscriptionMapping();
