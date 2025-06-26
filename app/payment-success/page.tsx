'use client'

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";

interface PaymentStatus {
  status: 'loading' | 'success' | 'error';
  sessionId?: string;
  customerEmail?: string;
  subscriptionTier?: string;
  error?: string;
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ status: 'loading' });
  const [pollCount, setPollCount] = useState(0);
  const maxPolls = 15; // 15 x 2s = 30 seconds
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setPaymentStatus({ status: 'error', error: 'No session ID provided' });
      return;
    }
    let cancelled = false;
    const poll = async () => {
      try {
        const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`);
        const data = await response.json();
        if (response.ok && data.success) {
          if (!cancelled) {
            setPaymentStatus({
              status: 'success',
              sessionId,
              customerEmail: data.customerEmail,
              subscriptionTier: data.subscriptionTier
            });
          }
        } else if (pollCount < maxPolls) {
          pollingRef.current = setTimeout(() => setPollCount(c => c + 1), 2000);
        } else {
          if (!cancelled) {
            setPaymentStatus({
              status: 'error',
              error: 'Payment verification is taking longer than expected. Please check your email or contact support.'
            });
          }
        }
      } catch (error) {
        if (!cancelled) {
          setPaymentStatus({ status: 'error', error: 'Failed to verify payment' });
        }
      }
    };
    poll();
    return () => {
      cancelled = true;
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, pollCount]);

  if (paymentStatus.status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment...</h1>
            <p className="text-gray-600">
              {pollCount < maxPolls
                ? 'This may take a few seconds while we confirm your subscription. Please do not close this page.'
                : 'Still waiting for confirmation from Stripe. You may refresh this page or check your email for confirmation.'}
            </p>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (paymentStatus.status === 'error') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-red-50 to-pink-100">
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-2xl">❌</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification Failed</h1>
            <p className="text-gray-600 mb-6">{paymentStatus.error}</p>
            <div className="space-y-3">
              <Link href="/subscription">
                <Button size="lg" className="w-full">Try Again</Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="w-full">Contact Support</Button>
              </Link>
            </div>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-4">
            Welcome to {paymentStatus.subscriptionTier} tier! Your premium features are now unlocked.
          </p>
          {paymentStatus.customerEmail && (
            <p className="text-sm text-gray-500 mb-6">
              A confirmation email has been sent to {paymentStatus.customerEmail}
            </p>
          )}
          <Link href="/dashboard">
            <Button size="lg" className="w-full">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
