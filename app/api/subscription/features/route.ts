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
    if (!subscription) {
      return NextResponse.json({});
    }

    const features = await subscriptionService.getPlanFeatures(subscription.metadata.plan_id);
    return NextResponse.json(features);
  } catch (error) {
    console.error('Error fetching subscription features:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
