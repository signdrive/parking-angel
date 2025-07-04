import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { subscriptionService } from '@/lib/services/subscription-service';

export async function GET(req: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const features = await subscriptionService.getSubscriptionFeatures(user.id);
    return NextResponse.json(features);
  } catch (error) {
    console.error('Error fetching subscription features:', error);
    return new NextResponse('Error fetching subscription features', { status: 500 });
  }
}
