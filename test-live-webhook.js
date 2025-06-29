/**
 * Script to test Stripe webhook delivery to the live parkalgo.com site
 * 
 * This script helps diagnose issues with Stripe webhooks in production
 * by checking webhook configurations and recent event deliveries.
 * 
 * Usage:
 * 1. Set STRIPE_SECRET_KEY in your .env.local file
 * 2. Run with: node test-live-webhook.js
 */

require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ Missing STRIPE_SECRET_KEY environment variable');
  console.log('Make sure you have STRIPE_SECRET_KEY in your .env.local file');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil'
});

async function checkWebhooks() {
  try {
    console.log('🔍 Checking Stripe webhook configurations...\n');
    
    // Get all webhook endpoints
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
    
    if (webhooks.data.length === 0) {
      console.log('❌ No webhook endpoints configured in Stripe');
      return;
    }
    
    console.log(`Found ${webhooks.data.length} webhook endpoints:\n`);
    
    // Check each webhook
    for (const webhook of webhooks.data) {
      console.log(`📌 Webhook: ${webhook.url}`);
      console.log(`   ID: ${webhook.id}`);
      console.log(`   Status: ${webhook.status}`);
      console.log(`   Events: ${webhook.enabled_events.join(', ')}`);
      console.log(`   Last error: ${webhook.last_error || 'None'}`);
      console.log('');
      
      // Get recent events delivered to this webhook
      const events = await stripe.events.list({
        limit: 5,
        delivery_success: false  // Get failed deliveries
      });
      
      if (events.data.length === 0) {
        console.log('   No recent failed webhook deliveries found');
      } else {
        console.log('   Recent failed deliveries:');
        for (const event of events.data) {
          if (event.webhooks_delivered_at === null) {
            console.log(`   - Event ${event.id} (${event.type}) created at ${new Date(event.created * 1000).toISOString()}`);
          }
        }
      }
      
      console.log('   -----------------------------------\n');
    }
    
    // Check most recent checkout.session.completed events
    const checkoutEvents = await stripe.events.list({
      limit: 5,
      type: 'checkout.session.completed'
    });
    
    if (checkoutEvents.data.length > 0) {
      console.log('🔵 Recent checkout.session.completed events:');
      for (const event of checkoutEvents.data) {
        const session = event.data.object;
        console.log(`   - Session ${session.id} at ${new Date(event.created * 1000).toISOString()}`);
        console.log(`     Customer: ${session.customer}`);
        console.log(`     Payment status: ${session.payment_status}`);
        console.log(`     Webhook delivered: ${event.webhooks_delivered_at ? 'Yes' : 'No'}`);
        
        if (session.metadata && session.metadata.userId) {
          console.log(`     User ID: ${session.metadata.userId}`);
          console.log(`     Tier: ${session.metadata.tier || 'Not specified'}`);
        } else {
          console.log(`     No userId in metadata!`);
        }
        console.log('');
      }
    } else {
      console.log('❌ No recent checkout.session.completed events found');
    }
    
  } catch (error) {
    console.error('❌ Error checking webhooks:', error);
  }
}

// Run the webhook check
checkWebhooks().then(() => {
  console.log('✅ Webhook check completed');
});
