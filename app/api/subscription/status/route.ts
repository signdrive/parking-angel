import { NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/services/subscription-service';
import { getDirectServerClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const supabase = getDirectServerClient();
    const subscriptionService = new SubscriptionService(supabase);

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const subscription = await subscriptionService.getSubscription(session.user.id);
    
    return NextResponse.json({
      isSubscribed: !!subscription,
      planId: subscription?.metadata?.plan_id,
      status: subscription?.status,
      currentPeriodEnd: subscription?.current_period_end,
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
