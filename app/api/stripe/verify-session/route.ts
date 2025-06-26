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
      expand: ['subscription', 'customer']
    });

    if (!session) {
      return NextResponse.json({ 
        success: false, 
        error: 'Session not found' 
      }, { status: 404 });
    }

    // Verify the session belongs to the current user
    const user = await getUser();
    if (!user || session.metadata?.userId !== user.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ 
        success: false, 
        error: 'Payment not completed' 
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      customerEmail: session.customer_details?.email || session.customer_email,
      subscriptionTier: session.metadata?.tier || 'premium',
      paymentStatus: session.payment_status,
      subscriptionId: session.subscription
    });

  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
