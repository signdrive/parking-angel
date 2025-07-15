import { NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/services/subscription-service';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        status: 'error',
        message: 'Not authenticated',
        isSubscribed: false,
      });
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
    
    if (!user || error) {
      return NextResponse.json({
        status: 'error',
        message: 'Not authenticated',
        isSubscribed: false,
      });
    }

    const subscription = await subscriptionService.getSubscription(user.id);
    
    return NextResponse.json({
      status: 'success',
      isSubscribed: !!subscription,
      subscription: subscription ? {
        status: subscription.status,
        planId: subscription.metadata?.plan_id,
        currentPeriodEnd: subscription.current_period_end,
      } : null,
      userId: user.id,
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
