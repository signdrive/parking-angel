"use client";

import { SUBSCRIPTION_PLANS } from "@/lib/config/subscription-plans";
import { PricingCard } from "@/components/subscription/pricing-card";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PricingPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container max-w-6xl py-10">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/3 mx-auto" />
          <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-muted-foreground mt-4">
          Choose the perfect plan for your parking needs
        </p>
      </div>

      {!user && (
        <div className="text-center mb-8">
          <p className="text-muted-foreground mb-4">
            Please sign in to subscribe to a plan
          </p>
          <Button asChild>
            <Link href="/auth">Sign In</Link>
          </Button>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <PricingCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
}
