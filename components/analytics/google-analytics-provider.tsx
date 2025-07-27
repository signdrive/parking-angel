'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalyticsProvider() {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Only run this check on the client side to avoid hydration mismatch
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                         window.location.hostname === 'localhost' ||
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname.includes('.local') ||
                         window.location.port === '3000';

    if (isDevelopment) {
      console.log('📊 GA4 provider disabled in development environment');
      setShouldRender(false);
    } else if (GA_MEASUREMENT_ID) {
      setShouldRender(true);
    } else {
      console.warn('⚠️ GA_MEASUREMENT_ID not configured');
      setShouldRender(false);
    }
  }, []);

  // Always return the same structure during SSR and initial client render
  if (!shouldRender) {
    return null;
  }

  const pathname = usePathname();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || typeof (window as any).gtag !== 'function') {
      return;
    }

    // Track page view
    (window as any).gtag('config', GA_MEASUREMENT_ID, {
      page_path: pathname,
      debug_mode: false
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
              debug_mode: false,
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

export const trackPageView = (url: string, title?: string) => {
  // Skip tracking in development
  if (typeof window !== 'undefined' && (
    process.env.NODE_ENV === 'development' || 
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('.local') ||
    window.location.port === '3000'
  )) {
    console.log('📊 Page view tracking skipped in development:', url, title);
    return;
  }

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_location: url,
      page_title: title,
    });
  }
};

export const trackEvent = (
  eventName: string, 
  parameters?: Record<string, any>
) => {
  // Skip tracking in development
  if (typeof window !== 'undefined' && (
    process.env.NODE_ENV === 'development' || 
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('.local') ||
    window.location.port === '3000'
  )) {
    console.log('📊 Event tracking skipped in development:', eventName, parameters);
    return;
  }

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

// Track parking-specific events
export function trackParkingEvent(action: string, data?: Record<string, any>) {
  // Skip tracking in development
  if (typeof window !== 'undefined' && (
    process.env.NODE_ENV === 'development' || 
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('.local') ||
    window.location.port === '3000'
  )) {
    console.log('📊 GA4 Parking event skipped in development:', action, data);
    return;
  }
  
  trackEvent('parking_action', {
    action_type: action,
    timestamp: new Date().toISOString(),
    ...data
  });
}

// Track subscription events
export function trackSubscriptionEvent(action: string, plan?: string) {
  // Skip tracking in development
  if (typeof window !== 'undefined' && (
    process.env.NODE_ENV === 'development' || 
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('.local') ||
    window.location.port === '3000'
  )) {
    console.log('📊 GA4 Subscription event skipped in development:', action, plan);
    return;
  }
  
  trackEvent('subscription_action', {
    action_type: action,
    subscription_plan: plan,
    timestamp: new Date().toISOString()
  });
}

// Track navigation events
export function trackPageNavigation(pagePath: string, pageTitle?: string) {
  // Skip tracking in development
  if (typeof window !== 'undefined' && (
    process.env.NODE_ENV === 'development' || 
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('.local') ||
    window.location.port === '3000'
  )) {
    console.log('📊 GA4 Page view skipped in development:', pagePath);
    return;
  }
  
  trackEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle || document.title,
    page_location: window.location.href
  });
}

// Track user interactions
export function trackUserInteraction(element: string, action: string) {
  // Skip tracking in development
  if (typeof window !== 'undefined' && (
    process.env.NODE_ENV === 'development' || 
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('.local') ||
    window.location.port === '3000'
  )) {
    console.log('📊 GA4 User interaction skipped in development:', element, action);
    return;
  }
  
  trackEvent('user_interaction', {
    element_name: element,
    action_type: action,
    timestamp: new Date().toISOString()
  });
}
