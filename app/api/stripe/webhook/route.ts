import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/lib/types/supabase';
import type {
  StripeSubscriptionWithMetadata,
  StripeInvoiceWithSubscription,
  SubscriptionStatus,
} from '@/lib/types/stripe-types';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
  httpClient: Stripe.createFetchHttpClient(),
});

// Initialize Supabase client with service role key for webhook
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function updateUserSubscription(
  userId: string,
  subscriptionId: string,
  status: SubscriptionStatus,
  planId: string,
  currentPeriodEnd: number
) {
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_id: subscriptionId,
      subscription_status: status,
      plan_id: planId,
      subscription_period_end: new Date(currentPeriodEnd * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();
    const signatureHeader = req.headers.get('stripe-signature');

    if (!signatureHeader) {
      return new NextResponse('No signature found', { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      payload,
      signatureHeader,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log('Processing webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (!session.metadata?.user_id || !session.metadata?.plan_id) {
          throw new Error('Missing metadata in session');
        }

        if (!session.subscription) {
          throw new Error('No subscription in session');
        }

        // Get subscription details
        const subscription = (await stripe.subscriptions.retrieve(
          session.subscription as string
        )) as unknown as StripeSubscriptionWithMetadata;

        await updateUserSubscription(
          session.metadata.user_id,
          subscription.id,
          subscription.status as SubscriptionStatus,
          session.metadata.plan_id,
          subscription.current_period_end
        );

        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as StripeSubscriptionWithMetadata;
        const userId = subscription.metadata.user_id;

        if (!userId) {
          throw new Error('No user_id in subscription metadata');
        }

        await updateUserSubscription(
          userId,
          subscription.id,
          subscription.status as SubscriptionStatus,
          subscription.metadata.plan_id,
          subscription.current_period_end
        );

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as StripeInvoiceWithSubscription;

        if (invoice.subscription) {
          const subscription = (await stripe.subscriptions.retrieve(
            invoice.subscription
          )) as unknown as StripeSubscriptionWithMetadata;

          if (subscription.metadata.user_id) {
            await updateUserSubscription(
              subscription.metadata.user_id,
              subscription.id,
              subscription.status as SubscriptionStatus,
              subscription.metadata.plan_id,
              subscription.current_period_end
            );
          }
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as StripeInvoiceWithSubscription;

        if (invoice.subscription) {
          const subscription = (await stripe.subscriptions.retrieve(
            invoice.subscription
          )) as unknown as StripeSubscriptionWithMetadata;

          if (subscription.metadata.user_id) {
            await updateUserSubscription(
              subscription.metadata.user_id,
              subscription.id,
              'past_due',
              subscription.metadata.plan_id,
              subscription.current_period_end
            );
          }
        }

        break;
      }
    }

    return new NextResponse(JSON.stringify({ received: true }));
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Webhook handler failed' }),
      { status: 400 }
    );
  }
}
