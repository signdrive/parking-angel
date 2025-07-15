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
    
    // Return subscription features based on plan
    const features = {
      hasActiveSubscription: !!subscription,
      canAccessPremiumFeatures: !!subscription && subscription.status === 'active',
      planType: subscription?.metadata?.plan_id || 'free',
      maxParkingSpots: subscription ? 100 : 10,
      hasAIFeatures: !!subscription,
    };
    
    return NextResponse.json(features);
  } catch (error) {
    console.error('Error fetching subscription features:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
