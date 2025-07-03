"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Confetti from 'react-confetti';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const StatusMessage = ({ icon, title, message, action }: { 
  icon: React.ReactNode, 
  title: string, 
  message: string,
  action?: React.ReactNode 
}) => (
  <div className="flex flex-col items-center justify-center space-y-4 text-center">
    {icon}
    <h2 className="text-2xl font-bold">{title}</h2>
    <p className="text-muted-foreground">{message}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'retrying'>('verifying');
  const [retryCount, setRetryCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionId = searchParams.get('session_id');

  const verifyPayment = useCallback(async () => {
    if (!sessionId) {
      setStatus('error');
      setError('Invalid session ID');
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify payment');
      }

      if (data.status === 'complete') {
        setStatus('success');
        setShowConfetti(true);
        toast({
          title: 'Success!',
          description: 'Your payment was processed successfully',
        });
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } else if (data.status === 'pending' && retryCount < MAX_RETRIES) {
        setStatus('retrying');
        setRetryCount(prev => prev + 1);
        setTimeout(verifyPayment, RETRY_DELAY);
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      setStatus('error');
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  }, [sessionId, retryCount, router, toast]);

  useEffect(() => {
    verifyPayment();
  }, [verifyPayment]);

  const handleRetry = () => {
    setStatus('verifying');
    setError(null);
    setRetryCount(0);
    verifyPayment();
  };

  return (
    <div className="container relative flex-col items-center justify-center max-w-lg py-12">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <Card>
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold">Payment Status</h1>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          {status === 'verifying' && (
            <StatusMessage
              icon={<Loader2 className="w-12 h-12 text-blue-500 animate-spin" />}
              title="Verifying Payment"
              message="Please wait while we confirm your payment..."
            />
          )}

          {status === 'retrying' && (
            <StatusMessage
              icon={<RefreshCw className="w-12 h-12 text-blue-500 animate-spin" />}
              title="Checking Status"
              message={`Retrying verification (Attempt ${retryCount}/${MAX_RETRIES})...`}
            />
          )}

          {status === 'success' && (
            <StatusMessage
              icon={<CheckCircle className="w-12 h-12 text-green-500" />}
              title="Payment Successful!"
              message="Redirecting you to the dashboard..."
            />
          )}

          {status === 'error' && (
            <StatusMessage
              icon={<XCircle className="w-12 h-12 text-red-500" />}
              title="Payment Verification Failed"
              message={error || 'An error occurred while verifying your payment'}
              action={
                <Button onClick={handleRetry} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Verification
                </Button>
              }
            />
          )}
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
