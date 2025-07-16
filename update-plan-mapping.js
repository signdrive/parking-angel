import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updatePlanIdMapping() {
  console.log('🔄 Updating plan ID mapping in database...\n');
  
  try {
    // Update user_subscriptions table
    console.log('1️⃣ Updating user_subscriptions table...');
    
    const { data: premiumSubs, error: premiumError } = await supabase
      .from('user_subscriptions')
      .update({ plan_id: 'navigator' })
      .eq('plan_id', 'premium')
      .select();
    
    if (premiumError) {
      console.log('❌ Error updating premium subscriptions:', premiumError);
    } else {
      console.log(`✅ Updated ${premiumSubs?.length || 0} premium subscriptions to navigator`);
    }
    
    const { data: proSubs, error: proError } = await supabase
      .from('user_subscriptions')
      .update({ plan_id: 'pro_parker' })
      .eq('plan_id', 'pro')
      .select();
    
    if (proError) {
      console.log('❌ Error updating pro subscriptions:', proError);
    } else {
      console.log(`✅ Updated ${proSubs?.length || 0} pro subscriptions to pro_parker`);
    }
    
    const { data: enterpriseSubs, error: enterpriseError } = await supabase
      .from('user_subscriptions')
      .update({ plan_id: 'fleet_manager' })
      .eq('plan_id', 'enterprise')
      .select();
    
    if (enterpriseError) {
      console.log('❌ Error updating enterprise subscriptions:', enterpriseError);
    } else {
      console.log(`✅ Updated ${enterpriseSubs?.length || 0} enterprise subscriptions to fleet_manager`);
    }
    
    // Update profiles table
    console.log('\n2️⃣ Updating profiles table...');
    
    const { data: premiumProfiles, error: premiumProfileError } = await supabase
      .from('profiles')
      .update({ 
        subscription_plan: 'navigator',
        subscription_tier: 'navigator'
      })
      .eq('subscription_plan', 'premium')
      .select();
    
    if (premiumProfileError) {
      console.log('❌ Error updating premium profiles:', premiumProfileError);
    } else {
      console.log(`✅ Updated ${premiumProfiles?.length || 0} premium profiles to navigator`);
    }
    
    const { data: proProfiles, error: proProfileError } = await supabase
      .from('profiles')
      .update({ 
        subscription_plan: 'pro_parker',
        subscription_tier: 'pro_parker'
      })
      .eq('subscription_plan', 'pro')
      .select();
    
    if (proProfileError) {
      console.log('❌ Error updating pro profiles:', proProfileError);
    } else {
      console.log(`✅ Updated ${proProfiles?.length || 0} pro profiles to pro_parker`);
    }
    
    const { data: enterpriseProfiles, error: enterpriseProfileError } = await supabase
      .from('profiles')
      .update({ 
        subscription_plan: 'fleet_manager',
        subscription_tier: 'fleet_manager'
      })
      .eq('subscription_plan', 'enterprise')
      .select();
    
    if (enterpriseProfileError) {
      console.log('❌ Error updating enterprise profiles:', enterpriseProfileError);
    } else {
      console.log(`✅ Updated ${enterpriseProfiles?.length || 0} enterprise profiles to fleet_manager`);
    }
    
    // Verify the changes
    console.log('\n3️⃣ Verifying changes...');
    
    const { data: subscriptions } = await supabase
      .from('user_subscriptions')
      .select('plan_id')
      .order('updated_at', { ascending: false })
      .limit(10);
    
    console.log('Recent subscriptions:', subscriptions);
    
    const { data: profiles } = await supabase
      .from('profiles')
      .select('subscription_plan, subscription_tier')
      .order('updated_at', { ascending: false })
      .limit(10);
    
    console.log('Recent profiles:', profiles);
    
    console.log('\n✅ Plan ID mapping update completed!');
    
  } catch (error) {
    console.error('🚨 Error updating plan ID mapping:', error);
  }
}

updatePlanIdMapping();
