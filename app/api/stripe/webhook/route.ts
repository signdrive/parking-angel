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
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
  httpClient: Stripe.createFetchHttpClient(),
});

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return new NextResponse('No signature found', { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log('Processing webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Verify metadata exists
        if (!session.metadata?.user_id || !session.metadata?.plan_id) {
          throw new Error('Missing metadata in session');
        }

        // Update user profile with subscription info
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            subscription_tier: session.metadata.plan_id,
            subscription_status: 'active',
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            subscription_updated_at: new Date().toISOString(),
          })
          .eq('id', session.metadata.user_id);

        if (updateError) {
          throw new Error(`Error updating profile: ${updateError.message}`);
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        if (!subscription.metadata?.user_id) {
          throw new Error('Missing user_id in subscription metadata');
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            subscription_status: subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end,
            subscription_updated_at: new Date().toISOString(),
          })
          .eq('id', subscription.metadata.user_id);

        if (updateError) {
          throw new Error(`Error updating subscription: ${updateError.message}`);
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        if (!subscription.metadata?.user_id) {
          throw new Error('Missing user_id in subscription metadata');
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            subscription_tier: 'free',
            subscription_status: 'inactive',
            stripe_subscription_id: null,
            cancel_at_period_end: false,
            subscription_updated_at: new Date().toISOString(),
          })
          .eq('id', subscription.metadata.user_id);

        if (updateError) {
          throw new Error(`Error resetting subscription: ${updateError.message}`);
        }

        break;
      }
    }

    return new NextResponse(null, { status: 200 });
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    return new NextResponse(
      `Webhook Error: ${err.message}`,
      { status: err.statusCode || 400 }
    );
  }
}
