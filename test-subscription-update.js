/**
 * Test script to verify and update a user's subscription
 * 
 * Usage:
 * 1. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file
 * 2. Run with: node test-subscription-update.js USER_ID [TIER]
 * 
 * This will:
 * - Check the user's current subscription status in Supabase
 * - Force update the subscription tier to specified tier (defaults to 'premium'/Navigator plan)
 * - Verify the update was successful
 * 
 * Valid tiers: 'free', 'premium', 'pro', 'enterprise'
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Create readline interface for confirmation prompts
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Check for production environment
const isProduction = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                     process.env.NEXT_PUBLIC_SUPABASE_URL.includes('parkalgo.com');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  console.log('Make sure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Valid subscription tiers
const VALID_TIERS = ['free', 'premium', 'pro', 'enterprise'];

// Function to prompt for confirmation
function confirmAction(message) {
  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

async function verifyAndUpdateSubscription(userId, tier = 'premium') {
  if (!userId) {
    console.error('Error: You must provide a user ID as a command line argument');
    console.log('Usage: node test-subscription-update.js USER_ID [TIER]');
    console.log('Valid tiers: free, premium, pro, enterprise');
    process.exit(1);
  }

  // Validate the tier
  if (!VALID_TIERS.includes(tier)) {
    console.error(`❌ Invalid tier: ${tier}`);
    console.log(`Valid tiers are: ${VALID_TIERS.join(', ')}`);
    process.exit(1);
  }

  // Extra confirmation for production environment
  if (isProduction) {
    console.log('\n⚠️ WARNING: You are modifying the PRODUCTION database! ⚠️');
    console.log(`Database URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
    console.log(`User ID: ${userId}`);
    console.log(`Target Tier: ${tier}`);
    
    const confirmed = await confirmAction('\nAre you ABSOLUTELY SURE you want to continue?');
    if (!confirmed) {
      console.log('Operation cancelled by user.');
      rl.close();
      process.exit(0);
    }
  }

  try {
    console.log(`\n🔍 Checking subscription status for user: ${userId}`);

    // First verify connection
    const { error: healthError } = await supabase.from('profiles').select('count').limit(1);
    if (healthError) {
      throw new Error(`Database connection failed: ${healthError.message}`);
    }
    console.log('✅ Database connection verified');

    // Check current status
    const { data: currentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status, updated_at, stripe_customer_id')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
      process.exit(1);
    }

    console.log('\n📊 Current subscription status:');
    console.log(JSON.stringify(currentProfile, null, 2));

    // Confirm the specific update
    const statusToUpdate = tier === 'free' ? 'inactive' : 'active';
    const confirmUpdate = await confirmAction(`\nUpdate subscription to ${tier} (${statusToUpdate})?`);
    if (!confirmUpdate) {
      console.log('Update cancelled by user.');
      rl.close();
      process.exit(0);
    }

    // Update the subscription
    console.log(`\n✏️ Updating subscription to ${tier}...`);
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_tier: tier,
        subscription_status: statusToUpdate,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ Error updating subscription:', updateError);
      process.exit(1);
    }

    // Verify the update
    const { data: updatedProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status, updated_at')
      .eq('id', userId)
      .single();

    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError);
      process.exit(1);
    }

    console.log('\n✅ Subscription updated successfully:');
    console.log(JSON.stringify(updatedProfile, null, 2));

    // Log the event
    await supabase
      .from('subscription_events')
      .insert({
        user_id: userId,
        event_type: 'manual_update',
        tier: tier,
        stripe_event_id: `manual_${Date.now()}`,
        event_data: {
          previousTier: currentProfile.subscription_tier,
          previousStatus: currentProfile.subscription_status,
          updatedBy: 'manual-script',
          timestamp: new Date().toISOString()
        }
      });

    console.log('\n📝 Event logged to subscription_events table');
    console.log('\n🎉 All operations completed successfully!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Get the user ID from command line arguments
const userId = process.argv[2];
const tier = process.argv[3] || 'premium'; // Default to premium if not specified
verifyAndUpdateSubscription(userId, tier);
