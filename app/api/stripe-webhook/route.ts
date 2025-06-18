import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from '@supabase/supabase-js';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-03-14", // Update to latest stable version
  typescript: true,
});

// Use service_role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
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
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Missing STRIPE_WEBHOOK_SECRET' },
      { status: 500 }
    );
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json(
      { error: 'No signature found in request' },
      { status: 400 }
    );
  }

  const body = await req.text();
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed" || event.type === "invoice.paid") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_email || session.customer_details?.email;
    let plan = "Free";
    let priceId = "";
    let amount_paid = 0;

    if (session.lines?.data?.[0]?.price?.id) {
      priceId = session.lines.data[0].price.id;
      plan = getPlanFromPriceId(priceId);
    } else if (session.subscription) {
      // Fetch subscription to get priceId
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      priceId = subscription.items.data[0].price.id;
      plan = getPlanFromPriceId(priceId);
    }
    if (session.amount_total) {
      amount_paid = session.amount_total / 100;
    } else if (session.amount_paid) {
      amount_paid = session.amount_paid / 100;
    }

    if (email) {
      await supabase.from('profiles').upsert({
        email,
        plan,
        total_paid: amount_paid,
      }, { onConflict: 'email' });
    }
  }

  return NextResponse.json({ received: true });
}
