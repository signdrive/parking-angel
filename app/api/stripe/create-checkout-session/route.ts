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
    const { tier } = await req.json();
    const priceId = PRICE_IDS[tier as keyof typeof PRICE_IDS]
    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
   
    // Create a unique success URL with all necessary parameters
    const successUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL}/payment-success`)
    successUrl.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}')
    successUrl.searchParams.set('tier', tier)
    
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl.toString(),
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/failed`,
      metadata: { 
        userId: user.id, 
        tier,
        customerEmail: user.email
      },
      subscription_data: { 
        metadata: { 
          userId: user.id, 
          tier,
          customerEmail: user.email 
        } 
      }
    });
   
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
