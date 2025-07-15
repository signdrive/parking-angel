import { NextRequest, NextResponse } from "next/server";
import { stripe } from '@/lib/config/stripe';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getBaseUrl } from '@/lib/url-utils';

// Plan to Stripe price ID mapping
const PRICE_MAPPING: Record<string, string> = {
  'navigator': process.env.NEXT_PUBLIC_STRIPE_NAVIGATOR_PRICE_ID!,
  'pro_parker': process.env.NEXT_PUBLIC_STRIPE_PRO_PARKER_PRICE_ID!,
  'fleet_manager': process.env.NEXT_PUBLIC_STRIPE_FLEET_MANAGER_PRICE_ID!,
};

export async function POST(req: NextRequest) {
  try {
    const { tier } = await req.json();
    
    if (!tier) {
      return NextResponse.json({ error: 'Plan tier is required' }, { status: 400 });
    }

    // Get current user from session using proper SSR client
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            // Can't set cookies in POST API route
          },
          remove(name: string, options: any) {
            // Can't remove cookies in POST API route
          },
        },
      }
    );
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication error in checkout:', authError);
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    console.log('Creating checkout session for user:', user.id, 'tier:', tier);

    // Get the price ID for the plan
    const priceId = PRICE_MAPPING[tier];
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan tier' }, { status: 400 });
    }

    // Get or create Stripe customer
    let customerId: string;
    
    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        supabaseUuid: user.id,
      },
    });
    customerId = customer.id;

    // Store customer ID in database
    await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: user.id,
        plan_id: 'free',
        status: 'incomplete',
        updated_at: new Date().toISOString()
      });

    // Get the base URL for success/cancel redirects
    const baseUrl = getBaseUrl();
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
      metadata: {
        userId: user.id,
        planTier: tier,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    );
  }
}
