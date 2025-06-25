'use client';

import { useState, useEffect } from 'react';
import { ExperimentManager } from '@/lib/ab-testing/experiment-manager';

export interface ABTestHookResult {
  variant: string;
  isLoading: boolean;
  trackConversion: (conversionType: string, value?: number) => void;
  getVariantData: () => any;
}

export function useABTest(experimentId: string): ABTestHookResult {
  const [variant, setVariant] = useState<string>('control');
  const [isLoading, setIsLoading] = useState(true);
  const [experimentManager] = useState(() => new ExperimentManager());
  useEffect(() => {
    const initializeExperiment = async () => {
      try {
        setIsLoading(true);
        const assignedVariant = await experimentManager.getVariant(experimentId);
        setVariant(assignedVariant?.name || 'control');
      } catch (error) {
        console.error('Failed to initialize AB test:', error);
        setVariant('control');
      } finally {
        setIsLoading(false);
      }
    };

    initializeExperiment();
  }, [experimentId, experimentManager]);
  const trackConversion = async (conversionType: string, value?: number) => {
    try {
      // Note: trackConversion expects (experimentId, userId, value)
      // but we only have access to experimentId here, so we'll use the API directly
      const response = await fetch('/api/ab-testing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          experimentId,
          conversionType,
          value,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to track conversion');
      }
    } catch (error) {
      console.error('Failed to track conversion:', error);
    }
  };

  const getVariantData = () => {
    return experimentManager.getVariantData(experimentId, variant);
  };

  return {
    variant,
    isLoading,
    trackConversion,
    getVariantData,
  };
}

// Hook for price testing
export function usePriceTest() {
  return useABTest('pricing_test_2025');
}

// Hook for feature upsell testing
export function useUpsellTest() {
  return useABTest('upsell_flow_test');
}

// Hook for onboarding flow testing
export function useOnboardingTest() {
  return useABTest('onboarding_flow_test');
}
