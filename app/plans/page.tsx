'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter, useSearchParams } from 'next/navigation';
import { SUBSCRIPTION_PLANS } from '@/lib/config/subscription-plans';
import { cn } from '@/lib/utils';
import { Check, Loader2 } from 'lucide-react';
import type { Plan, PlanFeature } from '@/lib/types/subscription';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export default function PlansPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for return_to parameter
  useEffect(() => {
    const returnTo = searchParams.get('return_to');
    if (returnTo) {
      localStorage.setItem('returnTo', returnTo);
    }
  }, [searchParams]);

  const handlePlanSelection = async (plan: Plan) => {
    try {
      setSelectedPlan(plan);
      setIsLoading(true);
      
      if (!user) {
        // Store selected plan in localStorage
        localStorage.setItem('selectedPlan', plan.id);
        // Redirect to auth with return path
        router.push(`/auth/login?return_to=/checkout-redirect?plan=${plan.id}`);
        return;
      }

      // User is logged in, create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          priceId: plan.stripePriceId,
          returnUrl: window.location.origin + '/payment-success'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process checkout',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">Choose Your Plan</h1>
        <p className="text-muted-foreground mt-2">Select the plan that best fits your needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <Card 
            key={plan.id}
            className={cn(
              "flex flex-col",
              selectedPlan?.id === plan.id && "border-primary"
            )}
          >
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-3xl font-bold mb-4">
                {plan.price === 0 ? 'Free' : `$${plan.price}/mo`}
              </div>
              <ul className="space-y-2">
                {plan.features.map((feature: PlanFeature) => (
                  <li key={feature.id} className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    <span>{feature.name}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handlePlanSelection(plan)}
                disabled={isLoading && selectedPlan?.id === plan.id}
              >
                {isLoading && selectedPlan?.id === plan.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Select ${plan.name}`
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
