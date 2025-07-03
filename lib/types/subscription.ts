export type SubscriptionTier = 'free' | 'premium' | 'pro' | 'enterprise';

export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
}

export interface Plan {
  id: SubscriptionTier;
  name: string;
  description: string;
  price: number;
  features: PlanFeature[];
  stripePriceId: string;
  recommended?: boolean;
}

export interface SubscriptionStatus {
  isActive: boolean;
  tier: SubscriptionTier;
  expiresAt?: string;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
  stripePriceId?: string;
  stripeSubscriptionId?: string;
}
