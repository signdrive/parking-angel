export const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator',
  SUSPENDED: 'suspended'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export const SubscriptionTier = {
  FREE: 'free',
  BASIC: 'basic',
  PRO: 'pro',
  ENTERPRISE: 'enterprise'
} as const;

export type SubscriptionTier = typeof SubscriptionTier[keyof typeof SubscriptionTier];

export const SubscriptionStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  TRIAL: 'trial',
  CANCELLED: 'cancelled',
  PAST_DUE: 'past_due',
  FREE: 'free'
} as const;

export const subscriptionStatusMap = {
  [SubscriptionStatus.ACTIVE]: { label: 'Active', variant: 'default' as const },
  [SubscriptionStatus.INACTIVE]: { label: 'Inactive', variant: 'secondary' as const },
  [SubscriptionStatus.TRIAL]: { label: 'Trial', variant: 'warning' as const },
  [SubscriptionStatus.CANCELLED]: { label: 'Cancelled', variant: 'destructive' as const },
  [SubscriptionStatus.PAST_DUE]: { label: 'Past Due', variant: 'destructive' as const },
  [SubscriptionStatus.FREE]: { label: 'Free', variant: 'secondary' as const },
};

export type SubscriptionStatus = typeof SubscriptionStatus[keyof typeof SubscriptionStatus];
