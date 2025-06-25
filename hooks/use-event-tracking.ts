'use client';

import { useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/auth-provider';

interface EventMetadata {
  [key: string]: any;
}

export function useEventTracking() {
  const { user } = useAuth();

  const trackEvent = useCallback(async (eventName: string, metadata: EventMetadata = {}) => {
    if (!user) return;

    try {
      // Track the event in our database
      await fetch('/api/marketing/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'process_event',
          data: {
            userId: user.id,
            event: eventName,
            metadata: {
              ...metadata,
              timestamp: new Date().toISOString(),
              userAgent: navigator.userAgent,
              url: window.location.href,
            },
          },
        }),
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, [user]);

  // Auto-track page views
  useEffect(() => {
    if (user) {
      trackEvent('page_view', {
        path: window.location.pathname,
        referrer: document.referrer,
      });
    }
  }, [user, trackEvent]);

  // Auto-track user interactions
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Track button clicks
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const button = target.tagName === 'BUTTON' ? target : target.closest('button');
        const buttonText = button?.textContent?.trim() || '';
        const buttonId = button?.id || '';
        const buttonClass = button?.className || '';

        trackEvent('button_click', {
          buttonText,
          buttonId,
          buttonClass,
          x: event.clientX,
          y: event.clientY,
        });
      }

      // Track link clicks
      if (target.tagName === 'A' || target.closest('a')) {
        const link = target.tagName === 'A' ? target : target.closest('a');
        const href = (link as HTMLAnchorElement)?.href || '';
        const linkText = link?.textContent?.trim() || '';

        trackEvent('link_click', {
          href,
          linkText,
          external: !href.includes(window.location.hostname),
        });
      }
    };

    // Track scroll depth
    let maxScrollDepth = 0;
    const handleScroll = () => {
      const scrollDepth = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
      
      if (scrollDepth > maxScrollDepth && scrollDepth % 25 === 0) {
        maxScrollDepth = scrollDepth;
        trackEvent('scroll_depth', { depth: scrollDepth });
      }
    };

    document.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [trackEvent]);

  // Predefined event tracking functions
  const trackSignup = useCallback(() => {
    trackEvent('user_signup', {
      source: 'organic', // Could be enhanced to track referral source
    });
  }, [trackEvent]);

  const trackSubscription = useCallback((tier: string, price: number) => {
    trackEvent('subscription_created', {
      tier,
      price,
      currency: 'USD',
    });
  }, [trackEvent]);

  const trackFeatureUsage = useCallback((featureName: string, metadata: EventMetadata = {}) => {
    trackEvent('feature_used', {
      featureName,
      ...metadata,
    });
  }, [trackEvent]);

  const trackSearchPerformed = useCallback((query: string, results: number) => {
    trackEvent('search_performed', {
      query,
      resultCount: results,
    });
  }, [trackEvent]);

  const trackParkingSpotFound = useCallback((spotId: string, timeToFind: number) => {
    trackEvent('parking_spot_found', {
      spotId,
      timeToFind, // in seconds
    });
  }, [trackEvent]);

  const trackSubscriptionUpgrade = useCallback((fromTier: string, toTier: string) => {
    trackEvent('subscription_upgraded', {
      fromTier,
      toTier,
    });
  }, [trackEvent]);

  const trackSubscriptionCancellation = useCallback((tier: string, reason?: string) => {
    trackEvent('subscription_cancelled', {
      tier,
      reason,
    });
  }, [trackEvent]);

  const trackFeatureLimitReached = useCallback((featureName: string, limit: number) => {
    trackEvent('feature_limit_reached', {
      featureName,
      limit,
    });
  }, [trackEvent]);

  const trackUserInactive = useCallback(() => {
    trackEvent('user_inactive', {
      lastActivityTime: new Date().toISOString(),
    });
  }, [trackEvent]);

  const trackEmailOpened = useCallback((campaignId: string) => {
    trackEvent('email_opened', {
      campaignId,
    });
  }, [trackEvent]);

  const trackEmailClicked = useCallback((campaignId: string, linkUrl: string) => {
    trackEvent('email_clicked', {
      campaignId,
      linkUrl,
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackSignup,
    trackSubscription,
    trackFeatureUsage,
    trackSearchPerformed,
    trackParkingSpotFound,
    trackSubscriptionUpgrade,
    trackSubscriptionCancellation,
    trackFeatureLimitReached,
    trackUserInactive,
    trackEmailOpened,
    trackEmailClicked,
  };
}
