import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server-utils';
import { APIError, handleAPIError } from '@/lib/api-error';
import type { Database } from '@/lib/types/supabase';
import Stripe from 'stripe';

type SubscriptionTier = Database['public']['Enums']['subscription_tier'];

// Initialize Stripe with optimized settings
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
  timeout: 5000 // Add timeout to prevent long-hanging requests
});

// Map from Stripe price ID tiers to Supabase subscription_tier enum values
const TIER_MAPPING: Record<string, SubscriptionTier> = {
  'navigator': 'premium',
  'pro_parker': 'pro',
  'fleet_manager': 'enterprise'
};

export async function POST(req: Request) {
  const startTime = Date.now();
  
  try {
    // Parse the request body first
    const body = await req.text();
    const headerList = await headers();
    const signature = headerList.get('stripe-signature');
    
    // Prepare some reusable function-level variables
    let userId: string | undefined;
    let eventId: string | undefined;
    let eventType: string | undefined;
    
    if (!signature) {
      throw new APIError('No Stripe signature found', 400, 'missing_signature');
    }

    // Verify and construct the event
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
      
      // Store these values for logging context
      eventId = event.id;
      eventType = event.type;
    } catch (err) {
      throw new APIError('Signature verification failed', 400, 'invalid_signature');
    }

    // Initialize Supabase client early to detect connection issues
    const supabase = await getServerClient();
    
    // Process the event based on its type
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        userId = session.metadata?.userId;
        const tier = session.metadata?.tier;

        if (!userId) {
          throw new APIError('No user ID in session metadata', 400, 'missing_user_id');
        }

        // Map the tier from Stripe to the subscription_tier enum in the database
        // Use a safe default if tier is missing
        const subscriptionTier = tier ? (TIER_MAPPING[tier] || 'premium') : 'premium';

        try {
          // Check if profile exists before attempting update
          const { data: existingProfile, error: profileCheckError } = await supabase
            .from('profiles')
            .select('id, subscription_tier, subscription_status')
            .eq('id', userId)
            .single();
            
          if (profileCheckError) {
            // This is not a fatal error, as the user might be new.
            // We can proceed with the upsert.
          }

          // Prepare update data
          const updateData = {
            updated_at: new Date().toISOString(),
            stripe_customer_id: customerId,
            subscription_status: 'active',
            subscription_tier: subscriptionTier
          };

          // Try the update with multiple retries
          let updateError = null;
          let updateResult = null;

          for (let attempt = 0; attempt < 3; attempt++) {
            // Use select() after update to verify changes
            const result = await supabase
              .from('profiles')
              .update(updateData)
              .eq('id', userId)
              .select('id, subscription_tier, subscription_status')
              .single();
            
            updateError = result.error;
            updateResult = result.data;
            
            if (!updateError) {
              break; // Success, exit retry loop
            }
            
            // Short delay before retry
            if (attempt < 2) await new Promise(r => setTimeout(r, 300));
          }

          if (updateError) {
            // Log error to the events table
            await supabase.from('subscription_events').insert({
              user_id: userId,
              event_type: 'update_error',
              tier: tier || 'unknown',
              stripe_event_id: event.id,
              event_data: {
                error: updateError,
                updateData,
                timestamp: new Date().toISOString(),
                elapsed: Date.now() - startTime
              }
            });

            // Try a fallback update with direct field updates only
            const { error: fallbackError, data: fallbackData } = await supabase
              .from('profiles')
              .update({
                stripe_customer_id: customerId,
                subscription_status: 'active',
                subscription_tier: subscriptionTier,
                updated_at: new Date().toISOString()
              })
              .eq('id', userId)
              .select('id, subscription_tier, subscription_status');

            if (fallbackError) {
              // Last resort: try updating only the essential fields
              const { error: lastResortError, data: lastResortData } = await supabase
                .from('profiles')
                .update({ 
                  subscription_status: 'active',
                  subscription_tier: subscriptionTier 
                })
                .eq('id', userId)
                .select('id, subscription_tier, subscription_status');
                
              if (lastResortError) {
                throw new APIError('Failed to update subscription status', 500, 'update_failed');
              } else {
                updateResult = lastResortData;
              }
            } else {
              updateResult = fallbackData;
            }
          }

          // Log successful update to the events table
          await supabase.from('subscription_events').insert({
            user_id: userId,
            event_type: 'subscription_active',
            tier: tier || 'unknown',
            stripe_event_id: event.id,
            event_data: {
              stripeCustomerId: customerId,
              subscriptionTier: subscriptionTier,
              timestamp: new Date().toISOString(),
              elapsed: Date.now() - startTime,
              result: updateResult
            }
          });
          
        } catch (updateException) {
          throw new APIError('Failed to update subscription status', 500, 'update_failed');
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { error: userError, data: userData } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (userError || !userData) {
          throw new APIError('User not found', 404, 'user_not_found');
        }

        userId = userData.id;

        // Reset subscription status
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'inactive',
            subscription_tier: 'free',
            updated_at: new Date().toISOString()
          })
          .eq('id', userData.id);

        if (updateError) {
          throw new APIError('Failed to update subscription status', 500, 'update_failed');
        }
        break;
      }
      default:
        // Do nothing for unhandled events
        break;
    }

    const totalTime = Date.now() - startTime;

    return NextResponse.json({ 
      received: true,
      processedIn: totalTime,
      eventType: eventType,
      eventId: eventId,
      userId: userId
    });
  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    
    // Enhanced error logging with more context
    console.error('[Webhook] Handler error:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack,
      details: error.details || 'No additional details',
      processedIn: totalTime
    });
    
    // Log an event to subscription_events table to track failures
    try {
      const supabase = await getServerClient();
      await supabase.from('subscription_events').insert({
        user_id: 'system', // Use a special ID for system events
        event_type: 'webhook_error',
        tier: 'system',
        stripe_event_id: `error_${Date.now()}`,
        event_data: {
          error: error.message,
          timestamp: new Date().toISOString(),
          errorDetails: {
            code: error.code,
            name: error.name
          },
          processedIn: totalTime
        }
      });
    } catch (logError) {
      console.error('[Webhook] Failed to log error to database:', logError);
    }
    
    return handleAPIError(error);
  }
}
