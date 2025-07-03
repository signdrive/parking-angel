"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Confetti from 'react-confetti';

const StatusMessage = ({ icon, title, message }: { icon: React.ReactNode, title: string, message: string }) => (
  <div className="flex flex-col items-center justify-center space-y-4 text-center">
    {icon}
    <h2 className="text-2xl font-bold">{title}</h2>
    <p className="text-muted-foreground">{message}</p>
  </div>
);

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [retryCount, setRetryCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    async function verifyPayment() {
      if (!sessionId) {
        setStatus('error');
        toast({
          title: 'Error',
          description: 'Invalid session ID',
          variant: 'destructive',
        });
        return;
      }

      try {
        const response = await fetch('/api/stripe/verify-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
          throw new Error('Payment verification failed');
        }

        const data = await response.json();
        
        if (data.status === 'complete') {
          setStatus('success');
          setShowConfetti(true);
          // Success! Wait 3 seconds then redirect to dashboard
          timeoutId = setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        } else if (data.status === 'pending' && retryCount < 5) {
          // Retry after 2 seconds
          timeoutId = setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000);
        } else {
          throw new Error(data.message || 'Payment verification failed');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setStatus('error');
        toast({
          title: 'Error',
          description: 'Failed to verify payment. Please contact support.',
          variant: 'destructive',
        });
      }
    }

    verifyPayment();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [sessionId, retryCount, router, toast]);

  return (
    <div className="container max-w-lg py-20">
      {showConfetti && <Confetti numberOfPieces={200} recycle={false} />}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-center">
            {status === 'verifying' && (
              <StatusMessage
                icon={<Loader2 className="h-12 w-12 animate-spin text-blue-500" />}
                title="Verifying Payment"
                message="Please wait while we confirm your payment..."
              />
            )}
            {status === 'success' && (
              <StatusMessage
                icon={<CheckCircle className="h-12 w-12 text-green-500" />}
                title="Payment Successful!"
                message="Your subscription has been activated. Redirecting to dashboard..."
              />
            )}
            {status === 'error' && (
              <StatusMessage
                icon={<XCircle className="h-12 w-12 text-red-500" />}
                title="Verification Failed"
                message="There was a problem verifying your payment. Please contact support."
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center space-x-4 pt-6">
            {status === 'error' && (
              <>
                <Button variant="outline" onClick={() => router.push('/plans')}>
                  Back to Plans
                </Button>
                <Button onClick={() => router.push('/contact')}>
                  Contact Support
                </Button>
              </>
            )}
            {status === 'success' && (
              <Button onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
