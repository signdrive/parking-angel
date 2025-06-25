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
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tier, priceId } = await req.json();
    
    // Support both new tier-based and legacy priceId-based requests
    const finalPriceId = priceId || PRICE_IDS[tier as keyof typeof PRICE_IDS]
    
    if (!finalPriceId) {
      return NextResponse.json({ error: "Missing priceId or invalid tier" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?canceled=1`,
      metadata: {
        userId: user.id,
        tier: tier || 'unknown'
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          tier: tier || 'unknown'
        }
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
