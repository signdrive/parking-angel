import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerClient } from '@/lib/supabase/server-utils';

// Initialize Stripe with optimized settings
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
  timeout: 5000 // Add timeout to prevent long-hanging requests
});

// Define valid payment status types
type StripePaymentStatus = Stripe.Checkout.Session.PaymentStatus;
type StripePaymentIntentStatus = Stripe.PaymentIntent.Status;

// Map from Stripe price ID tiers to Supabase subscription_tier enum values
const TIER_MAPPING: Record<string, string> = {
  'navigator': 'premium',
  'pro_parker': 'pro',
  'fleet_manager': 'enterprise'
};

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ 
        success: false, 
        error: 'No session ID provided' 
      }, { status: 400 });
    }

    console.log(`[verify-session] Verifying session: ${sessionId}`);
    
    // Retrieve the session from Stripe - use Promise.all to parallelize operations
    const sessionPromise = stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer', 'payment_intent']
    });
    
    // Get the Supabase client in parallel
    const supabaseClientPromise = getServerClient();
    
    // Await both promises together
    const [session, supabaseClient] = await Promise.all([
      sessionPromise,
      supabaseClientPromise
    ]);

    if (!session) {
      return NextResponse.json({ 
        success: false, 
        error: 'Session not found' 
      }, { status: 404 });
    }

    // Log session details for debugging
    console.log('[verify-session] Session details:', {
      id: session.id,
      paymentStatus: session.payment_status,
      customerId: session.customer,
      userIdInMetadata: session.metadata?.userId,
      tierInMetadata: session.metadata?.tier,
      subscriptionStatus: (session.subscription as Stripe.Subscription)?.status
    });

    // For the first few retries, we don't need to verify the user
    // This helps when the webhook hasn't processed yet
    const retryCount = parseInt(searchParams.get('retry') || '0');
    
    // Check payment status
    const paymentStatus = session.payment_status as StripePaymentStatus;
    const paymentIntentStatus = (session.payment_intent as Stripe.PaymentIntent)?.status as StripePaymentIntentStatus;
    const subscriptionStatus = (session.subscription as Stripe.Subscription)?.status;

    // If payment is complete or subscription is active
    if (paymentStatus === 'paid' || 
        paymentIntentStatus === 'succeeded' ||
        paymentStatus === 'no_payment_required' ||
        subscriptionStatus === 'active') {
      
      let profileData = null;
      let profileError = null;
      let updatedManually = false;
      
      // Only check the database if we have a userId
      if (session.metadata?.userId) {
        // First try to query the current subscription status
        const result = await supabaseClient
          .from('profiles')
          .select('subscription_tier, subscription_status, updated_at')
          .eq('id', session.metadata.userId)
          .single();
          
        profileData = result.data;
        profileError = result.error;
        
        console.log('[verify-session] Database check:', {
          profile: profileData,
          error: profileError
        });

        const targetTier = TIER_MAPPING[session.metadata.tier as keyof typeof TIER_MAPPING] || session.metadata.tier;

        // If the profile exists but the plan is not yet updated, update it manually
        if (profileData && (profileData.subscription_tier !== targetTier || profileData.subscription_status !== 'active')) {
          console.log(`[verify-session] Webhook hasn't updated the plan yet. Manually updating for user ${session.metadata.userId}.`);
          
          const { error: updateError } = await supabaseClient
            .from('profiles')
            .update({
              subscription_tier: targetTier,
              subscription_status: 'active',
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              updated_at: new Date().toISOString(),
            })
            .eq('id', session.metadata.userId);

          if (updateError) {
            console.error(`[verify-session] Manual update failed for user ${session.metadata.userId}:`, updateError);
            // Don't block success, but log the error. The webhook should eventually fix it.
          } else {
            console.log(`[verify-session] Manual update successful for user ${session.metadata.userId}.`);
            updatedManually = true;
          }
        }
      }
      
      const duration = Date.now() - startTime;
      console.log(`[verify-session] Verification successful in ${duration}ms for session: ${sessionId}`);
      
      return NextResponse.json({ 
        success: true,
        updated: updatedManually,
        tier: session.metadata?.tier 
      });
    }

    // If payment is still pending after some time, it might be a slow process
    if (paymentStatus === 'unpaid' && retryCount > 2) {
      console.log(`[verify-session] Session is still unpaid after ${retryCount} retries: ${sessionId}`);
      return NextResponse.json({ 
        success: false, 
        error: 'Payment is still processing. Please wait a few more moments.' 
      }, { status: 202 }); // Accepted
    }

    // Otherwise, the payment is not yet confirmed
    const duration = Date.now() - startTime;
    console.log(`[verify-session] Payment not confirmed after ${duration}ms for session: ${sessionId}. Status: ${paymentStatus}`);
    return NextResponse.json({ 
      success: false, 
      error: 'Payment not confirmed yet.' 
    }, { status: 202 }); // Accepted, client should retry

  } catch (err: any) {
    const elapsed = Date.now() - startTime;
    console.error(`[verify-session] Error after ${elapsed}ms:`, {
      message: err.message,
      stack: err.stack?.substring(0, 200),
    });
    
    return NextResponse.json({
      success: false,
      error: err.message || 'Failed to verify session',
      elapsedMs: elapsed
    }, { status: 500 });
  }
}
