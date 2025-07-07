import { TypedSupabaseClient } from '../types/supabase-helpers';
import { Stripe } from 'stripe';
import { APIError } from '../api-error';

// Latest supported API version
export const STRIPE_API_VERSION = '2025-06-30.basil' as const;

export type PlanId = 'free' | 'premium' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'incomplete' | 'incomplete_expired' | 'active' | 'past_due' | 'canceled' | 'trialing' | 'unpaid';

// Map from Stripe price IDs to subscription plans
const PLAN_MAPPING: Record<string, PlanId> = {
  'price_navigator': 'premium',
  'price_pro_parker': 'pro',
  'price_fleet_manager': 'enterprise',
  // Real Stripe price IDs
  'price_1RdXHnKFfjGfLUIXYKCIZiJ4': 'premium',
  'price_1RdXJgKFfjGfLUIXqjacyvNE': 'pro',
  'price_1RdXLYKFfjGfLUIXhkNi0b9c': 'enterprise'
};

// For development/testing, also accept the full price IDs
function getPlanFromPrice(priceId: string): PlanId | undefined {
  // Try direct mapping first
  if (priceId in PLAN_MAPPING) {
    return PLAN_MAPPING[priceId];
  }

  // Try extracting the last part of the price ID (after 'price_')
  const priceSuffix = priceId.split('_').slice(1).join('_').toLowerCase();
  for (const [key, value] of Object.entries(PLAN_MAPPING)) {
    if (key.toLowerCase().includes(priceSuffix) || priceSuffix.includes(key.toLowerCase())) {
      return value;
    }
  }

  // As a fallback, check if the full price ID contains any of our plan names
  for (const [, plan] of Object.entries(PLAN_MAPPING)) {
    if (priceId.toLowerCase().includes(plan.toLowerCase())) {
      return plan;
    }
  }

  return undefined;
}

export interface SubscriptionFeatures {
  maxSpots: number;
  allowMultipleHolds: boolean;
  hasAnalytics: boolean;
  hasAlerts: boolean;
  items: Array<{
    name: string;
    description: string;
    included: boolean;
  }>;
}

export class SubscriptionService {
  private client: TypedSupabaseClient;
  private stripe: Stripe;

  constructor(client: TypedSupabaseClient) {
    this.client = client;
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: STRIPE_API_VERSION
    });
  }

  private async updateSubscriptionData(subscription: Stripe.Subscription): Promise<void> {
    // First get the customer to access metadata
    const customer = await this.stripe.customers.retrieve(subscription.customer as string);

    if (!('metadata' in customer)) {
      throw new APIError('Customer has been deleted', 400, 'customer_not_found');
    }

    let actualUserId = customer.metadata.supabaseUuid;
    if (!actualUserId) {
      // Try to find user by stripe_customer_id in user_subscriptions
      const { data: subscriptions } = await this.client
        .from('user_subscriptions')
        .select('user_id')
        .eq('stripe_customer_id', customer.id)
        .limit(1);

      if (!subscriptions || subscriptions.length === 0) {
        throw new APIError('No Supabase user ID found', 400, 'user_not_found');
      }
      actualUserId = subscriptions[0].user_id;
    }

    let plan: PlanId | undefined;

    if (subscription.items.data?.length > 0) {
      for (const item of subscription.items.data) {
        if (item.price) {
          const priceId = typeof item.price === 'string' ? item.price : item.price.id;
          if (priceId) {
            // Try to determine plan from price ID
            plan = getPlanFromPrice(priceId);
            if (plan) break;

            // If not found by ID, try the price nickname
            if (typeof item.price !== 'string' && item.price.nickname) {
              const nickname = item.price.nickname.toLowerCase();
              for (const [key, value] of Object.entries(PLAN_MAPPING)) {
                if (nickname.includes(key.toLowerCase()) || 
                    nickname.includes(value.toLowerCase())) {
                  plan = value;
                  break;
                }
              }
              if (plan) break;
            }
          }
        }
      }
    }

    // Debug output if plan not found
    if (!plan) {
      console.warn('Price details:', JSON.stringify(subscription.items.data, null, 2));
      throw new APIError('Could not determine subscription plan', 400, 'invalid_price');
    }

    // Update the subscription record
    const { error: subscriptionError } = await this.client
      .from('user_subscriptions')
      .upsert({
        user_id: actualUserId,
        stripe_customer_id: customer.id,
        stripe_subscription_id: subscription.id,
        plan_id: plan,
        status: subscription.status as SubscriptionStatus,
        trial_end: subscription.trial_end 
          ? new Date(subscription.trial_end * 1000).toISOString() 
          : null,
        current_period_end: (subscription as any).current_period_end
          ? new Date((subscription as any).current_period_end * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      });

    if (subscriptionError) {
      console.error('Database error details:', subscriptionError);
      throw new APIError(`Error updating subscription: ${subscriptionError.message}`, 500, 'db_error');
    }
  }

  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.updateSubscriptionData(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customer = await this.stripe.customers.retrieve(subscription.customer as string);
        
        if (!('metadata' in customer)) {
          throw new APIError('Customer has been deleted', 400, 'customer_not_found');
        }

        // Update subscription status to canceled
        const { error } = await this.client
          .from('user_subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          throw new APIError('Error updating subscription', 500, 'db_error');
        }
        break;
      }
    }
  }

  async getSubscription(userId: string) {
    const { data, error } = await this.client
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;

    try {
      const subscription = await this.stripe.subscriptions.retrieve(data.stripe_subscription_id);
      return {
        ...subscription,
        metadata: data
      };
    } catch (error) {
      console.error('Error fetching Stripe subscription:', error);
      return data;
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    const subscription = await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    await this.client
      .from('user_subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscriptionId);

    return subscription;
  }

  async createCheckoutSession(options: {
    userId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    trial?: boolean;
  }): Promise<{ url: string }> {
    const session = await this.stripe.checkout.sessions.create({
      customer_email: options.userId,
      client_reference_id: options.userId,
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: options.priceId, quantity: 1 }],
      subscription_data: options.trial ? {
        trial_period_days: 14
      } : undefined,
      metadata: {
        supabaseUuid: options.userId
      }
    });

    return { url: session.url! };
  }

  async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const clientRefId = session.client_reference_id;
    
    if (!clientRefId) {
      throw new APIError('No user ID in session', 400, 'missing_user_id');
    }

    // Get the price from the line items
    const lineItems = await this.stripe.checkout.sessions.listLineItems(session.id, {
      expand: ['data.price']
    });

    const priceData = lineItems.data[0]?.price;
    if (!priceData) {
      throw new APIError('No price data found', 400, 'missing_price_data');
    }

    // Get plan from price ID
    const plan = Object.entries(PLAN_MAPPING).find(([key]) => 
      priceData.id.includes(key.toLowerCase())
    )?.[1];

    if (!plan) {
      throw new APIError('Invalid price ID', 400, 'invalid_price_id');
    }

    // Update the user's subscription
    const { error: updateError } = await this.client
      .from('user_subscriptions')
      .upsert({
        user_id: clientRefId,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        plan_id: plan,
        status: 'active',
        current_period_end: null, // Will be updated by webhook
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (updateError) {
      throw new APIError('Error updating subscription', 500, 'db_error');
    }
  }

  async getPlanFeatures(planId: string): Promise<SubscriptionFeatures> {
    const product = await this.stripe.products.retrieve(planId);
    return {
      maxSpots: parseInt(product.metadata?.maxSpots || '5', 10),
      allowMultipleHolds: product.metadata?.allowMultipleHolds === 'true',
      hasAnalytics: product.metadata?.hasAnalytics === 'true',
      hasAlerts: product.metadata?.hasAlerts === 'true',
      items: [
        {
          name: 'Multiple Spot Holds',
          description: 'Hold multiple parking spots simultaneously',
          included: product.metadata?.allowMultipleHolds === 'true'
        },
        {
          name: 'Analytics Dashboard',
          description: 'Access detailed parking analytics',
          included: product.metadata?.hasAnalytics === 'true'
        },
        {
          name: 'Smart Alerts',
          description: 'Receive intelligent parking notifications',
          included: product.metadata?.hasAlerts === 'true'
        }
      ]
    };
  }

  async updateSubscriptionStatus(userId: string, status: SubscriptionStatus): Promise<void> {
    const { error } = await this.client
      .from('user_subscriptions')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      throw new APIError('Error updating subscription status', 500, 'db_error');
    }
  }
}

