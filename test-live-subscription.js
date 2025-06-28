// Test webhook and subscription update on live site
const stripe = require('stripe')('sk_test_51RWNzyKFfjGfLUIXIJAhKCdNf0ii8SktLh3ZKgq4TZlm8BwNXD7R6TEdmX7UiZtVy9jJJJms6cMSrNDcPSjAYyjS00cGUvRJ4k');

const testLiveSubscription = async () => {
  console.log('🔥 Testing Live Subscription Flow');

  try {
    // 1. Get the latest session ID from the URL you just used
    const sessionId = 'cs_test_b1K6CRj825oPDcrTQB7ynVkB6GkuSae6U5uN17kOsrzGLEhSjxuh8hBRnJ';
    console.log('Checking session:', sessionId);

    // 2. Fetch the session details from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription']
    });

    console.log('Stripe Session:', {
      id: session.id,
      customer: session.customer,
      status: session.payment_status,
      subscription: session.subscription?.id,
      metadata: session.metadata
    });

    // 3. Check if webhook was received by querying Supabase
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      'https://vzhvpecwnjssurxbyzph.supabase.co',
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6aHZwZWN3bmpzc3VyeGJ5enBoIiwicm9zZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODg3NjAwOSwiZXhwIjoyMDY0NDUyMDA5fQ.QZYlp4GzTYT5CQ6y5A5ZlD-CsZrQNlw7pBD3RlFj0oA'
    );

    // Get the subscription from Supabase
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', session.metadata.userId)
      .single();

    if (error) {
      console.error('❌ Supabase Error:', error);
      return;
    }

    if (!subscription) {
      console.log('❌ No subscription found in database');
      console.log('Attempting to insert subscription...');

      // Try to insert the subscription manually
      const { error: insertError } = await supabase
        .from('user_subscriptions')
        .upsert({
          id: session.subscription?.id || crypto.randomUUID(),
          user_id: session.metadata.userId,
          plan_id: session.metadata.tier,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('❌ Failed to insert subscription:', insertError);
      } else {
        console.log('✅ Manually inserted subscription');
      }
    } else {
      console.log('✅ Found subscription in database:', subscription);
    }

    // 4. Log webhook events
    const { data: events, error: eventsError } = await supabase
      .from('subscription_events')
      .select('*')
      .eq('stripe_event_id', session.id);

    if (eventsError) {
      console.error('❌ Failed to check webhook events:', eventsError);
    } else {
      console.log('Webhook Events:', events);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Run the test
testLiveSubscription();
