'use client'

import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (sessionId) {
      verifyPayment(sessionId);
    } else {
      setPaymentStatus({ 
        status: 'error', 
        error: 'No session ID provided' 
      });
    }
  }, [sessionId]);

  const verifyPayment = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`);
      const data = await response.json();        if (response.ok && data.success) {
          setPaymentStatus({
            status: 'success',
            sessionId,
            customerEmail: data.customerEmail,
            subscriptionTier: data.subscriptionTier
          });
          
          // Log successful payment for analytics
          console.log('Payment verification successful:', {
            sessionId,
            subscriptionTier: data.subscriptionTier,
            customerEmail: data.customerEmail
          });
        } else {
          console.error('Payment verification failed:', data);
          setPaymentStatus({
            status: 'error',
            error: data.error || 'Payment verification failed'
          });
        }
    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentStatus({
        status: 'error',
        error: 'Failed to verify payment'
      });
    }
  };

  if (paymentStatus.status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment...</h1>
            <p className="text-gray-600">Please wait while we confirm your subscription.</p>
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
