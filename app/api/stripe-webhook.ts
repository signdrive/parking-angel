import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

// Set this secret in your Stripe dashboard webhook settings
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const buf = await req.arrayBuffer();
  let event;

  if (!endpointSecret) {
    return NextResponse.json({ error: 'Webhook secret not set.' }, { status: 500 });
  }

  try {
    event = stripe.webhooks.constructEvent(Buffer.from(buf), sig!, endpointSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
    case 'invoice.paid':
    case 'invoice.payment_failed':
    case 'checkout.session.completed':
      // TODO: Update your database/user access here
      break;
    default:
      // Unexpected event type
      break;
  }

  // Return a 200 response to acknowledge receipt of the event
  return NextResponse.json({ received: true });
}
