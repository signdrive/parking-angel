"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from '@/hooks/use-auth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function CheckoutRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, initialized } = useAuth();
  const [error, setError] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("Initializing...");
  const planId = searchParams.get('plan');
 
 const checkoutAttempted = useRef(false);

  const startCheckout = useCallback(async (planIdentifier: string) => {
    if (checkoutAttempted.current) return;
    checkoutAttempted.current = true;
    setLoadingMessage("Preparing your checkout experience...");

    try {
      // Cache intent in localStorage in case we need to recover
      localStorage.setItem('checkout_intent', JSON.stringify({ 
        plan: planIdentifier,
        timestamp: Date.now()
      }));

      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
       
       headers: { "Content-Type": "application/json" },
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
      
      setLoadingMessage("Redirecting to secure payment...");
      window.location.href = url;
   } catch (err: any) {
      setError(err.message || "Something went wrong during checkout");
     checkoutAttempted.current = false; // Allow retry on error
    }
  }, []);

  // Main checkout flow - optimized for performance
  useEffect(() => {
    console.log('Checkout flow triggered:', { planId, initialized, user: !!user });
    
    if (!planId) {
      console.log('No plan ID found, redirecting to pricing');
      setError("No plan selected. Redirecting to pricing page...");
      setTimeout(() => {
        router.replace('/#pricing');
      }, 3000);
      return;
    }

    // Wait until the auth state is fully initialized
    if (!initialized) {
      console.log('Auth not initialized yet, waiting...');
      setLoadingMessage("Verifying authentication...");
      return;
    }
    
    if (user) {
      // User is logged in, proceed with checkout
      console.log('User is logged in, starting checkout for plan:', planId);
      startCheckout(planId);
    } else {
      // If not logged in, store intent and redirect to login
      console.log('User not logged in, redirecting to login');
      setLoadingMessage("Redirecting to login...");
      localStorage.setItem('checkout_intent', JSON.stringify({ 
        plan: planId,
        timestamp: Date.now()
      }));
      
     router.replace(`/auth/login?return_to=${encodeURIComponent(`/checkout-redirect?plan=${planId}`)}`);
    }
    
  }, [user, initialized, planId, router, startCheckout]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <div className="text-red-600 text-center mb-4 font-medium">{error}</div>
        <button 
          onClick={() => {
            checkoutAttempted.current = false;
            setError("");
            if (planId && user) {
              startCheckout(planId);
            } else if (planId) {
              router.replace(`/auth/login?return_to=${encodeURIComponent(`/checkout-redirect?plan=${planId}`)}`);
            } else {
              router.replace('/#pricing');
            }
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
      <LoadingSpinner text={loadingMessage} />
      <p className="text-center mt-2 text-sm text-gray-500">
        Please wait, we're preparing your secure checkout.
      </p>
    </div>
  );
}
