"use client";

import { useState } from 'react';
import { useSubscription } from '@/hooks/use-subscription';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/auth-provider';

export function TestSubscription() {
  const { initiateCheckout, error: subscriptionError } = useSubscription();
  const { user, signInWithGoogle, isLoading: authLoading } = useAuth();
  const [testError, setTestError] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<string | null>(null);

  const isLoading = authLoading;

  const handleSubscribe = async () => {
    try {
      setTestError(null);
      setTestStatus('Initiating checkout...');

      const priceId = process.env.NEXT_PUBLIC_STRIPE_NAVIGATOR_PRICE_ID;
      if (!priceId) {
        throw new Error('NEXT_PUBLIC_STRIPE_NAVIGATOR_PRICE_ID is not configured');
      }

      await initiateCheckout({
        planId: priceId,
        successUrl: `${window.location.origin}/payment-success?test=true`,
        cancelUrl: `${window.location.origin}?canceled=true`
      });
      
      setTestStatus('Redirecting to Stripe checkout...');
    } catch (err) {
      setTestStatus(null);
      setTestError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">Test Subscription Flow</h2>
      
      <div className="space-y-2">
        {!user ? (
          <Button 
            onClick={() => signInWithGoogle('/test-subscription')}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Sign in with Google'}
          </Button>
        ) : (
          <>
            <div className="text-sm text-gray-600 mb-4">
              Logged in as: {user.email}
            </div>
            <Button 
              onClick={handleSubscribe} 
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Test Subscribe'}
            </Button>
          </>
        )}

        {subscriptionError && (
          <div className="text-red-500">
            Hook Error: {subscriptionError.message}
          </div>
        )}

        {testError && (
          <div className="text-red-500">
            Test Error: {testError}
          </div>
        )}

        {testStatus && (
          <div className="text-green-500">
            {testStatus}
          </div>
        )}
      </div>

      <div className="text-sm space-y-2">
        <div className="text-gray-500">
          <p>This is a test component for the subscription flow.</p>
          <p>Make sure to set up your Stripe price ID in the environment variables.</p>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-medium mb-2">Test Card Numbers:</h3>
          <ul className="space-y-1 text-sm">
            <li>✅ Success: 4242 4242 4242 4242</li>
            <li>🔒 3D Secure: 4000 0025 0000 3155</li>
            <li>❌ Decline: 4000 0000 0000 0002</li>
          </ul>
          <p className="mt-2 text-xs text-gray-600">
            Use any future date for expiry and any 3 digits for CVC
          </p>
        </div>
      </div>
    </div>
  );
}
