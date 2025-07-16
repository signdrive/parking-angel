import { NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/services/subscription-service';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
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
    
    // Debug logging
    console.log('🔍 Subscription data from service:', subscription);
    
    // Handle both database record and Stripe subscription object
    let planId: string | undefined;
    let status: string | undefined;
    let currentPeriodEnd: string | undefined;
    
    if (subscription) {
      // If it's a database record (has plan_id field)
      if ('plan_id' in subscription) {
        planId = subscription.plan_id;
        status = subscription.status;
        currentPeriodEnd = subscription.current_period_end;
      } 
      // If it's a Stripe subscription object (has metadata)
      else if ('metadata' in subscription) {
        planId = subscription.metadata?.plan_id;
        status = subscription.status;
        currentPeriodEnd = subscription.current_period_end;
      }
      // If it's a mixed object with metadata property
      else if (subscription.metadata) {
        planId = subscription.metadata.plan_id;
        status = subscription.metadata.status;
        currentPeriodEnd = subscription.metadata.current_period_end;
      }
    }
    
    const result = {
      isSubscribed: !!subscription,
      planId: planId || 'free',
      status: status || 'inactive',
      currentPeriodEnd: currentPeriodEnd,
    };
    
    console.log('📤 API response:', result);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
