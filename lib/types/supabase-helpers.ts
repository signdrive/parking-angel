import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Stripe } from 'stripe';
import type { Database } from './database';

// Type for the Supabase client with our database type
export type TypedSupabaseClient = SupabaseClient<Database>;

// Define table helpers
export type Tables = Database['public']['Tables'];
export type TableName = keyof Tables;
export type TablesInsert<T extends TableName> = Tables[T]['Row'];
export type TablesRow<T extends TableName> = Tables[T]['Row'];
export type TablesUpdate<T extends TableName> = Partial<Tables[T]['Row']>;

// Common table row types
export type Profile = TablesRow<'profiles'> & {
  full_name?: string | null;
  role?: string | null;
  status?: string | null;
};

export type ParkingSpot = TablesRow<'parking_spots'> & {
  name: string;
  spot_type: string | null;
  is_available: boolean;
  confidence_score: number | null;
};

export type UserSubscription = TablesRow<'user_subscriptions'>;
export type SpotHold = TablesRow<'spot_holds'>;

// Subscription types
export type SubscriptionTier = 'free' | 'premium' | 'enterprise';
export type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid';

// Subscription with Stripe metadata
export type StripeSubscriptionWithMetadata = Stripe.Subscription & {
  metadata: Database['public']['Tables']['user_subscriptions']['Row'];
  current_period_end?: string;
};

// Helper types for parking spots
export type ParkingSpotStatus = 'available' | 'occupied' | 'reserved';
export type SpotLocation = Pick<ParkingSpot, 'latitude' | 'longitude'>;

// Subscription features and options
export interface SubscriptionFeatures {
  maxSpots: number;
  allowMultipleHolds: boolean;
  hasAnalytics: boolean;
  hasAlerts: boolean;
  items: {
    name: string;
    description: string;
    included: boolean;
  }[];
}

export interface CheckoutOptions {
  planId: string;
  successUrl?: string;
  cancelUrl?: string;
  trial?: boolean;
}

export interface SubscriptionState {
  isActive: boolean;
  isPremium: boolean;
  hasFeatures: boolean;
  isSubscribed: boolean;
  subscription: StripeSubscriptionWithMetadata | null;
  features: SubscriptionFeatures;
  status: SubscriptionStatus;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd?: string;
  error: Error | null;
}

// Type guard functions
export function isValidSubscriptionTier(tier: string | null): tier is SubscriptionTier {
  return tier !== null && ['free', 'premium', 'enterprise'].includes(tier);
}

export function isValidSubscriptionStatus(status: string | null): status is SubscriptionStatus {
  return status !== null && [
    'active',
    'trialing',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'past_due',
    'unpaid'
  ].includes(status);
}

export function isValidSpotStatus(status: string): status is ParkingSpotStatus {
  return ['available', 'occupied', 'reserved'].includes(status);
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  subscription: StripeSubscriptionWithMetadata | null;
  isSubscribed: boolean;
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  error: Error | null;
}

// Database response types
export interface DatabaseError {
  code: string;
  message: string;
  details?: string;
}

// Helper type for database query responses
export interface DatabaseResponse<T> {
  data: T | null;
  error: DatabaseError | null;
}

// Enum types for database
export interface DatabaseEnums {
  subscription_status: SubscriptionStatus;
  spot_status: ParkingSpotStatus;
}
