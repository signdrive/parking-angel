import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

// Create a Supabase client with the service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type StripeSubscription = Stripe.Subscription & {
  current_period_end: number;
  status: string;
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    console.error('Webhook Error: No signature provided');
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  try {
    console.log('Webhook: Processing incoming event...');
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log('Webhook: Event type:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Webhook: Processing checkout completion for user:', session.metadata?.userId);
        
        if (!session.metadata?.userId || !session.metadata?.tier) {
          console.error('Webhook Error: Missing metadata', session.metadata);
          throw new Error('Missing user ID or tier in session metadata');
        }

        // Fetch the subscription details
        const subscription = session.subscription 
          ? await stripe.subscriptions.retrieve(session.subscription as string)
          : null;

        console.log('Webhook: Updating subscription in Supabase...');
        // Update user's subscription in database
        const { error } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: session.metadata.userId,
            tier: session.metadata.tier,
            status: 'active',
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            current_period_end: subscription 
              ? new Date(((subscription as any).current_period_end || Date.now()/1000) * 1000).toISOString()
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          });

        if (error) {
          console.error('Webhook Error: Failed to update Supabase:', error);
          throw error;
        }
        
        console.log('Webhook: Successfully processed checkout completion');
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as StripeSubscription;
        const userId = subscription.metadata?.userId;
        const tier = subscription.metadata?.tier;

        console.log('Webhook: Processing subscription update for user:', userId);

        if (userId && tier) {
          const { error } = await supabase
            .from('user_subscriptions')
            .upsert({
              user_id: userId,
              tier: tier,
              status: subscription.status === 'active' ? 'active' : 'past_due',
              stripe_subscription_id: subscription.id,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            });

          if (error) {
            console.error('Webhook Error: Failed to update subscription:', error);
            throw error;
          }
          console.log('Webhook: Successfully updated subscription');
        } else {
          console.error('Webhook Error: Missing metadata in subscription update', subscription.metadata);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as StripeSubscription;
        const userId = subscription.metadata?.userId;

        console.log('Webhook: Processing subscription deletion for user:', userId);

        if (userId) {
          const { error } = await supabase
            .from('user_subscriptions')
            .update({
              tier: 'basic',
              status: 'canceled',
              cancel_at_period_end: true,
            })
            .eq('user_id', userId);

          if (error) {
            console.error('Webhook Error: Failed to cancel subscription:', error);
            throw error;
          }
          console.log('Webhook: Successfully processed subscription cancellation');
        } else {
          console.error('Webhook Error: Missing user ID in deletion event');
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook error:', err);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}
