import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/config/stripe';
import { subscriptionService } from '@/lib/services/subscription-service';
import type Stripe from 'stripe';
import { StripeSubscriptionWithMetadata } from '@/lib/types/stripe-types';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    // Use await here since headers() returns a Promise in the newer Next.js
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return new NextResponse('No signature found', { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new NextResponse('Webhook signature verification failed', { status: 400 });
    }

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await subscriptionService.handleSubscriptionUpdated(subscription as any);
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // If this is a subscription, it will have already been handled
        if (session.mode !== 'subscription') {
          console.log('Non-subscription checkout completed');
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new NextResponse('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Webhook error occurred', { status: 500 });
  }
}
