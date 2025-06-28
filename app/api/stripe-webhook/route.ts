import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server-utils';
import { APIError, handleAPIError } from '@/lib/api-error';
import type { Database } from '@/lib/types/supabase';
import Stripe from 'stripe';

type SubscriptionTier = Database['public']['Enums']['subscription_tier'];

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil'
});

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headerList = await headers();
    const signature = headerList.get('stripe-signature');

    console.log('[Webhook] Received at /api/stripe-webhook', {
      signature: signature ? signature.substring(0, 20) + '...' : 'missing',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? 'present' : 'missing',
      bodyPreview: body.substring(0, 100)
    });
    if (!signature) {
      console.error('[Webhook] No Stripe signature found');
      throw new APIError('No Stripe signature found', 400, 'missing_signature');
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('[Webhook] Signature verification failed:', err);
      throw new APIError('Signature verification failed', 400, 'invalid_signature');
    }

    console.log('[Webhook] Event constructed:', {
      type: event.type,
      id: event.id,
      object: event.object
    });

    const supabase = await getServerClient();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier;

        console.log('[Webhook] checkout.session.completed', {
          customerId,
          userId,
          tier,
          sessionId: session.id,
          metadata: session.metadata
        });

        if (!userId) {
          console.error('[Webhook] No user ID in session metadata', { metadata: session.metadata });
          throw new APIError('No user ID in session metadata', 400, 'missing_user_id');
        }

        const subscriptionTier = (tier || 'premium') as SubscriptionTier;

        // Update user's subscription status
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            stripe_customer_id: customerId,
            subscription_status: 'active',
            subscription_tier: subscriptionTier,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (updateError) {
          console.error('[Webhook] Failed to update subscription status:', {
            error: updateError,
            userId,
            customerId,
            tier: subscriptionTier
          });
          throw new APIError('Failed to update subscription status', 500, 'update_failed');
        }

        console.log('[Webhook] Successfully updated subscription:', {
          userId,
          customerId,
          tier: subscriptionTier
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { error: userError, data: userData } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (userError || !userData) {
          console.error('[Webhook] User not found for customer:', customerId);
          throw new APIError('User not found', 404, 'user_not_found');
        }

        // Reset subscription status
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'inactive',
            subscription_tier: 'free',
            updated_at: new Date().toISOString()
          })
          .eq('id', userData.id);

        if (updateError) {
          console.error('[Webhook] Failed to reset subscription status:', updateError);
          throw new APIError('Failed to update subscription status', 500, 'update_failed');
        }
        console.log('[Webhook] Successfully reset subscription for user:', userData.id);
        break;
      }
      default:
        console.log('[Webhook] Ignored event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Handler error:', error);
    return handleAPIError(error);
  }
}
