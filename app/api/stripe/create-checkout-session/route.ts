import { NextRequest, NextResponse } from "next/server";
import { getUser } from '@/lib/server-auth'
import Stripe from "stripe";

// Initialize Stripe with optimized settings
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
  httpClient: Stripe.createFetchHttpClient(),
  timeout: 5000, // Add timeout to prevent long-hanging requests
});

const PRICE_IDS = {
  navigator: process.env.NEXT_PUBLIC_STRIPE_NAVIGATOR_PRICE_ID!,
  pro_parker: process.env.NEXT_PUBLIC_STRIPE_PRO_PARKER_PRICE_ID!,
  fleet_manager: process.env.NEXT_PUBLIC_STRIPE_FLEET_MANAGER_PRICE_ID!
} as const;

type PlanTier = keyof typeof PRICE_IDS;
type CheckoutSessionParams = Stripe.Checkout.SessionCreateParams;
type StripeMetadata = Record<string, string | number | null>;

export async function HEAD(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Allow': 'POST'
    }
  });
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Parse request body first (faster than auth check)
    const body = await req.json();
    const { tier } = body as { tier: PlanTier };
    
    if (!tier || !(tier in PRICE_IDS)) {
      console.error(`Create checkout session failed: Invalid plan "${tier}"`);
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    
    // Get user info (auth) - perform in parallel with other preparations
    const userPromise = getUser();
    
    // Get price ID
    const priceId = PRICE_IDS[tier];
    
    // Get the base URL dynamically based on the request host
    const host = req.headers.get('host') || '';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    
    // Wait for user authentication
    const user = await userPromise;
    if (!user) {
      console.error('Create checkout session failed: User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Prepare metadata
    const metadata: StripeMetadata = {
      userId: user.id,
      tier,
      customerEmail: user.email || null
    };

    // Prepare minimal session parameters for faster creation
    const sessionParams: CheckoutSessionParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}&tier=${tier}`,
      cancel_url: `${baseUrl}/failed`,
      metadata,
      subscription_data: { metadata },
      allow_promotion_codes: true
    };

    // Only add customer_email if it exists
    if (user.email) {
      sessionParams.customer_email = user.email;
    }

    console.log('Creating checkout session for user:', {
      userId: user.id,
      email: user.email,
      tier,
      priceId
    });

    // Create the session with Stripe
    const session = await stripe.checkout.sessions.create(sessionParams);
   
    const duration = Date.now() - startTime;
    console.log('Checkout session created in ' + duration + 'ms:', {
      sessionId: session.id,
      url: session.url ? session.url.substring(0, 50) + '...' : null,
      userId: user.id,
      tier
    });
   
    // Return immediately without unnecessary processing
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    const duration = Date.now() - startTime;
    console.error(`Stripe checkout error after ${duration}ms:`, {
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
