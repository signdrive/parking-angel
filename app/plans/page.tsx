'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { SUBSCRIPTION_PLANS } from '@/lib/config/subscription-plans';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { Plan } from '@/lib/types/subscription';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export default function PlansPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePlanSelection = async (plan: Plan) => {
    try {
      setIsLoading(true);
      
      if (!user) {
        // Store selected plan in localStorage and redirect to signup
        localStorage.setItem('selectedPlan', JSON.stringify(plan));
        router.push('/auth/signup');
        return;
      }

      // If user is logged in, redirect directly to checkout
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          priceId: plan.stripePriceId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error handling plan selection:', error);
      toast({
        title: 'Error',
        description: 'Failed to process plan selection. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-6xl py-10">
      <div className="mx-auto mb-10 max-w-md text-center">
        <h1 className="text-3xl font-bold">Choose Your Plan</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Select the perfect plan for your parking needs
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={cn(
              'flex flex-col',
              plan.recommended && 'border-primary shadow-lg'
            )}
          >
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-4">
                <span className="text-3xl font-bold">${plan.price}</span>
                {plan.price > 0 && <span className="text-muted-foreground">/month</span>}
              </div>
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature.id} className="flex items-center gap-2">
                    <Check className={cn(
                      'h-4 w-4',
                      feature.included ? 'text-primary' : 'text-muted-foreground'
                    )} />
                    <span className={cn(
                      !feature.included && 'text-muted-foreground line-through'
                    )}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.recommended ? 'default' : 'outline'}
                disabled={isLoading}
                onClick={() => handlePlanSelection(plan)}
              >
                {isLoading ? 'Processing...' : plan.price === 0 ? 'Get Started' : 'Subscribe'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
