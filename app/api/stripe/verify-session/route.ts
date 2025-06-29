import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getUser } from '@/lib/server-auth';
import { getServerClient } from '@/lib/supabase/server-utils';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil'
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
    
    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer', 'payment_intent']
    });

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
      
      // Only check the database if we have a userId
      if (session.metadata?.userId) {
        // Get the Supabase client
        const supabaseClient = await getServerClient();
        
        // Get user's subscription status from the database
        const result = await supabaseClient
          .from('profiles')
          .select('subscription_tier, subscription_status, updated_at')
          .eq('id', session.metadata.userId)
          .single();
          
        profileData = result.data;
        profileError = result.error;
        
        console.log('[verify-session] Database check:', {
          userId: session.metadata.userId,
          profileData,
          error: profileError
        });
        
        // If the webhook hasn't updated the database yet but the payment is successful,
        // let's update the profile here as a fallback
        if ((!profileData?.subscription_tier || profileData.subscription_tier === 'free') && 
            retryCount > 5 && session.metadata?.tier) {
          
          console.log('[verify-session] Webhook may have failed, updating profile as fallback');
          
          const subscriptionTier = TIER_MAPPING[session.metadata.tier] || 'premium';
          
          const updateResult = await supabaseClient
            .from('profiles')
            .update({
              subscription_status: 'active',
              subscription_tier: subscriptionTier,
              stripe_customer_id: session.customer as string,
              updated_at: new Date().toISOString()
            })
            .eq('id', session.metadata.userId)
            .select('subscription_tier, subscription_status')
            .single();
          
          console.log('[verify-session] Fallback update result:', {
            data: updateResult.data,
            error: updateResult.error
          });
          
          if (!updateResult.error) {
            profileData = updateResult.data;
          }
          
          // Also log this event
          await supabaseClient.from('subscription_events').insert({
            user_id: session.metadata.userId,
            event_type: 'verify_session_fallback_update',
            tier: session.metadata.tier,
            stripe_event_id: session.id,
            event_data: {
              timestamp: new Date().toISOString(),
              retryCount,
              updatedTier: subscriptionTier
            }
          });
        }
      }
      
      console.log('[verify-session] Payment verified successfully:', {
        paymentStatus,
        paymentIntentStatus,
        subscriptionStatus,
        customerEmail: session.customer_email,
        tier: session.metadata?.tier,
        // Include the actual database state for debugging
        databaseState: profileError ? 'Error fetching profile' : profileData,
        userId: session.metadata?.userId
      });
      
      // Return success with the subscription info
      return NextResponse.json({
        success: true,
        customerEmail: session.customer_email || null,
        subscriptionTier: profileData?.subscription_tier || 
                          (session.metadata?.tier ? TIER_MAPPING[session.metadata.tier] : null) || 
                          session.metadata?.tier,
        databaseUpdated: !!profileData?.subscription_tier,
        sessionId: session.id
      });
    }

    // If still processing, return a retry status
    if (paymentStatus === 'unpaid' || 
        paymentIntentStatus === 'processing' || 
        retryCount < 10) {
      
      return NextResponse.json({ 
        success: false,
        shouldRetry: true,
        error: 'Payment is still processing',
        retryCount,
        paymentStatus,
        paymentIntentStatus
      }, { status: 202 });
    }

    // Handle other payment statuses
    return NextResponse.json({ 
      success: false, 
      error: `Payment status: ${paymentStatus}, Intent status: ${paymentIntentStatus}` 
    }, { status: 400 });

  } catch (error: any) {
    console.error('Verify session error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to verify session'
    }, { status: 500 });
  }
}
