/**
 * Re-export database types to maintain backward compatibility
 * while consolidating our types in one place
 */
import type { Database } from './database';

export type { Database };
export type { Json } from './database';

export type Tables = Database['public']['Tables'];
export type Schema = Database['public'];

// Export specific table types for convenience
export type UserSubscription = Tables['user_subscriptions']['Row'];
export type ParkingSpot = Tables['parking_spots']['Row'];
export type Profile = Tables['profiles']['Row'];
export type NotificationToken = Tables['notification_tokens']['Row'];
export type SpotReport = Tables['spot_reports']['Row'];
export type SpotHold = Tables['spot_holds']['Row'];

// Export enums and custom types
export type SubscriptionStatus = 'trialing' | 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid' | 'paused';
export type SpotStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';
