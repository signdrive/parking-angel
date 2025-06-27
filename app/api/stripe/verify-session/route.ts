import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getUser } from '@/lib/server-auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil'
});

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
      // If payment intent exists and is succeeded, we can consider it successful
      // even if webhook hasn't processed yet
      if (session.payment_status === 'paid' || 
          (session.payment_intent as Stripe.PaymentIntent)?.status === 'succeeded') {
        return NextResponse.json({
          success: true,
          customerEmail: session.customer_email,
          subscriptionTier: session.metadata?.tier,
          sessionId: session.id
        });
      }

      // If still processing, return a retry status
      if (session.payment_status === 'processing') {
        return NextResponse.json({ 
          success: false, 
          error: 'processing',
          shouldRetry: true
        }, { status: 202 });
      }
    }

    // After retries, do a full verification including user check
    const user = await getUser();
    if (!user || session.metadata?.userId !== user.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    // Final check of payment status
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ 
        success: false, 
        error: 'Payment not completed' 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      customerEmail: session.customer_email,
      subscriptionTier: session.metadata?.tier,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Error verifying session:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to verify session' 
    }, { status: 500 });
  }
}
