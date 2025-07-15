import { NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/services/subscription-service';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Create Supabase client with the auth token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );

    const subscriptionService = new SubscriptionService(supabase);

    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const subscription = await subscriptionService.getSubscription(user.id);
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
