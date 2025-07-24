'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalyticsProvider() {
  const pathname = usePathname();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || typeof (window as any).gtag !== 'function') {
      return;
    }

    // Track page view
    (window as any).gtag('config', GA_MEASUREMENT_ID, {
      page_path: pathname,
      debug_mode: process.env.NODE_ENV === 'development'
    });

    console.log('📊 GA4 Page view tracked:', pathname);
  }, [pathname]);

  // Don't render anything if GA ID is not configured
  if (!GA_MEASUREMENT_ID) {
    console.warn('⚠️ GA_MEASUREMENT_ID not configured. Add NEXT_PUBLIC_GA_MEASUREMENT_ID to environment variables.');
    return null;
  }

  return (
    <>
      {/* Google tag (gtag.js) */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
        onLoad={() => {
          console.log('✅ Google Analytics loaded successfully');
        }}
        onError={() => {
          console.error('❌ Failed to load Google Analytics');
        }}
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              send_page_view: true,
              debug_mode: ${process.env.NODE_ENV === 'development'},
              custom_map: {
                'custom_parameter_user_plan': 'user_plan',
                'custom_parameter_parking_action': 'parking_action'
              }
            });
            
            // Track initial page load
            gtag('event', 'page_view', {
              page_title: document.title,
              page_location: window.location.href,
              page_path: window.location.pathname
            });
            
            console.log('🔍 GA4 initialized with ID:', '${GA_MEASUREMENT_ID}');
          `,
        }}
      />
    </>
  );
}

// Utility functions for tracking custom events
export function trackEvent(
  eventName: string,
  eventParameters?: Record<string, any>
) {
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', eventName, eventParameters);
    console.log('📊 GA4 Event tracked:', eventName, eventParameters);
  }
}

// Track parking-specific events
export function trackParkingEvent(action: string, data?: Record<string, any>) {
  trackEvent('parking_action', {
    action_type: action,
    timestamp: new Date().toISOString(),
    ...data
  });
}

// Track subscription events
export function trackSubscriptionEvent(action: string, plan?: string) {
  trackEvent('subscription_action', {
    action_type: action,
    subscription_plan: plan,
    timestamp: new Date().toISOString()
  });
}

// Track navigation events
export function trackPageView(pagePath: string, pageTitle?: string) {
  trackEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle || document.title,
    page_location: window.location.href
  });
}

// Track user interactions
export function trackUserInteraction(element: string, action: string) {
  trackEvent('user_interaction', {
    element_name: element,
    action_type: action,
    timestamp: new Date().toISOString()
  });
}
