import { NextRequest, NextResponse } from "next/server";
import { getUser } from '@/lib/server-auth'
import Stripe from "stripe";
import { createClient } from '@/lib/supabase/server';

// Initialize Stripe with optimized settings
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
  httpClient: Stripe.createFetchHttpClient(),
  timeout: 5000, // Add timeout to prevent long-hanging requests
});

const PRICE_IDS = {
  free: '', // Free plan has no price ID
  premium: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID!,
  pro: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!,
  enterprise: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID!
} as const;

type PlanTier = keyof typeof PRICE_IDS;
type CheckoutSessionParams = Stripe.Checkout.SessionCreateParams;
type StripeMetadata = Record<string, string | number | null>;

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const supabase = createClient();
  
  try {
    // Parse request body
    const { planId, priceId } = await req.json();
    
    if (!planId || !PRICE_IDS[planId as PlanTier]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_uid: user.id,
        },
      });
      customerId = customer.id;

      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Prepare session parameters
    const sessionParams: CheckoutSessionParams = {
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/plans`,
      metadata: {
        user_id: user.id,
        plan_id: planId
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_id: planId
        }
      },
      allow_promotion_codes: true
    };

    // Create the session
    const session = await stripe.checkout.sessions.create(sessionParams);
    
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Checkout session error:', err);
    
    // Handle specific Stripe errors
    if (err.type === 'StripeCardError') {
      return NextResponse.json({ error: 'Your card was declined.' }, { status: 400 });
    } else if (err.type === 'StripeInvalidRequestError') {
      return NextResponse.json({ error: 'Invalid request to Stripe.' }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
