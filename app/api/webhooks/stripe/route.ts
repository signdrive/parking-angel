import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { Json } from '@/types/supabase';
import { 
  PlanType, 
  SubscriptionStatus, 
  StripeMetadata,
  UserSubscriptionRecord,
  SubscriptionEventRecord
} from '@/types/stripe';

const SUBSCRIPTION_STATUSES: SubscriptionStatus[] = [
  'active',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'past_due',
  'trialing',
  'unpaid'
];

const PLAN_MAPPING: Record<string, PlanType> = {
  'free': 'free',
  'basic': 'basic',
  'premium': 'navigator',
  'enterprise': 'fleet_manager',
  'pro': 'pro_parker',
  'navigator': 'navigator',
  'pro_parker': 'pro_parker',
  'fleet_manager': 'fleet_manager'
};

// Initialize Stripe and Supabase
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
  typescript: true,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('[Webhook] Verification failed:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  console.log(`[Webhook] Processing event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'invoice.paid':
      case 'invoice.payment_failed':
      case 'checkout.session.completed': {
        const session = event.data.object as Record<string, any>;
        const metadata = (session.metadata || {}) as StripeMetadata;
        const userId = metadata.userId || metadata.supabaseUuid;

        if (!userId) {
          console.error('[Webhook] No user ID in metadata:', metadata);
          return NextResponse.json(
            { error: 'Missing userId in metadata' },
            { status: 400 }
          );
        }

        // Handle subscription ID with proper type checking
        let subscriptionId: string | undefined;
        if ('subscription' in session) {
          const sub = session.subscription;
          if (typeof sub === 'string') {
            subscriptionId = sub;
          } else if (sub && typeof sub === 'object' && 'id' in sub) {
            subscriptionId = sub.id;
          }
        } else if ('id' in session && typeof session.id === 'string') {
          subscriptionId = session.id;
        }

        // Get plan from metadata with type safety
        const tier = metadata.tier;
        const plan: PlanType = tier && tier in PLAN_MAPPING 
          ? PLAN_MAPPING[tier as keyof typeof PLAN_MAPPING] 
          : 'navigator'; // Default to navigator instead of premium

        // Log to subscription_events with proper type casting
        const eventData: SubscriptionEventRecord = {
          user_id: userId,
          event_type: event.type,
          tier: plan,
          stripe_event_id: event.id,
          subscription_id: subscriptionId,
          event_data: session as unknown as Json
        };

        console.log(`[Webhook] Event data to insert:`, eventData);
        
        const { error: eventError } = await supabase
          .from('subscription_events')
          .insert({
            user_id: userId,
            event_type: event.type,
            tier: plan,
            stripe_event_id: event.id,
            subscription_id: subscriptionId,
            event_data: event.data.object
          });

        if (eventError) {
          console.error('Failed to log subscription event:', eventError);
        }

        // Determine subscription status with type checking
        let status: SubscriptionStatus = 'active';
        if ('status' in session && typeof session.status === 'string') {
          const subStatus = session.status;
          if (SUBSCRIPTION_STATUSES.includes(subStatus as SubscriptionStatus)) {
            status = subStatus as SubscriptionStatus;
          }
        }

        // Update user subscription with proper types using the new sync function
        const { data: syncResult, error: syncError } = await supabase.rpc(
          'handle_subscription_update_with_profile_sync',
          {
            p_user_id: userId,
            p_stripe_customer_id: session.customer || null,
            p_stripe_subscription_id: subscriptionId,
            p_plan_id: plan,
            p_status: status,
            p_trial_end: session.trial_end 
              ? new Date(session.trial_end * 1000).toISOString()
              : null,
            p_current_period_end: session.current_period_end
              ? new Date(session.current_period_end * 1000).toISOString()
              : null,
            p_email: session.customer_email || null
          }
        );

        if (syncError) {
          console.error('[Webhook] Failed to sync subscription and profile:', syncError);
          
          // Fallback to direct update
          const subscriptionData: UserSubscriptionRecord = {
            user_id: userId,
            stripe_subscription_id: subscriptionId,
            plan_id: plan,
            status,
            updated_at: new Date().toISOString()
          };

          const { error: subError } = await supabase
            .from('user_subscriptions')
            .upsert(subscriptionData, {
              onConflict: 'user_id'
            });

          if (subError) {
            console.error('[Webhook] Failed to update subscription:', subError);
            throw new Error(`Failed to update subscription: ${subError.message}`);
          }

          // Also update profile manually
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              subscription_plan: plan,
              subscription_status: status,
              subscription_tier: plan,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);

          if (profileError) {
            console.error('[Webhook] Failed to update profile:', profileError);
          }
        } else {
          console.log('[Webhook] Successfully synced subscription and profile:', syncResult);
        }

        console.log('[Webhook] Successfully processed event:', {
          type: event.type,
          userId,
          plan,
          status,
          subscriptionId
        });

        break;
      }
      default: {
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
        break;
      }
    }

    // Return a 200 response to acknowledge receipt of the event
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[Webhook] Processing failed:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
