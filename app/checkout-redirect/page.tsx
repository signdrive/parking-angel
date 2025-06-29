"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from '@/components/auth/auth-provider';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function CheckoutRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<{
    pageLoadTime?: number;
    authReadyTime?: number;
    checkoutStartTime?: number;
    checkoutCompleteTime?: number;
  }>({});
  const planId = searchParams.get('plan');
  const checkoutAttempted = useRef(false);
  
  // Start timing as soon as component mounts
  useEffect(() => {
    setPerformanceMetrics(prev => ({
      ...prev,
      pageLoadTime: performance.now()
    }));
  }, []);

  // Track when auth is ready
  useEffect(() => {
    if (!isLoading && (user || !user)) {
      setPerformanceMetrics(prev => ({
        ...prev,
        authReadyTime: performance.now()
      }));
    }
  }, [isLoading, user]);

  const startCheckout = useCallback(async (planIdentifier: string) => {
    if (checkoutAttempted.current) return; // Prevent double-execution
    checkoutAttempted.current = true;
    
    try {
      setLoading(true);
      setPerformanceMetrics(prev => ({
        ...prev,
        checkoutStartTime: performance.now()
      }));
      
      // Cache intent in localStorage in case we need to recover
      localStorage.setItem('checkout_intent', JSON.stringify({ 
        plan: planIdentifier,
        timestamp: Date.now()
      }));

      console.log(`Starting checkout for plan: ${planIdentifier}`);
      
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tier: planIdentifier }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }
      
      const { url } = await response.json();
      
      if (!url) {
        throw new Error("No Stripe URL returned");
      }
      
      setPerformanceMetrics(prev => ({
        ...prev,
        checkoutCompleteTime: performance.now()
      }));

      // Log performance metrics before redirecting
      const metrics = {
        pageLoadToAuthReady: performanceMetrics.authReadyTime ? 
          (performanceMetrics.authReadyTime - performanceMetrics.pageLoadTime!) : 'N/A',
        authReadyToCheckoutStart: performanceMetrics.checkoutStartTime && performanceMetrics.authReadyTime ? 
          (performanceMetrics.checkoutStartTime - performanceMetrics.authReadyTime) : 'N/A',
        checkoutStartToComplete: performanceMetrics.checkoutCompleteTime && performanceMetrics.checkoutStartTime ? 
          (performanceMetrics.checkoutCompleteTime - performanceMetrics.checkoutStartTime) : 'N/A',
        totalTime: performanceMetrics.checkoutCompleteTime && performanceMetrics.pageLoadTime ? 
          (performanceMetrics.checkoutCompleteTime - performanceMetrics.pageLoadTime!) : 'N/A'
      };
      
      console.log('Checkout flow performance metrics (ms):', metrics);
      
      // Redirect to Stripe
      window.location.href = url;
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || "Something went wrong during checkout");
      checkoutAttempted.current = false; // Allow retry on error
    } finally {
      setLoading(false);
    }
  }, [performanceMetrics]);

  // Try to recover from localStorage if needed
  useEffect(() => {
    const cachedIntent = localStorage.getItem('checkout_intent');
    if (cachedIntent) {
      try {
        const { plan, timestamp } = JSON.parse(cachedIntent);
        // Only use cache if it's fresh (less than 5 minutes old)
        const isFresh = Date.now() - timestamp < 5 * 60 * 1000;
        
        if (isFresh && !planId && plan) {
          console.log('Recovering from cached checkout intent:', plan);
          router.replace(`/checkout-redirect?plan=${plan}`);
        } else if (!isFresh) {
          // Clean up old cache
          localStorage.removeItem('checkout_intent');
        }
      } catch (e) {
        localStorage.removeItem('checkout_intent');
      }
    }
  }, [planId, router]);

  // Main checkout flow
  useEffect(() => {
    if (!planId) {
      setError("No plan selected. Please select a subscription plan.");
      return;
    }
    
    if (isLoading) return; // Wait for auth to initialize
    
    if (!user) {
      // If not logged in, store intent and redirect to login
      localStorage.setItem('checkout_intent', JSON.stringify({ 
        plan: planId,
        timestamp: Date.now()
      }));
      
      console.log('User not authenticated, redirecting to login...');
      router.replace(`/auth/login?return_to=${encodeURIComponent(`/checkout-redirect?plan=${planId}`)}`);
      return;
    }
    
    // User is logged in and plan is selected, proceed with checkout
    startCheckout(planId);
    
  }, [user, isLoading, planId, router, startCheckout]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <div className="text-red-600 text-center mb-4 font-medium">{error}</div>
        <button 
          onClick={() => {
            checkoutAttempted.current = false;
            setError("");
            if (planId) startCheckout(planId);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <LoadingSpinner text={loading ? "Preparing your checkout experience..." : "Redirecting to Stripe..."} />
      <p className="text-center mt-2 text-sm text-gray-500">
        You'll be redirected to our secure payment provider in a moment.
      </p>
    </div>
  );
}
