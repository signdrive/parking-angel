import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getUser } from '@/lib/server-auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil'
});

// Define valid payment status types
type StripePaymentStatus = Stripe.Checkout.Session.PaymentStatus;
type StripePaymentIntentStatus = Stripe.PaymentIntent.Status;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ 
        success: false, 
        error: 'No session ID provided' 
      }, { status: 400 });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer', 'payment_intent']
    });

    if (!session) {
      return NextResponse.json({ 
        success: false, 
        error: 'Session not found' 
      }, { status: 404 });
    }

    // For the first few retries, we don't need to verify the user
    // This helps when the webhook hasn't processed yet
    const retryCount = parseInt(searchParams.get('retry') || '0');
    if (retryCount < 3) {
      // Check payment status
      const paymentStatus = session.payment_status as StripePaymentStatus;
      const paymentIntentStatus = (session.payment_intent as Stripe.PaymentIntent)?.status as StripePaymentIntentStatus;

      // If payment is complete or subscription is active
      if (paymentStatus === 'paid' || 
          paymentIntentStatus === 'succeeded' ||
          paymentStatus === 'no_payment_required' ||
          (session.subscription as Stripe.Subscription)?.status === 'active') {
        console.log('Payment verified successfully:', {
          paymentStatus,
          paymentIntentStatus,
          subscriptionStatus: (session.subscription as Stripe.Subscription)?.status,
          customerEmail: session.customer_email,
          tier: session.metadata?.tier
        });
        return NextResponse.json({
          success: true,
          customerEmail: session.customer_email || null,
          subscriptionTier: session.metadata?.tier,
          sessionId: session.id
        });
      }

      // If still processing, return a retry status
      if (paymentIntentStatus === 'processing') {
        return NextResponse.json({ 
          success: false,
          shouldRetry: true,
          error: 'Payment is still processing',
          retryCount
        }, { status: 202 });
      }
    }

    // After a few retries, verify the user and check the subscription status
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Check payment status again with proper typing
    const paymentStatus = session.payment_status as StripePaymentStatus;
    const paymentIntentStatus = (session.payment_intent as Stripe.PaymentIntent)?.status as StripePaymentIntentStatus;

    // Return success if payment is complete
    if (paymentStatus === 'paid' || 
        paymentIntentStatus === 'succeeded' ||
        paymentStatus === 'no_payment_required') {
      return NextResponse.json({
        success: true,
        customerEmail: session.customer_email || null,
        subscriptionTier: session.metadata?.tier,
        sessionId: session.id
      });
    }

    // Handle other payment statuses
    return NextResponse.json({ 
      success: false, 
      error: `Payment status: ${paymentStatus}` 
    }, { status: 400 });

  } catch (error: any) {
    console.error('Verify session error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to verify session'
    }, { status: 500 });
  }
}
