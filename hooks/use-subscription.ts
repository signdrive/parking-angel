import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { SubscriptionStatus } from '@/lib/types/stripe-types';
import { PlanFeatures } from '@/lib/types/subscription';

interface SubscriptionData {
  isSubscribed: boolean;
  planId?: string;
  status?: SubscriptionStatus;
  currentPeriodEnd?: Date;
  features?: PlanFeatures | null;
  isLoading: boolean;
  error: Error | null;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    isSubscribed: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchSubscriptionStatus() {
      if (!user) {
        setSubscriptionData(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const [statusRes, featuresRes] = await Promise.all([
          fetch('/api/subscription/status'),
          fetch('/api/subscription/features')
        ]);

        if (!statusRes.ok || !featuresRes.ok) {
          throw new Error('Failed to fetch subscription data');
        }

        const status = await statusRes.json();
        const features = await featuresRes.json();

        setSubscriptionData({
          isSubscribed: status.isSubscribed,
          planId: status.planId,
          status: status.status,
          currentPeriodEnd: status.currentPeriodEnd ? new Date(status.currentPeriodEnd) : undefined,
          features: features,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setSubscriptionData(prev => ({
          ...prev,
          isLoading: false,
          error: error as Error,
        }));
      }
    }

    fetchSubscriptionStatus();
  }, [user]);

  const initiateCheckout = async (planId: string) => {
    try {
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          returnUrl: window.location.origin,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error initiating checkout:', error);
      throw error;
    }
  };

  const cancelSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      // Refresh subscription data
      setSubscriptionData(prev => ({ ...prev, isLoading: true }));
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  };

  return {
    ...subscriptionData,
    initiateCheckout,
    cancelSubscription,
  };
}
