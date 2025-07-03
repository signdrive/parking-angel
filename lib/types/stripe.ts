import Stripe from 'stripe';

export interface StripeSubscriptionWithMetadata extends Stripe.Subscription {
  metadata: {
    user_id: string;
    plan_id: string;
  };
  current_period_end: number;
}

export interface StripeInvoiceWithSubscription extends Stripe.Invoice {
  subscription: string;
}

export type SubscriptionStatus = 
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid';
