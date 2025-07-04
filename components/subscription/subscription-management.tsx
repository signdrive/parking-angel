import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSubscription } from "@/hooks/use-subscription";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SUBSCRIPTION_PLANS } from "@/lib/config/subscription-plans";

export function SubscriptionManagement() {
  const { 
    isSubscribed, 
    planId, 
    status, 
    currentPeriodEnd, 
    features, 
    cancelSubscription,
    isLoading 
  } = useSubscription();

  const [isCanceling, setIsCanceling] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPlan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);

  const handleCancel = async () => {
    try {
      setIsCanceling(true);
      await cancelSubscription();
    } catch (error) {
      console.error('Error canceling subscription:', error);
    } finally {
      setIsCanceling(false);
    }
  };

  if (!isSubscribed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
          <CardDescription>Subscribe to access premium features</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild className="w-full">
            <a href="/plans">View Plans</a>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Subscription</CardTitle>
        <CardDescription>Manage your subscription here</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Current Plan</h3>
            <p className="text-2xl font-bold">{currentPlan?.name}</p>
          </div>
          
          <div>
            <h3 className="font-medium">Status</h3>
            <p className="capitalize">{status}</p>
          </div>

          {currentPeriodEnd && (
            <div>
              <h3 className="font-medium">Next Billing Date</h3>
              <p>{new Date(currentPeriodEnd).toLocaleDateString()}</p>
            </div>
          )}

          {features && features.items && (
            <div>
              <h3 className="font-medium">Your Features</h3>
              <ul className="mt-2 space-y-2">
                {features.items.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center gap-2">
                    <span>✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isCanceling} className="w-full">
              {isCanceling ? <LoadingSpinner /> : "Cancel Subscription"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will cancel your subscription at the end of the current billing period. 
                You will continue to have access to premium features until then.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancel}>
                Yes, Cancel Subscription
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
