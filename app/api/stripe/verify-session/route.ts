import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../../lib/config/stripe';
import { SubscriptionService } from '@/lib/services/subscription-service';
import { getDirectServerClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = getDirectServerClient();
    const subscriptionService = new SubscriptionService(supabase);
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // If this was a subscription checkout
    if (session.mode === 'subscription' && session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      await subscriptionService.updateSubscriptionStatus(
        subscription.customer as string,
        subscription.status as any
      );
    }

    return Response.json({ success: true });
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
