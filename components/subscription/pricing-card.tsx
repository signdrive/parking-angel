import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { SubscriptionPlan } from "@/lib/types/subscription";
import { useSubscription } from "@/hooks/use-subscription";
import { useState } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface PricingCardProps {
  plan: SubscriptionPlan;
  showAnnual?: boolean;
}

export function PricingCard({ plan, showAnnual = false }: PricingCardProps) {
  const { isSubscribed, planId, initiateCheckout, status } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);

  const isCurrentPlan = isSubscribed && planId === plan.id;
  const isCanceled = status === 'canceled';

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      await initiateCheckout(plan.id);
    } catch (error) {
      console.error('Error initiating checkout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
        <div className="text-3xl font-bold">
          ${plan.price}
          <span className="text-sm font-normal text-muted-foreground">/month</span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-2">
          {plan.features.items.map((feature: string, i: number) => (
            <li key={i} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={isCurrentPlan ? "outline" : "default"}
          disabled={isCurrentPlan || isLoading}
          onClick={handleSubscribe}
        >
          {isLoading ? (
            <LoadingSpinner />
          ) : isCurrentPlan ? (
            "Current Plan"
          ) : (
            "Subscribe"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
