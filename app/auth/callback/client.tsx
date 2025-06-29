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

  useEffect(() => {
    if (code && !processed.current) {
      processed.current = true;
      console.log('Found auth code, handling session...');
      const supabase = getBrowserClient();
      
      // Get return_to from multiple possible sources
      const returnToParam = searchParams.get('return_to');
      const redirectToParam = searchParams.get('redirect_to');
      const storedReturnTo = typeof window !== 'undefined' ? localStorage.getItem(AUTH_RETURN_TO_KEY) : null;
      
      let returnTo = returnToParam || redirectToParam || storedReturnTo || '/dashboard';
      
      // Check if this is a checkout flow - prioritize checkout intent if found
      if (typeof window !== 'undefined') {
        try {
          const cachedCheckoutIntent = localStorage.getItem(CHECKOUT_INTENT_KEY);
          if (cachedCheckoutIntent) {
            const { plan, timestamp } = JSON.parse(cachedCheckoutIntent);
            const isFresh = Date.now() - timestamp < 10 * 60 * 1000; // 10 minutes
            
            if (isFresh && plan) {
              console.log('Found cached checkout intent for plan:', plan);
              returnTo = `/checkout-redirect?plan=${plan}`;
            }
          }
        } catch (e) {
          console.error('Error parsing checkout intent:', e);
        }
      }
      
      console.log('Auth callback - returnTo params:', {
        return_to: returnToParam,
        redirect_to: redirectToParam,
        stored_return_to: storedReturnTo,
        final_returnTo: returnTo,
        all_params: Object.fromEntries(searchParams.entries())
      });
      
      // For PKCE flow, we need to let Supabase handle the session automatically
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        setMetrics(prev => ({ ...prev, sessionCheckTime: performance.now() }));
        
        if (error) {
          console.error('Error getting session:', error);
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
              console.error('Error caching session data:', e);
            }
          }
          
          setMetrics(prev => ({ ...prev, redirectStartTime: performance.now() }));
          console.log('Session established successfully, redirecting to:', returnTo);
          
          // Performance metrics
          const sessionCheckDuration = metrics.sessionCheckTime 
            ? metrics.sessionCheckTime - metrics.startTime 
            : 'unknown';
          const totalDuration = performance.now() - metrics.startTime;
          
          console.log('Auth callback performance:', {
            sessionCheckMs: sessionCheckDuration,
            totalProcessingMs: totalDuration,
            redirectingTo: returnTo
          });
          
          router.replace(returnTo);
        } else {
          // No session yet, try to exchange the code
          supabase.auth.exchangeCodeForSession(code).then(({ data, error: exchangeError }) => {
            if (exchangeError) {
              console.error('Error exchanging code:', exchangeError);
              toast({
                title: "Authentication Error",
                description: exchangeError.message || "There was a problem signing you in. Please try again.",
                variant: "destructive",
              });
              router.replace('/auth/login');
            } else {
              console.log('Code exchange successful, redirecting to:', returnTo);
              
              // Cache session data if available
              if (typeof window !== 'undefined' && data?.session?.user) {
                try {
                  const userToCache = { ...data.session.user, _cacheTime: Date.now() };
                  localStorage.setItem(USER_CACHE_KEY, JSON.stringify(userToCache));
                  localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(data.session));
                } catch (e) {
                  console.error('Error caching session data after code exchange:', e);
                }
              }
              
              router.replace(returnTo);
            }
          });
        }
      });
    }
  }, [code, router, toast, searchParams, metrics]);

  if (!code) {
    // This can happen if the user navigates to the callback URL directly
    // or if the code is missing for some reason. Redirect to login.
    console.log("No auth code found - redirecting to login (likely direct visit)");
    router.replace("/auth/login");
    return <LoadingSpinner text="Redirecting to login..." />;
  }

  return <LoadingSpinner text="Finalizing login..." />;
}
