import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../../lib/config/stripe';
import { createServiceClient } from '@/lib/supabase/server';

// Plan mapping from Stripe price IDs
const PRICE_TO_PLAN_MAPPING: Record<string, string> = {
  [process.env.NEXT_PUBLIC_STRIPE_NAVIGATOR_PRICE_ID!]: 'premium',
  [process.env.NEXT_PUBLIC_STRIPE_PRO_PARKER_PRICE_ID!]: 'pro',
  [process.env.NEXT_PUBLIC_STRIPE_FLEET_MANAGER_PRICE_ID!]: 'enterprise',
};

export async function POST(req: Request) {
  try {
    const supabase = createServiceClient();
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'subscription.items.data.price']
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    const userId = session.metadata?.userId;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found in session' },
        { status: 400 }
      );
    }

    // If this was a subscription checkout
    if (session.mode === 'subscription' && session.subscription) {
      const subscription = session.subscription as any;
      
      // Get the plan from the price ID
      let planId = 'free';
      if (subscription.items?.data?.length > 0) {
        const priceId = subscription.items.data[0].price.id;
        planId = PRICE_TO_PLAN_MAPPING[priceId] || 'premium';
      }

      // Get user email from profile if not in session
      let userEmail = session.customer_email;
      if (!userEmail) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', userId)
          .single();
        userEmail = profile?.email;
      }

      // Get payment amount from session
      const amount = session.amount_total ? session.amount_total / 100 : null; // Convert from cents

      console.log('Payment verification data:', {
        userId,
        planId,
        status: subscription.status,
        email: userEmail,
        amount,
        customerId: session.customer
      });

      try {
        // Use the new function that handles both subscription and profile sync
        const { data: functionResult, error: functionError } = await supabase.rpc(
          'handle_subscription_update_with_profile_sync', 
          {
            p_user_id: userId,
            p_stripe_customer_id: session.customer as string,
            p_stripe_subscription_id: subscription.id,
            p_plan_id: planId,
            p_status: subscription.status,
            p_trial_end: subscription.trial_end 
              ? new Date(subscription.trial_end * 1000).toISOString() 
              : null,
            p_current_period_end: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : null,
            p_email: userEmail,
            p_amount: amount
          }
        );

        if (functionError) {
          console.error('Error calling subscription sync function:', functionError);
          
          // Fallback to direct table updates if function fails
          const { error: subError } = await supabase
            .from('user_subscriptions')
            .upsert({
              user_id: userId,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscription.id,
              plan_id: planId,
              status: subscription.status,
              trial_end: subscription.trial_end 
                ? new Date(subscription.trial_end * 1000).toISOString() 
                : null,
              current_period_end: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000).toISOString()
                : null,
              email: userEmail,
              amount: amount,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            });

          if (subError) {
            console.error('Error updating subscription:', subError);
            throw subError;
          }

          // Update user profile using the correct field names
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              subscription_plan: planId,
              subscription_status: subscription.status,
              subscription_tier: planId, // Also update the tier field
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);

          if (profileError) {
            console.error('Error updating profile:', profileError);
            // Don't throw here, subscription update was successful
          }
        } else {
          console.log('Subscription and profile sync successful:', functionResult);
        }
      } catch (error) {
        console.error('Error in subscription update:', error);
        throw error;
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error verifying session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
