import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from '@supabase/supabase-js';
import { APIError, handleAPIError } from "@/lib/api-error";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-05-28.basil",
  typescript: true,
});

// Use service_role key for admin operations
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required Supabase environment variables');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);

function getPlanFromPriceId(priceId: string) {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) return "Pro";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_ELITE_PRICE_ID) return "Elite";
  return "Free";
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new APIError(
        'Missing STRIPE_WEBHOOK_SECRET',
        500,
        'missing_webhook_secret'
      );
    }

    const sig = req.headers.get("stripe-signature");
    if (!sig) {
      throw new APIError(
        'No signature found in request',
        400,
        'missing_stripe_signature'
      );
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      throw new APIError(
        'Invalid signature',
        400,
        'invalid_stripe_signature'
      );
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      let priceId: string | undefined;
      let amount_paid = 0;
      
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      if (lineItems.data[0]?.price?.id) {
        priceId = lineItems.data[0].price.id;
      }
      
      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        if (subscription.items.data[0]?.price?.id) {
          priceId = subscription.items.data[0].price.id;
        }
        amount_paid = (subscription.items.data[0]?.price?.unit_amount || 0) / 100;
      }

      const customerId = session.customer as string;
      const userId = session.metadata?.userId;

      if (!userId) {
        throw new APIError(
          'No user ID found in session metadata',
          400,
          'missing_user_id'
        );
      }

      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          subscription_tier: getPlanFromPriceId(priceId || ''),
          amount_paid,
          last_payment_date: new Date().toISOString(),
          is_active: true
        });

      if (updateError) {
        throw new APIError(
          'Failed to update subscription',
          500,
          'subscription_update_failed'
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return handleAPIError(error);
  }
}
