import { Json } from './supabase';

export type PlanType = 'free' | 'basic' | 'premium' | 'enterprise' | 'navigator' | 'pro_parker' | 'fleet_manager';
export type SubscriptionStatus = 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';

export interface StripeMetadata {
  userId?: string;
  supabaseUuid?: string;
  tier?: string;
}

export interface UserSubscriptionRecord {
  user_id: string;
  stripe_subscription_id?: string;
  plan_id: PlanType;
  status: SubscriptionStatus;
  updated_at: string;
}

export interface SubscriptionEventRecord {
  user_id: string;
  event_type: string;
  tier: PlanType;
  stripe_event_id: string;
  subscription_id?: string;
  event_data: Json;
}
