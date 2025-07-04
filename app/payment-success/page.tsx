"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CheckCircle, XCircle } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isSubscribed } = useSubscription();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    async function verifyPayment() {
      try {
        const sessionId = searchParams.get('session_id');
        if (!sessionId) {
          throw new Error('No session ID found');
        }

        const response = await fetch('/api/stripe/verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
          throw new Error('Payment verification failed');
        }

        setVerificationStatus('success');
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } catch (error) {
        console.error('Error verifying payment:', error);
        setVerificationStatus('error');
      }
    }

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="container max-w-lg min-h-[60vh] flex flex-col items-center justify-center py-10">
      {verificationStatus === 'loading' && (
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <h1 className="text-2xl font-bold mt-4">Verifying your payment...</h1>
          <p className="text-muted-foreground mt-2">Please wait while we confirm your subscription</p>
        </div>
      )}

      {verificationStatus === 'success' && (
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold mt-4">Payment Successful!</h1>
          <p className="text-muted-foreground mt-2">
            Thank you for subscribing. You will be redirected to your dashboard shortly.
          </p>
          <Button className="mt-6" onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      )}

      {verificationStatus === 'error' && (
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold mt-4">Payment Verification Failed</h1>
          <p className="text-muted-foreground mt-2">
            There was an error verifying your payment. Please contact support if this persists.
          </p>
          <div className="flex gap-4 mt-6">
            <Button variant="outline" onClick={() => router.push('/plans')}>
              Try Again
            </Button>
            <Button onClick={() => router.push('/contact')}>Contact Support</Button>
          </div>
        </div>
      )}
    </div>
  );
}
