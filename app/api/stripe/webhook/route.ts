import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/types/supabase';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the service role key for webhook
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key for webhook
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

type SubscriptionPlan = Database['public']['Tables']['user_subscriptions']['Row'];
type SubscriptionEvent = Database['public']['Tables']['subscription_events']['Row'];
type StripeCheckoutSession = Stripe.Checkout.Session;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

// Allow using a test secret in development
const webhookSecret = process.env.NODE_ENV === 'development'
  ? (process.env.STRIPE_WEBHOOK_SECRET_TEST || 'whsec_test_secret')
  : process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = headers();
  if (!(headersList instanceof Headers)) {
    return NextResponse.json({ error: 'Invalid headers' }, { status: 400 });
  }

  const stripeSignature = headersList.get('stripe-signature');

  if (!stripeSignature) {
    console.error('Webhook Error: No signature provided');
    return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    console.log('Webhook: Verifying Stripe signature...');
    event = stripe.webhooks.constructEvent(body, stripeSignature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook Error: Signature verification failed:', err.message, {
      signature: stripeSignature.substring(0, 20) + '...',
      bodyPreview: body.substring(0, 100) + '...'
    });
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
  }
    
  try {
    console.log('Webhook received:', {
      eventType: event.type,
      eventId: event.id,
      webhookSecret: webhookSecret ? 'Set' : 'Not set',
      stripeSignature: stripeSignature ? 'Present' : 'Missing',
      bodyPreview: body.substring(0, 100)
    });
    
    console.log('Webhook: Processing event:', event.type, 'ID:', event.id);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as StripeCheckoutSession;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier;

        console.log('Webhook: Processing checkout completion for user:', userId);

        if (!userId || !tier) {
          const error = 'Missing userId or tier in session metadata';
          console.error('Webhook Error:', error, { userId, tier });
          return NextResponse.json({ error }, { status: 400 });
        }

        let subscription: Stripe.Subscription | null = null;

        try {
          // Fetch the subscription details if available
          if (session.subscription) {
            const response = await stripe.subscriptions.retrieve(session.subscription as string);
            subscription = response;
            console.log('Webhook: Retrieved subscription details:', subscription.id);
          }
        } catch (err: any) {
          console.warn('Webhook Warning: Failed to retrieve subscription details:', err.message);
          // Continue processing even if subscription fetch fails
        }

        console.log('Webhook: Updating subscription in Supabase...');

        // Prepare the subscription data according to the schema
        const subscriptionData: Database['public']['Tables']['user_subscriptions']['Insert'] = {
          id: session.subscription as string || crypto.randomUUID(),
          user_id: userId,
          plan_id: tier,
          status: subscription?.status || 'active',
          trial_end: subscription?.trial_end 
            ? new Date((subscription.trial_end as number) * 1000).toISOString() 
            : null,
          cancel_at_period_end: Boolean(subscription?.cancel_at_period_end),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        console.log('Webhook: Preparing to upsert subscription data:', {
          ...subscriptionData,
          session_id: session.id,
          customer_email: session.customer_email,
          payment_status: session.payment_status
        });

        // First check if subscription exists
        const { data: existingSub } = await supabase
          .from('user_subscriptions')
          .select()
          .eq('user_id', userId)
          .single();

        console.log('Webhook: Existing subscription:', existingSub);

        const { error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .upsert(subscriptionData);

        if (subscriptionError) {
          console.error('Webhook Error: Failed to update subscription:', subscriptionError);
          throw subscriptionError;
        }

        // Log subscription event with proper typing
        const eventData: Database['public']['Tables']['subscription_events']['Insert'] = {
          user_id: userId,
          event_type: 'subscription_created',
          tier: tier,
          stripe_event_id: event.id,
          created_at: new Date().toISOString(),
          subscription_id: subscription?.id || session.subscription as string || null,
          event_data: {
            checkout_session_id: session.id,
            customer_email: session.customer_email || null,
            payment_status: session.payment_status
          }
        };

        const { error: eventError } = await supabase
          .from('subscription_events')
          .insert(eventData);

        if (eventError) {
          console.warn('Webhook Warning: Failed to log subscription event:', eventError);
          // Don't throw here, as the main subscription update was successful
        }

        console.log('Webhook: Successfully processed checkout completion');
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        const tier = subscription.metadata?.tier;

        if (!userId || !tier) {
          const error = 'Missing userId or tier in subscription metadata';
          console.error('Webhook Error:', error);
          return NextResponse.json({ error }, { status: 400 });
        }

        console.log('Webhook: Processing subscription update for user:', userId);

        const updateData: Database['public']['Tables']['user_subscriptions']['Update'] = {
          user_id: userId,
          plan_id: tier,
          status: subscription.status,
          trial_end: subscription.trial_end
            ? new Date((subscription.trial_end as number) * 1000).toISOString()
            : null,
          cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('user_subscriptions')
          .update(updateData)
          .match({ user_id: userId });

        if (error) {
          console.error('Webhook Error: Failed to update subscription:', error);
          throw error;
        }

        console.log('Webhook: Successfully processed subscription update');
        break;
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Webhook Error: Processing failed:', err.message, err.stack);
    return NextResponse.json(
      { error: `Webhook processing failed: ${err.message}` },
      { status: 500 }
    );
  }
}
