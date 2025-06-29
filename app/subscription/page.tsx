"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from '@/components/auth/auth-provider';
import { Loader2 } from 'lucide-react';

const plans = [
  { id: "navigator", name: "Navigator", price: 990, description: "Essential parking tools for daily commuters." },
  { id: "pro_parker", name: "Pro Parker", price: 1990, description: "Advanced features for frequent parkers." },
  { id: "fleet_manager", name: "Fleet Manager", price: 4990, description: "Complete solution for fleet management." },
];

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [globalLoading, setGlobalLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const user = auth.user;

  // Prevent double-clicks/race
  const [lock, setLock] = useState(false);

  // Auto-trigger checkout if plan param is present and user is logged in
  useEffect(() => {
    const planId = searchParams.get('plan');
    if (planId && plans.some(p => p.id === planId)) {
      if (!user) {
        // Not logged in, redirect to login with return_to (preserve plan)
        router.replace(`/auth/login?return_to=${encodeURIComponent(`/subscription?plan=${planId}`)}`);
        return;
      }
      // User is logged in, trigger checkout
      handleSubscribe(planId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, searchParams]);

  const handleSubscribe = async (planId: string) => {
    if (lock) return; // Prevent double submit
    setLock(true);
    setLoading(true);
    setProcessingPlan(planId);
    setError("");
    setGlobalLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: planId }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No Stripe URL returned");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setProcessingPlan(null);
      setGlobalLoading(false);
      setLock(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 relative">
      {globalLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center">
            <Loader2 className="animate-spin h-8 w-8 text-blue-600 mb-2" />
            <div className="text-lg font-semibold">Redirecting to Stripe...</div>
          </div>
        </div>
      )}
      <h1 className="text-3xl font-bold mb-8 text-center">Choose Your Plan</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="border rounded-lg p-6 flex flex-col items-center shadow">
            <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
            <p className="mb-4">{plan.description}</p>
            <div className="text-2xl font-bold mb-4">
              {plan.price === 0 ? "Free" : `$${(plan.price / 100).toFixed(2)}/mo`}
            </div>
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center min-h-[40px] w-full"
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading || lock}
            >
              {processingPlan === plan.id ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  <span>Redirecting...</span>
                </>
              ) : (
                plan.price === 0 ? "Select" : "Subscribe"
              )}
            </button>
          </div>
        ))}
      </div>
      {error && (
        <div className="text-red-600 mt-4 text-center p-3 bg-red-50 rounded-md border border-red-200">
          {error}
        </div>
      )}
    </div>
  );
}
