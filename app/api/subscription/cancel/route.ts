import { NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/services/subscription-service';
import { getDirectServerClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = getDirectServerClient();
    const subscriptionService = new SubscriptionService(supabase);

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const subscription = await subscriptionService.getSubscription(session.user.id);
    if (!subscription) {
      return new NextResponse('No active subscription found', { status: 404 });
    }

    await subscriptionService.cancelSubscription(subscription.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
