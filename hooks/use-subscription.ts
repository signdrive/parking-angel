"use client";

import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { 
  SubscriptionFeatures, 
  SubscriptionStatus, 
  CheckoutOptions, 
  Profile,
  UserSubscription,
  AuthContextType
} from '@/lib/types/supabase-helpers';

interface SubscriptionState {
  isActive: boolean;
  isPremium: boolean;
  hasFeatures: boolean;
  isSubscribed: boolean;
  subscription: UserSubscription | null;
  features: SubscriptionFeatures;
  status: SubscriptionStatus;
  cancelAtPeriodEnd: boolean;
  error: Error | null;
  isLoading: boolean;
  planId: string | null;
  currentPeriodEnd: string | null;
}

const DEFAULT_FEATURES: SubscriptionFeatures = {
  maxSpots: 5,
  allowMultipleHolds: false,
  hasAnalytics: false,
  hasAlerts: false,
  items: [
    {
      name: 'Multiple Spot Holds',
      description: 'Hold multiple parking spots simultaneously',
      included: false
    },
    {
      name: 'Analytics Dashboard',
      description: 'Access detailed parking analytics',
      included: false
    },
    {
      name: 'Smart Alerts',
      description: 'Receive intelligent parking notifications',
      included: false
    }
  ]
};

const initialState: SubscriptionState = {
  isActive: false,
  isPremium: false,
  hasFeatures: false,
  isSubscribed: false,
  subscription: null,
  features: DEFAULT_FEATURES,
  status: 'incomplete',
  cancelAtPeriodEnd: false,
  error: null,
  isLoading: true,
  planId: null,
  currentPeriodEnd: null
};

export function useSubscription() {
  const { user, subscription, profile } = useAuth() as AuthContextType;
  const [state, setState] = useState<SubscriptionState>(initialState);

  useEffect(() => {
    if (!user) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    async function fetchSubscriptionData() {
      try {
        const [featuresRes, statusRes] = await Promise.all([
          fetch('/api/subscription/features'),
          fetch('/api/subscription/status')
        ]);

        if (!featuresRes.ok || !statusRes.ok) {
          throw new Error('Failed to fetch subscription data');
        }

        const [features, status] = await Promise.all([
          featuresRes.json() as Promise<SubscriptionFeatures>,
          statusRes.json() as Promise<{
            status: SubscriptionStatus;
            subscription: any;
            currentPeriodEnd: string;
            cancelAtPeriodEnd: boolean;
          }>
        ]);

        const isActive = status.status === 'active' || status.status === 'trialing';
        setState(prev => ({
          ...prev,
          isActive,
          isPremium: profile?.subscription_tier === 'premium',
          hasFeatures: features !== null,
          isSubscribed: isActive,
          subscription: status.subscription,
          features: features || DEFAULT_FEATURES,
          status: status.status,
          currentPeriodEnd: status.currentPeriodEnd,
          cancelAtPeriodEnd: status.cancelAtPeriodEnd,
          error: null
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error : new Error('Failed to fetch subscription data')
        }));
      }
    }

    fetchSubscriptionData();
  }, [user, profile?.subscription_tier, subscription?.status]);

  const initiateCheckout = async (options: CheckoutOptions) => {
    if (!user) throw new Error('Must be logged in to start checkout');

    try {
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      if (!url) throw new Error('No checkout URL returned');

      window.location.href = url;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Checkout failed')
      }));
      throw error;
    }
  };

  const cancelSubscription = async () => {
    if (!user || !state.subscription?.id) {
      throw new Error('No active subscription to cancel');
    }

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST'
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to cancel subscription');
      }

      setState(prev => ({
        ...prev,
        cancelAtPeriodEnd: true,
        error: null
      }));

      return await response.json();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to cancel subscription')
      }));
      throw error;
    }
  };

  return {
    ...state,
    initiateCheckout,
    cancelSubscription
  };
}
