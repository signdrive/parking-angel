#!/usr/bin/env node

/**
 * Quick diagnostic script to check the current state of subscription sync
 * Run this to identify what needs to be fixed
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

// Check if we have required environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('❌ Missing environment variables');
  console.log('Make sure .env.local has:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function diagnoseSubscriptionSync() {
  console.log('🔍 Diagnosing Subscription Sync Issues\n');
  
  const issues = [];
  
  try {
    // 1. Check if user_subscriptions table has email column
    console.log('1. Checking user_subscriptions table structure...');
    
    const { data: subData, error: subError } = await supabase
      .from('user_subscriptions')
      .select('user_id, plan_id, status, email')
      .limit(1);
    
    if (subError) {
      if (subError.message.includes('column "email" does not exist')) {
        console.log('❌ Email column missing in user_subscriptions table');
        issues.push('email_column_missing');
      } else {
        console.log('❌ Error accessing user_subscriptions:', subError.message);
        issues.push('table_access_error');
      }
    } else {
      console.log('✅ user_subscriptions table accessible with email column');
    }

    // 2. Check profiles table columns
    console.log('\n2. Checking profiles table structure...');
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, subscription_plan, subscription_status, subscription_tier')
      .limit(1);
    
    if (profileError) {
      if (profileError.message.includes('column') && profileError.message.includes('does not exist')) {
        console.log('❌ Missing columns in profiles table:', profileError.message);
        issues.push('profile_columns_missing');
      } else {
        console.log('❌ Error accessing profiles:', profileError.message);
        issues.push('profile_access_error');
      }
    } else {
      console.log('✅ Profiles table has required columns');
    }

    // 3. Check if sync functions exist
    console.log('\n3. Checking sync functions...');
    
    const { data: syncResult, error: syncError } = await supabase
      .rpc('sync_profile_subscription', {
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_plan_id: 'premium',
        p_status: 'active'
      });
    
    if (syncError) {
      if (syncError.message.includes('function') && syncError.message.includes('does not exist')) {
        console.log('❌ sync_profile_subscription function does not exist');
        issues.push('sync_function_missing');
      } else {
        console.log('✅ sync_profile_subscription function exists (got expected error for dummy data)');
      }
    } else {
      console.log('✅ sync_profile_subscription function exists and works');
    }

    // 4. Check main handler function
    const { data: handlerResult, error: handlerError } = await supabase
      .rpc('handle_subscription_update_with_profile_sync', {
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_stripe_customer_id: 'cus_test',
        p_stripe_subscription_id: 'sub_test',
        p_plan_id: 'premium',
        p_status: 'active',
        p_email: 'test@example.com'
      });
    
    if (handlerError) {
      if (handlerError.message.includes('function') && handlerError.message.includes('does not exist')) {
        console.log('❌ handle_subscription_update_with_profile_sync function does not exist');
        issues.push('handler_function_missing');
      } else {
        console.log('✅ handle_subscription_update_with_profile_sync function exists');
      }
    } else {
      console.log('✅ Main handler function exists and works');
    }

    // 5. Check for existing data that needs sync
    console.log('\n4. Checking for data inconsistencies...');
    
    const { data: subscriptions, error: subsError } = await supabase
      .from('user_subscriptions')
      .select('user_id, plan_id, status, email');
    
    if (!subsError && subscriptions) {
      const emptyEmails = subscriptions.filter(s => !s.email).length;
      if (emptyEmails > 0) {
        console.log(`⚠️  ${emptyEmails} subscriptions missing email addresses`);
        issues.push('missing_emails');
      } else {
        console.log('✅ All subscriptions have email addresses');
      }
    }

    // Summary
    console.log('\n📋 DIAGNOSIS SUMMARY\n');
    
    if (issues.length === 0) {
      console.log('🎉 Everything looks good! The system should be working correctly.');
      console.log('\nIf you\'re still experiencing issues:');
      console.log('1. Try completing a new payment to test the flow');
      console.log('2. Check the application logs for any errors');
      console.log('3. Verify your Stripe webhook is configured correctly');
    } else {
      console.log('❌ Found issues that need to be resolved:');
      
      if (issues.includes('email_column_missing') || 
          issues.includes('profile_columns_missing') || 
          issues.includes('sync_function_missing') || 
          issues.includes('handler_function_missing')) {
        console.log('\n🔧 SOLUTION: Run the SQL migration script');
        console.log('1. Copy the contents of fix-profile-sync.sql');
        console.log('2. Paste and run in Supabase SQL Editor');
        console.log('3. Run this diagnostic script again to verify');
      }
      
      if (issues.includes('missing_emails')) {
        console.log('\n📧 EMAIL FIX: After running the migration, emails will be populated automatically');
      }
    }
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
  }
}

// Run the diagnosis
diagnoseSubscriptionSync();
