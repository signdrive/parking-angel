export type PlanId = 'free' | 'basic' | 'premium' | 'enterprise';

export interface PlanFeatures {
  items: string[];
  details: PlanFeature[];
}

export interface PlanFeature {
  name: string;
  description: string;
  included: boolean;
}

export interface SubscriptionPlan {
  id: PlanId;
  name: string;
  description: string;
  price: number;
  stripePriceId: string;
  features: PlanFeatures;
  interval?: 'month' | 'year';
  currency?: string;
}

export interface SubscriptionState {
  isSubscribed: boolean;
  planId: PlanId | null;
  status: 'active' | 'canceled' | 'incomplete' | 'past_due' | 'trialing' | null;
  interval?: 'month' | 'year';
  currentPeriodEnd?: string | null;
}
