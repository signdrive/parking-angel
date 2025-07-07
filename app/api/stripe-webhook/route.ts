import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { APIError } from '@/lib/api-error';
import { stripe } from '@/lib/config/stripe';
import type Stripe from 'stripe';
import { SubscriptionService } from '@/lib/services/subscription-service';

/**
 * Primary Stripe webhook handler for the Parking Angel application.
 * 
 * This endpoint processes all Stripe webhook events related to subscriptions,
 * including subscription creation, updates, deletion, and checkout completion.
 * It uses Supabase with service role access to update the database.
 * 
 * Supported Events:
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - checkout.session.completed
 * 
 * Security:
 * - Verifies Stripe signature on all requests
 * - Uses Supabase service role for database access
 * - Logs all operations for audit purposes
 * 
 * Error Handling:
 * - Invalid signatures return 400 status
 * - Database errors include detailed error codes
 * - All errors are logged with context
 * 
 * @see /docs/WEBHOOK_SETUP.md for complete documentation
 */

// Get webhook secret from environment variable
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (!webhookSecret) {
  throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set');
}
// TypeScript helper to ensure webhookSecret is never undefined
const WEBHOOK_SECRET: string = webhookSecret;

export async function POST(req: Request) {
  const startTime = Date.now();
  let eventId: string | undefined;
  let eventType: string | undefined;
  let userId: string | undefined;

  try {
    // Clone the request to ensure we're reading the raw body
    const clonedRequest = req.clone();
    const rawBody = await clonedRequest.arrayBuffer();
    const body = Buffer.from(rawBody);

    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return new NextResponse(
        JSON.stringify({
          error: 'No signature found',
          error_code: 'missing_signature',
          msg: 'Stripe signature header is missing'
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
      eventId = event.id;
      eventType = event.type;
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      if (err instanceof Error) {
        console.debug('Raw body (length):', body.length);
        console.debug('Signature (length):', signature.length);
        console.debug('Webhook secret length:', WEBHOOK_SECRET.length);
      }
      return new NextResponse(
        JSON.stringify({
          error: 'Signature verification failed',
          error_code: 'invalid_signature',
          msg: err instanceof Error ? err.message : 'Invalid signature'
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Supabase client with service role
    const supabase = createServiceClient();
    const subscriptionService = new SubscriptionService(supabase);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        await subscriptionService.handleWebhookEvent(event);
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const clientRefId = session.client_reference_id;

        if (!clientRefId) {
          throw new APIError('No user ID in session', 400, 'missing_user_id');
        }

        userId = clientRefId;
        await subscriptionService.handleCheckoutCompleted(session);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Calculate and log processing time
    const processingTime = Date.now() - startTime;
    console.log(
      `Webhook processed successfully in ${processingTime}ms`,
      {
        eventId,
        eventType,
        userId,
        processingTime,
      }
    );

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Error processing webhook:', err);
    const error = err as Error | APIError;
    
    return new NextResponse(
      JSON.stringify({
        error: error instanceof APIError ? error.message : 'Server error',
        error_code: error instanceof APIError ? error.errorCode : 'server_error',
        msg: error.message
      }),
      { 
        status: error instanceof APIError ? error.statusCode : 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
