import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { subscriptionService } from '@/lib/services/subscription-service';

export async function POST(req: NextRequest) {
  try {
    const { planId, returnUrl } = await req.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const session = await subscriptionService.createCheckoutSession(
      user.id,
      planId,
      returnUrl
    );

    return NextResponse.json(session);
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new NextResponse('Error creating checkout session', { status: 500 });
  }
}
