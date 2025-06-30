'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabase/browser';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/components/ui/use-toast';

// Cache keys for auth flow
const USER_CACHE_KEY = 'parking_angel_cached_user';
const SESSION_CACHE_KEY = 'parking_angel_cached_session';
const CHECKOUT_INTENT_KEY = 'checkout_intent';
const AUTH_RETURN_TO_KEY = 'auth_return_to';

export default function AuthCallbackClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const code = searchParams.get('code');
  const processed = useRef(false);
  const [metrics, setMetrics] = useState<{
    startTime: number;
    sessionCheckTime?: number;
    redirectStartTime?: number;
  }>({ startTime: performance.now() });

  // Fast path optimization - we prefetch potential redirect destinations
  // to speed up navigation after authentication
  useEffect(() => {
    if (code && typeof window !== 'undefined') {
      try {
        // Prefetch the dashboard as that's a common destination
        const linkPrefetch = document.createElement('link');
        linkPrefetch.rel = 'prefetch';
        linkPrefetch.href = '/dashboard';
        document.head.appendChild(linkPrefetch);
        
        // Check if we have a checkout intent and prefetch checkout page
        const cachedCheckoutIntent = localStorage.getItem(CHECKOUT_INTENT_KEY);
        if (cachedCheckoutIntent) {
          const { plan } = JSON.parse(cachedCheckoutIntent);
          if (plan) {
            const checkoutPrefetch = document.createElement('link');
            checkoutPrefetch.rel = 'prefetch';
            checkoutPrefetch.href = `/checkout-redirect?plan=${plan}`;
            document.head.appendChild(checkoutPrefetch);
          }
        }
      } catch (e) {
        // Ignore prefetch errors
      }
    }
  }, [code]);

  useEffect(() => {
    if (code && !processed.current) {
      processed.current = true;
      const supabase = getBrowserClient();
      
      // PRIORITY 1: Check for checkout intent first - this takes absolute priority
      let returnTo = '/dashboard'; // Default fallback
      
      if (typeof window !== 'undefined') {
        try {
          const cachedCheckoutIntent = localStorage.getItem(CHECKOUT_INTENT_KEY);
          if (cachedCheckoutIntent) {
            const { plan, timestamp } = JSON.parse(cachedCheckoutIntent);
            const isFresh = Date.now() - timestamp < 10 * 60 * 1000; // 10 minutes
            
            if (isFresh && plan) {
              returnTo = `/checkout-redirect?plan=${plan}`;
            }
          }
        } catch (e) {
          // Silently ignore parsing errors
        }
      }
      
      // PRIORITY 2: If no checkout intent, use return_to from URL params or localStorage
      if (returnTo === '/dashboard') {
        const returnToParam = searchParams.get('return_to');
        const redirectToParam = searchParams.get('redirect_to');
        const storedReturnTo = typeof window !== 'undefined' ? localStorage.getItem(AUTH_RETURN_TO_KEY) : null;
        
        returnTo = returnToParam || redirectToParam || storedReturnTo || '/dashboard';
      }
      
      // For PKCE flow, we need to let Supabase handle the session automatically
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        setMetrics(prev => ({ ...prev, sessionCheckTime: performance.now() }));
        
        if (error) {
          toast({
            title: "Authentication Error",
            description: error.message || "There was a problem signing you in. Please try again.",
            variant: "destructive",
          });
          router.replace('/auth/login');
        } else if (session) {
          // Cache session and user info for faster loads
          if (typeof window !== 'undefined' && session.user) {
            try {
              // Add timestamp to track cache freshness
              const userToCache = { ...session.user, _cacheTime: Date.now() };
              localStorage.setItem(USER_CACHE_KEY, JSON.stringify(userToCache));
              localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(session));
              
              // Clean up auth return to after successful use
              localStorage.removeItem(AUTH_RETURN_TO_KEY);
            } catch (e) {

            }
          }
          
          setMetrics(prev => ({ ...prev, redirectStartTime: performance.now() }));
          
          // Performance metrics
          const sessionCheckDuration = metrics.sessionCheckTime 
            ? metrics.sessionCheckTime - metrics.startTime 
            : 'unknown';
          const totalDuration = performance.now() - metrics.startTime;
          
          // For faster redirects, especially on checkout flows, use direct navigation
          if (returnTo.includes('/checkout-redirect')) {
            window.location.href = returnTo;
          } else {
            router.replace(returnTo);
          }
        } else {
          // No session yet, try to exchange the code
          supabase.auth.exchangeCodeForSession(code).then(({ data, error: exchangeError }) => {
            if (exchangeError) {
              toast({
                title: "Authentication Error",
                description: exchangeError.message || "There was a problem signing you in. Please try again.",
                variant: "destructive",
              });
              router.replace('/auth/login');
            } else {
              // Success - redirect to intended destination
              if (returnTo.includes('/checkout-redirect')) {
                window.location.href = returnTo;
              } else {
                router.replace(returnTo);
              }
            }
          });
        }
      });
    }
  }, [code, searchParams, router, toast, metrics.startTime, metrics.sessionCheckTime]);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center p-4">
      <LoadingSpinner text="Completing authentication..." />
      <p className="text-center mt-4 text-sm text-gray-500">
        Please wait while we sign you in...
      </p>
    </div>
  );
}
