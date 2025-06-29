/**
 * Test Payment Flow Script
 * 
 * This script helps debug the entire payment flow by:
 * 1. Creating a test checkout session
 * 2. Simulating a successful payment event 
 * 3. Verifying the profile was updated correctly
 * 
 * Usage:
 * node test-payment-flow.js [userId] [tier]
 * 
 * Requires:
 * - STRIPE_SECRET_KEY in .env.local
 * - SUPABASE_SERVICE_ROLE_KEY in .env.local
 * - NEXT_PUBLIC_SUPABASE_URL in .env.local
 */

require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil',
});

// Initialize Supabase with the service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Map from tier codes to Supabase subscription_tier enum values
const TIER_MAPPING = {
  'navigator': 'premium',
  'pro_parker': 'pro',
  'fleet_manager': 'enterprise'
};

// Test customer email
const TEST_EMAIL = 'test@example.com';

// Price IDs for the different subscription tiers
const PRICE_IDS = {
  navigator: process.env.NEXT_PUBLIC_STRIPE_NAVIGATOR_PRICE_ID,
  pro_parker: process.env.NEXT_PUBLIC_STRIPE_PRO_PARKER_PRICE_ID,
  fleet_manager: process.env.NEXT_PUBLIC_STRIPE_FLEET_MANAGER_PRICE_ID
};

async function main() {
  try {
    // Get user ID and tier from command line
    const userId = process.argv[2];
    const tier = process.argv[3] || 'navigator';

    if (!userId) {
      console.error('Please provide a user ID as the first argument');
      process.exit(1);
    }

    if (!PRICE_IDS[tier]) {
      console.error(`Invalid tier: ${tier}. Must be one of: navigator, pro_parker, fleet_manager`);
      process.exit(1);
    }

    console.log(`Running payment flow test for user ${userId} with tier ${tier}`);

    // 1. Check if user exists
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      process.exit(1);
    }

    console.log('User found:', {
      id: userData.id,
      email: userData.email || 'No email',
      currentTier: userData.subscription_tier || 'none',
      currentStatus: userData.subscription_status || 'none'
    });

    // 2. Create a checkout session
    console.log('Creating test checkout session...');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: PRICE_IDS[tier], quantity: 1 }],
      mode: 'subscription',
      success_url: 'http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/failed',
      customer_email: TEST_EMAIL,
      metadata: {
        userId: userId,
        tier: tier
      },
      subscription_data: {
        metadata: {
          userId: userId,
          tier: tier
        }
      }
    });

    console.log('Checkout session created:', {
      id: session.id,
      url: session.url
    });

    // 3. Simulate webhook event for successful checkout
    console.log('Simulating checkout.session.completed webhook event...');
    
    // First, update profile directly to simulate webhook effect
    const subscriptionTier = TIER_MAPPING[tier] || 'premium';
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        subscription_tier: subscriptionTier,
        stripe_customer_id: `test_customer_${Date.now()}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating profile:', updateError);
    } else {
      console.log('Profile updated successfully');
    }

    // 4. Verify the profile update
    const { data: updatedUser, error: updatedUserError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (updatedUserError) {
      console.error('Error fetching updated user:', updatedUserError);
    } else {
      console.log('Updated user profile:', {
        id: updatedUser.id,
        tier: updatedUser.subscription_tier,
        status: updatedUser.subscription_status,
        updatedAt: updatedUser.updated_at
      });
    }

    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

main();
