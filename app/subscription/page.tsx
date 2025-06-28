"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from '@/components/auth/auth-provider';

const plans = [
  { id: "navigator", name: "Navigator", price: 990, description: "Essential parking tools for daily commuters." },
  { id: "pro_parker", name: "Pro Parker", price: 1990, description: "Advanced features for frequent parkers." },
  { id: "fleet_manager", name: "Fleet Manager", price: 4990, description: "Complete solution for fleet management." },
];

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Auto-trigger checkout if plan param is present and user is logged in
  useEffect(() => {
    const planId = searchParams.get('plan');
    if (planId && plans.some(p => p.id === planId)) {
      if (!user) {
        // Not logged in, redirect to login with return_to
        router.replace(`/auth/login?return_to=${encodeURIComponent(`/subscription?plan=${planId}`)}`);
        return;
      }
      // User is logged in, trigger checkout
      handleSubscribe(planId);
    }
  }, [user, searchParams, router]);

  const handleSubscribe = async (planId: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: planId, planId }),
      });
      if (!res.ok) throw new Error("Failed to create checkout session");
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No Stripe URL returned");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
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
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading}
            >
              {plan.price === 0 ? "Select" : loading ? "Redirecting..." : "Subscribe"}
            </button>
          </div>
        ))}
      </div>
      {error && <div className="text-red-600 mt-4 text-center">{error}</div>}
    </div>
  );
}
