import { createClient } from '@supabase/supabase-js';
import { stripe } from '../config/stripe';
import { Database } from '../types/supabase';
import { StripeSubscriptionWithMetadata, SubscriptionStatus } from '../types/stripe-types';
import { PlanFeatures, SubscriptionPlan } from '../types/subscription';
import { SUBSCRIPTION_PLANS } from '../config/subscription-plans';
import type Stripe from 'stripe';

export class SubscriptionService {
  private supabase;

  constructor() {
    this.supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  async createCheckoutSession(userId: string, planId: string, returnUrl: string) {
    try {
      const plan = SUBSCRIPTION_PLANS.find((p: SubscriptionPlan) => p.id === planId);
      if (!plan) {
        throw new Error(`Invalid plan selected: ${planId}`);
      }

      const { data: { user }, error: authError } = await this.supabase.auth.getUser();
      if (authError || !user) {
        throw new Error(authError?.message || 'User not authenticated');
      }

      const session = await stripe.checkout.sessions.create({
        customer_email: user.email,
        billing_address_collection: 'required',
        line_items: [
          {
            price: plan.stripePriceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${returnUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${returnUrl}/plans`,
        metadata: {
          user_id: userId,
          plan_id: planId,
        },
      });

      return { url: session.url, sessionId: session.id };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  async verifySubscriptionStatus(userId: string) {
    try {
      const { data: subscription, error } = await this.supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      if (!subscription) {
        return { isSubscribed: false };
      }

      const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
      const currentPeriodEnd = new Date((stripeSubscription as any).current_period_end * 1000);
      
      return {
        isSubscribed: stripeSubscription.status === 'active',
        planId: subscription.plan_id,
        status: stripeSubscription.status as SubscriptionStatus,
        currentPeriodEnd,
      };
    } catch (error) {
      console.error('Error verifying subscription:', error);
      throw new Error('Failed to verify subscription status');
    }
  }

  async handleSubscriptionUpdated(subscription: StripeSubscriptionWithMetadata) {
    const { user_id, plan_id } = subscription.metadata;

    try {
      const { error } = await this.supabase
        .from('user_subscriptions')
        .upsert({
          user_id,
          plan_id,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        });

      if (error) throw error;

      await this.supabase
        .from('profiles')
        .update({
          subscription_status: subscription.status,
          subscription_plan: plan_id,
        })
        .eq('id', user_id);

    } catch (error) {
      console.error('Error updating subscription:', error);
      throw new Error('Failed to update subscription information');
    }
  }

  async cancelSubscription(userId: string) {
    try {
      const { data: subscription } = await this.supabase
        .from('user_subscriptions')
        .select('stripe_subscription_id')
        .eq('user_id', userId)
        .single();

      if (!subscription) throw new Error('No active subscription found');

      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true,
      });

      await this.supabase
        .from('user_subscriptions')
        .update({ cancel_at_period_end: true })
        .eq('user_id', userId);

      return { success: true };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  async getSubscriptionFeatures(userId: string): Promise<PlanFeatures | null> {
    try {
      const { data: subscription } = await this.supabase
        .from('user_subscriptions')
        .select('plan_id')
        .eq('user_id', userId)
        .single();

      if (!subscription) return null;

      const plan = SUBSCRIPTION_PLANS.find((p: SubscriptionPlan) => p.id === subscription.plan_id);
      return plan?.features || null;
    } catch (error) {
      console.error('Error fetching subscription features:', error);
      return null;
    }
  }
}

export const subscriptionService = new SubscriptionService();
