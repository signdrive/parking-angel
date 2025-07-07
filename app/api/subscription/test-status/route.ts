import { NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/services/subscription-service';
import { getDirectServerClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const supabase = getDirectServerClient();
    const subscriptionService = new SubscriptionService(supabase);
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({
        status: 'error',
        message: 'Not authenticated',
        isSubscribed: false,
      });
    }

    const subscription = await subscriptionService.getSubscription(session.user.id);
    
    return NextResponse.json({
      status: 'success',
      isSubscribed: !!subscription,
      subscription: subscription ? {
        status: subscription.status,
        planId: subscription.metadata?.plan_id,
        currentPeriodEnd: subscription.current_period_end,
      } : null,
      userId: session.user.id,
    });
  } catch (error) {
    console.error('Error in test-status:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      isSubscribed: false,
    });
  }
}
