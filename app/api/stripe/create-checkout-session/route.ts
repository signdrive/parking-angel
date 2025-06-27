import { NextRequest, NextResponse } from "next/server";
import { getUser } from '@/lib/server-auth'
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

const PRICE_IDS = {
  navigator: process.env.NEXT_PUBLIC_STRIPE_NAVIGATOR_PRICE_ID!,
  pro_parker: process.env.NEXT_PUBLIC_STRIPE_PRO_PARKER_PRICE_ID!,
  fleet_manager: process.env.NEXT_PUBLIC_STRIPE_FLEET_MANAGER_PRICE_ID!
} as const;

type PlanTier = keyof typeof PRICE_IDS;
type CheckoutSessionParams = Stripe.Checkout.SessionCreateParams;
type StripeMetadata = Record<string, string | number | null>;

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tier } = await req.json() as { tier: PlanTier };
    if (!tier || !(tier in PRICE_IDS)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const priceId = PRICE_IDS[tier];
    const metadata: StripeMetadata = {
      userId: user.id,
      tier,
      customerEmail: user.email || null
    };

    const sessionParams: CheckoutSessionParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&tier=${tier}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/failed`,
      metadata,
      subscription_data: { metadata },
      allow_promotion_codes: true // Allow users to enter promo codes
    };

    // Only add customer_email if it exists
    if (user.email) {
      sessionParams.customer_email = user.email;
    }

    console.log('Creating checkout session with params:', {
      mode: sessionParams.mode,
      priceId,
      customerId: user.id,
      email: user.email,
      tier
    });

    const session = await stripe.checkout.sessions.create(sessionParams);
   
    console.log('Checkout session created:', {
      sessionId: session.id,
      url: session.url,
      paymentStatus: session.payment_status,
      customerId: session.customer
    });
   
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout error:', {
      error: err.message,
      code: err.code,
      type: err.type,
      param: err.param,
      paymentIntent: err.payment_intent,
      docUrl: err.doc_url
    });
    
    // Handle specific Stripe errors
    if (err.type === 'StripeCardError') {
      return NextResponse.json({ error: 'Your card was declined.' }, { status: 400 });
    } else if (err.type === 'StripeInvalidRequestError') {
      return NextResponse.json({ error: 'Invalid request to Stripe.' }, { status: 400 });
    } else if (err.type === 'StripeAPIError') {
      return NextResponse.json({ error: 'Stripe API error.' }, { status: 500 });
    }
    
    return NextResponse.json(
      { error: err.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
