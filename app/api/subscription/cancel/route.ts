import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { subscriptionService } from '@/lib/services/subscription-service';

export async function POST(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await subscriptionService.cancelSubscription(user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return new NextResponse('Error canceling subscription', { status: 500 });
  }
}
