import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSubscriptionSync() {
  console.log('🔍 Checking subscription synchronization issue...\n');
  
  try {
    // Check user_subscriptions table
    console.log('1️⃣ Checking user_subscriptions table...');
    const { data: subs, error: subsError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(5);
      
    if (subsError) {
      console.log('❌ user_subscriptions table error:', subsError.message);
    } else {
      console.log('✅ user_subscriptions table exists');
      console.log('Recent subscriptions:', subs);
    }
    
    console.log('\n2️⃣ Checking profiles table...');
    // Check profiles table 
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, subscription_plan, subscription_status, subscription_tier, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5);
      
    if (profilesError) {
      console.log('❌ profiles table error:', profilesError.message);
    } else {
      console.log('✅ profiles table exists');
      console.log('Recent profiles:', profiles);
    }
    
    console.log('\n3️⃣ Checking subscription_events table...');
    // Check subscription events
    const { data: events, error: eventsError } = await supabase
      .from('subscription_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (eventsError) {
      console.log('❌ subscription_events table error:', eventsError.message);
    } else {
      console.log('✅ subscription_events table exists');
      console.log('Recent events:', events);
    }
    
  } catch (error) {
    console.error('🚨 Error checking subscription sync:', error);
  }
}

checkSubscriptionSync();
