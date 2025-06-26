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

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (!session.metadata?.userId || !session.metadata?.tier) {
          throw new Error('Missing user ID or tier in session metadata');
        }

        // Update user's subscription in database
        const { error } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: session.metadata.userId,
            tier: session.metadata.tier,
            status: 'active',
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          });

        if (error) throw error;
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.userId;
        const tier = subscription.metadata.tier;

        if (userId && tier) {
          const { error } = await supabase
            .from('user_subscriptions')
            .upsert({
              user_id: userId,
              tier: tier,
              status: subscription.status === 'active' ? 'active' : 'past_due',
              current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            });

          if (error) throw error;
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.userId;

        if (userId) {
          const { error } = await supabase
            .from('user_subscriptions')
            .update({
              tier: 'basic',
              status: 'canceled',
              cancel_at_period_end: true,
            })
            .eq('user_id', userId);

          if (error) throw error;
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
