import { NextRequest, NextResponse } from "next/server";
import { SubscriptionService } from '@/lib/services/subscription-service';
import { getDirectServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = getDirectServerClient();
    const subscriptionService = new SubscriptionService(supabase);
    const { userId, priceId } = await req.json();

    const session = await subscriptionService.createCheckoutSession({
      userId,
      priceId,
      successUrl: `${new URL(req.url).origin}/payment-success`,
      cancelUrl: `${new URL(req.url).origin}/subscription?canceled=true`
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new NextResponse('Error creating checkout session', { status: 500 });
  }
}
