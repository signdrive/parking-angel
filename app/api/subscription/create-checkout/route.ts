import { NextResponse } from 'next/server';
import { subscriptionService } from '@/lib/services/subscription-service';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { planId } = await req.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const returnUrl = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || '';
    const checkoutData = await subscriptionService.createCheckoutSession(
      user.id,
      planId,
      returnUrl
    );

    return NextResponse.json(checkoutData);
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new NextResponse('Error creating checkout session', { status: 500 });
  }
}
