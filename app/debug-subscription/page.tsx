"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { useSubscription } from "@/hooks/use-subscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugSubscriptionPage() {
  const { user, isLoading } = useAuth();
  const subscription = useSubscription();

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user) {
    return <div className="p-8">Please log in to see subscription debug info.</div>;
  }

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered - reloading page');
    window.location.reload(); // Force a page refresh to see updated state
  };

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Subscription Debug Page</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>User Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Subscription isSubscribed:</strong> {subscription.isSubscribed ? 'Yes' : 'No'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile Data (from useSubscription)</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Profile data is now fetched directly by useSubscription hook.</p>
          <p>Check the subscription data below for current plan information.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Hook Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Plan ID:</strong> {subscription.planId || 'None'}</p>
            <p><strong>Status:</strong> {subscription.status}</p>
            <p><strong>Is Active:</strong> {subscription.isActive ? 'Yes' : 'No'}</p>
            <p><strong>Is Premium:</strong> {subscription.isPremium ? 'Yes' : 'No'}</p>
            <p><strong>Is Subscribed:</strong> {subscription.isSubscribed ? 'Yes' : 'No'}</p>
            <p><strong>Loading:</strong> {subscription.isLoading ? 'Yes' : 'No'}</p>
          </div>
          
          <details className="mt-4">
            <summary className="cursor-pointer font-semibold">Full Subscription State</summary>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto mt-2">
              {JSON.stringify(subscription, null, 2)}
            </pre>
          </details>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Test subscription refresh and state updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleRefresh} className="w-full">
            Refresh Profile Data
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/dashboard'}
            className="w-full"
          >
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
