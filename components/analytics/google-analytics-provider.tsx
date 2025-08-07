'use client';

import Script from 'next/script';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalyticsProvider() {
  // EMERGENCY CIRCUIT BREAKER: Absolutely prevent GA in development
  const isDevelopment = process.env.NODE_ENV === 'development' || 
                       process.env.NODE_ENV !== 'production' ||
                       typeof window !== 'undefined' && window.location.hostname === 'localhost' ||
                       typeof window !== 'undefined' && window.location.hostname.includes('codespaces') ||
                       typeof window !== 'undefined' && window.location.hostname.includes('github.dev');

  if (isDevelopment || !GA_MEASUREMENT_ID || GA_MEASUREMENT_ID.includes('placeholder')) {
    console.log('🛑 Google Analytics DISABLED in development environment');
    return null;
  }

  console.log('✅ Google Analytics enabled in production');
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `,
        }}
      />
    </>
  );
}

export const trackPageView = (url: string, title?: string) => {
  // EMERGENCY CIRCUIT BREAKER: Absolutely prevent tracking in development
  const isDevelopment = process.env.NODE_ENV === 'development' || 
                       process.env.NODE_ENV !== 'production' ||
                       typeof window !== 'undefined' && window.location.hostname === 'localhost' ||
                       typeof window !== 'undefined' && window.location.hostname.includes('codespaces') ||
                       typeof window !== 'undefined' && window.location.hostname.includes('github.dev');

  if (isDevelopment) {
    console.log('🛑 Page view tracking DISABLED in development');
    return;
  }

  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', GA_MEASUREMENT_ID, {
      page_location: url,
      page_title: title,
    });
  }
};

export const trackEvent = (
  eventName: string, 
  parameters?: Record<string, any>
) => {
  // EMERGENCY CIRCUIT BREAKER: Absolutely prevent tracking in development
  const isDevelopment = process.env.NODE_ENV === 'development' || 
                       process.env.NODE_ENV !== 'production' ||
                       typeof window !== 'undefined' && window.location.hostname === 'localhost' ||
                       typeof window !== 'undefined' && window.location.hostname.includes('codespaces') ||
                       typeof window !== 'undefined' && window.location.hostname.includes('github.dev');

  if (isDevelopment) {
    console.log('🛑 Event tracking DISABLED in development');
    return;
  }

  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, parameters);
  }
};

// Track parking-specific events
export function trackParkingEvent(action: string, data?: Record<string, any>) {
  if (process.env.NODE_ENV !== 'production') return;
  
  trackEvent('parking_action', {
    action_type: action,
    timestamp: new Date().toISOString(),
    ...data
  });
}

// Track subscription events
export function trackSubscriptionEvent(action: string, plan?: string) {
  if (process.env.NODE_ENV !== 'production') return;
  
  trackEvent('subscription_action', {
    action_type: action,
    subscription_plan: plan,
    timestamp: new Date().toISOString()
  });
}

// Track navigation events
export function trackPageNavigation(pagePath: string, pageTitle?: string) {
  if (process.env.NODE_ENV !== 'production') return;
  
  trackEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle || (typeof document !== 'undefined' ? document.title : ''),
    page_location: typeof window !== 'undefined' ? window.location.href : ''
  });
}

// Track user interactions
export function trackUserInteraction(element: string, action: string) {
  if (process.env.NODE_ENV !== 'production') return;
  
  trackEvent('user_interaction', {
    element_name: element,
    action_type: action,
    timestamp: new Date().toISOString()
  });
}
