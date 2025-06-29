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
          userId: session.metadata.userId,
          profileData,
          error: profileError,
          elapsed: Date.now() - startTime + 'ms'
        });
        
        // Check if the subscription status needs to be updated - handle multiple scenarios
        const needsUpdate = !profileData?.subscription_tier || 
                            profileData.subscription_tier === 'free' ||
                            profileData.subscription_status !== 'active';
                            
        // Update if needed and we have tier information
        if (needsUpdate && session.metadata?.tier) {
          console.log('[verify-session] Database needs update, performing immediate update');
          
          const subscriptionTier = TIER_MAPPING[session.metadata.tier] || 'premium';
          const stripeCustomerId = session.customer as string;
          
          // Prepare update data
          const updateData = {
            subscription_status: 'active',
            subscription_tier: subscriptionTier,
            stripe_customer_id: stripeCustomerId,
            updated_at: new Date().toISOString()
          };
          
          // Try the update with multiple retries
          let updateResult = null;
          
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              // Add slight delay between retries
              if (attempt > 0) {
                await new Promise(r => setTimeout(r, 300));
              }
              
              updateResult = await supabaseClient
                .from('profiles')
                .update(updateData)
                .eq('id', session.metadata.userId)
                .select('subscription_tier, subscription_status')
                .single();
                
              if (!updateResult.error) {
                break; // Success - exit retry loop
              }
              
              console.log(`[verify-session] Update attempt ${attempt + 1} failed:`, updateResult.error);
            } catch (e) {
              console.error(`[verify-session] Update attempt ${attempt + 1} exception:`, e);
            }
          }
          
          // Check if any attempt was successful
          if (updateResult && !updateResult.error) {
            profileData = updateResult.data;
            updatedManually = true;
            
            console.log('[verify-session] Update successful:', {
              subscriptionTier,
              userId: session.metadata.userId,
              elapsed: Date.now() - startTime + 'ms'
            });
          } else {
            // If all attempts failed, try a simpler update with just the essential fields
            console.log('[verify-session] All update attempts failed, trying minimal update');
            
            const minimalUpdate = await supabaseClient
              .from('profiles')
              .update({
                subscription_status: 'active',
                subscription_tier: subscriptionTier
              })
              .eq('id', session.metadata.userId)
              .select('subscription_tier, subscription_status')
              .single();
              
            if (!minimalUpdate.error) {
              profileData = minimalUpdate.data;
              updatedManually = true;
              console.log('[verify-session] Minimal update successful');
            } else {
              console.error('[verify-session] Even minimal update failed:', minimalUpdate.error);
            }
          }
          
          // Log this verification event
          await supabaseClient.from('subscription_events').insert({
            user_id: session.metadata.userId,
            event_type: 'verify_session_update',
            tier: session.metadata.tier,
            stripe_event_id: session.id,
            event_data: {
              timestamp: new Date().toISOString(),
              retryCount,
              updatedTier: TIER_MAPPING[session.metadata.tier] || 'premium',
              success: updatedManually,
              elapsedMs: Date.now() - startTime
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
        databaseState: profileError ? 'Error fetching profile' : profileData,
        userId: session.metadata?.userId,
        updatedManually,
        elapsed: Date.now() - startTime + 'ms'
      });
      
      // Return success with the subscription info
      return NextResponse.json({
        success: true,
        customerEmail: session.customer_email || null,
        subscriptionTier: profileData?.subscription_tier || 
                          (session.metadata?.tier ? TIER_MAPPING[session.metadata.tier] : null) || 
                          session.metadata?.tier,
        databaseUpdated: !!profileData?.subscription_tier || updatedManually,
        sessionId: session.id,
        manuallyUpdated: updatedManually,
        elapsedMs: Date.now() - startTime
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
        paymentIntentStatus,
        elapsedMs: Date.now() - startTime
      }, { status: 202 });
    }

    // Handle other payment statuses
    return NextResponse.json({ 
      success: false, 
      error: `Payment status: ${paymentStatus}, Intent status: ${paymentIntentStatus}`,
      elapsedMs: Date.now() - startTime
    }, { status: 400 });

  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    console.error(`[verify-session] Error after ${elapsed}ms:`, {
      message: error.message,
      stack: error.stack?.substring(0, 200),
    });
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to verify session',
      elapsedMs: elapsed
    }, { status: 500 });
  }
}
