import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerClient } from '@/lib/supabase/server-utils';

// Initialize Stripe with optimized settings
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
  timeout: 5000 // Add timeout to prevent long-hanging requests
});

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription']
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Verify payment status
    if (session.payment_status !== 'paid') {
      return NextResponse.json({
        status: 'pending',
        message: 'Payment not completed'
      });
    }

    // Verify subscription was created
    if (!session.subscription) {
      return NextResponse.json({
        status: 'error',
        message: 'No subscription found'
      });
    }

    // Double-check subscription in Supabase
    const supabase = await getServerClient();
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_tier')
      .eq('id', session.metadata?.user_id)
      .single();

    if (profileError || !profile) {
      console.error('Error verifying profile:', profileError);
      return NextResponse.json({
        status: 'error',
        message: 'Error verifying subscription'
      });
    }

    // Verify subscription is active
    if (profile.subscription_status !== 'active') {
      return NextResponse.json({
        status: 'pending',
        message: 'Subscription pending activation'
      });
    }

    // Everything is good!
    return NextResponse.json({
      status: 'complete',
      tier: profile.subscription_tier
    });

  } catch (error) {
    console.error('Error verifying session:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to verify payment'
      },
      { status: 500 }
    );
  }
}
