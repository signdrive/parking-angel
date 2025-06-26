"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from '@/components/auth/auth-provider';

export default function CheckoutRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const planId = searchParams.get('plan');

  useEffect(() => {
    if (!planId) {
      setError("No plan selected.");
      return;
    }
    if (isLoading) return; // Wait for auth to hydrate
    if (!user) {
      // Not logged in, redirect to login with return_to
      router.replace(`/auth/login?return_to=${encodeURIComponent(`/checkout-redirect?plan=${planId}`)}`);
      return;
    }
    setLoading(true);
    // User is logged in, trigger checkout
    fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ tier: planId, planId }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to create checkout session");
        const { url } = await res.json();
        if (url) {
          window.location.href = url;
        } else {
          throw new Error("No Stripe URL returned");
        }
      })
      .catch((err) => {
        setError(err.message || "Something went wrong");
      })
      .finally(() => setLoading(false));
  }, [user, isLoading, planId, router]);

  if (error) {
    return <div className="text-red-600 text-center mt-8">{error}</div>;
  }
  return <div className="text-center mt-8">{loading || isLoading ? "Preparing payment..." : "Redirecting to payment..."}</div>;
}
