import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';
import Stripe from "stripe";
import { createServerClient } from '@supabase/ssr';
import { Database } from '@/lib/types/supabase';
import { SUBSCRIPTION_PLANS } from '@/lib/config/subscription-plans';

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

export async function POST(req: NextRequest) {
  const cookieStore = req.cookies;
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
  
  try {
    // Parse request body
    const { planId, returnUrl } = await req.json();
    
    if (!planId || !PRICE_IDS[planId as keyof typeof PRICE_IDS]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, subscription_status')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      // Create new customer
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;

      // Update profile with customer ID
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: PRICE_IDS[planId as keyof typeof PRICE_IDS],
        quantity: 1,
      }],
      mode: 'subscription',
      metadata: {
        user_id: user.id,
        plan_id: planId,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      success_url: `${returnUrl || req.nextUrl.origin + '/payment-success'}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/plans?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
