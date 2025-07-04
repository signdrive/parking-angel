import { SubscriptionPlan } from '../types/subscription';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Basic parking finder features',
    price: 0,
    stripePriceId: '',
    features: {
      items: [
        'Basic parking spot search',
        'Limited spot updates',
        'Standard support',
      ],
      details: [
        {
          name: 'Parking Spot Search',
          description: 'Basic search functionality',
          included: true,
        },
        {
          name: 'Spot Updates',
          description: 'Limited to 10 updates per day',
          included: true,
        },
        {
          name: 'Support',
          description: 'Standard email support',
          included: true,
        },
      ],
    },
  },
  {
    id: 'basic',
    name: 'Basic',
    description: 'Enhanced parking features for regular users',
    price: 9.99,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID || '',
    features: {
      items: [
        'All Free features',
        'Real-time parking updates',
        'Parking history',
        'Priority support',
      ],
      details: [
        {
          name: 'Real-time Updates',
          description: 'Get instant parking spot updates',
          included: true,
        },
        {
          name: 'Parking History',
          description: 'View your parking history',
          included: true,
        },
        {
          name: 'Priority Support',
          description: 'Get faster support response',
          included: true,
        },
      ],
    },
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Advanced features for power users',
    price: 19.99,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID || '',
    features: {
      items: [
        'All Basic features',
        'AI parking predictions',
        'Reserved spots',
        'Premium support',
      ],
      details: [
        {
          name: 'AI Predictions',
          description: 'Smart parking availability predictions',
          included: true,
        },
        {
          name: 'Reserved Spots',
          description: 'Reserve parking spots in advance',
          included: true,
        },
        {
          name: 'Premium Support',
          description: '24/7 premium support',
          included: true,
        },
      ],
    },
  },
];
