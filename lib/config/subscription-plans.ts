import { Plan } from '@/lib/types/subscription';

export const SUBSCRIPTION_PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Basic',
    description: 'Perfect for getting started',
    price: 0,
    stripePriceId: '', // Free plan doesn't need a Stripe price ID
    features: [
      {
        id: 'basic-spots',
        name: 'Basic Parking Spots',
        description: 'Access to basic parking spot information',
        included: true,
      },
      {
        id: 'predictions',
        name: 'Basic Predictions',
        description: 'Limited parking availability predictions',
        included: true,
      },
      {
        id: 'notifications',
        name: 'Basic Notifications',
        description: 'Essential parking alerts',
        included: true,
      },
      {
        id: 'advanced-features',
        name: 'Advanced Features',
        description: 'Access to premium features',
        included: false,
      },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Best for regular drivers',
    price: 9.99,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID!,
    recommended: true,
    features: [
      {
        id: 'premium-spots',
        name: 'Premium Parking Spots',
        description: 'Access to all parking spots',
        included: true,
      },
      {
        id: 'advanced-predictions',
        name: 'Advanced Predictions',
        description: 'AI-powered parking predictions',
        included: true,
      },
      {
        id: 'real-time',
        name: 'Real-time Updates',
        description: 'Live parking availability updates',
        included: true,
      },
      {
        id: 'priority-support',
        name: 'Priority Support',
        description: '24/7 priority customer support',
        included: true,
      },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For power users and businesses',
    price: 19.99,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!,
    features: [
      {
        id: 'everything-premium',
        name: 'Everything in Premium',
        description: 'All Premium features included',
        included: true,
      },
      {
        id: 'api-access',
        name: 'API Access',
        description: 'Access to our REST API',
        included: true,
      },
      {
        id: 'dedicated-support',
        name: 'Dedicated Support',
        description: 'Personal account manager',
        included: true,
      },
      {
        id: 'custom-features',
        name: 'Custom Features',
        description: 'Custom feature development',
        included: true,
      },
    ],
  },
];
