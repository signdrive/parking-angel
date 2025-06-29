'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { SiteFooter } from '@/components/layout/site-footer'

interface PaymentStatus {
  status: 'loading' | 'success' | 'error' | 'processing'
  sessionId?: string
  customerEmail?: string
  subscriptionTier?: string
  error?: string
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')
  const tier = searchParams.get('tier')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ status: 'loading' })
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 20 // More retries
  const retryDelay = 1000 // Check every second

  useEffect(() => {
    if (!sessionId) {
      setPaymentStatus({ status: 'error', error: 'No session ID provided' })
      return
    }

    const verifyPayment = async () => {
      try {
        console.log(`Verifying payment (attempt ${retryCount + 1}/${maxRetries})...`);
        
        const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}&retry=${retryCount}`)
        const data = await response.json()

        console.log(`Payment verification response:`, data);

        if (response.ok && data.success) {
          setPaymentStatus({
            status: 'success',
            sessionId,
            customerEmail: data.customerEmail,
            subscriptionTier: data.subscriptionTier || tier
          })
          
          console.log('Payment verified successfully:', {
            customerEmail: data.customerEmail,
            tier: data.subscriptionTier,
            sessionId: data.sessionId,
            databaseUpdated: data.databaseUpdated
          });
          
          // Show success message for 2 seconds then redirect
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        } else if (response.status === 202 && data.shouldRetry && retryCount < maxRetries) {
          setPaymentStatus({
            status: 'processing',
            sessionId
          })
          // Retry after delay
          setTimeout(() => {
            setRetryCount(prev => prev + 1)
          }, retryDelay)
        } else if (retryCount < maxRetries) {
          // For other errors, retry if under max attempts
          console.log(`Payment verification failed, retrying (${retryCount + 1}/${maxRetries})...`, data);
          
          setTimeout(() => {
            setRetryCount(prev => prev + 1)
          }, retryDelay)
        } else {
          console.error('Payment verification failed after max retries:', data);
          
          setPaymentStatus({
            status: 'error',
            error: data.error || 'Failed to verify payment'
          })
        }
      } catch (error) {
        console.error('Payment verification error:', error)
        if (retryCount < maxRetries) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1)
          }, retryDelay)
        } else {
          setPaymentStatus({
            status: 'error',
            error: 'Failed to verify payment status after multiple attempts'
          })
        }
      }
    }

    verifyPayment()
  }, [sessionId, retryCount, tier, router])

  // Map tier code to readable name
  const getTierName = (tierCode?: string) => {
    switch(tierCode) {
      case 'navigator': 
      case 'premium': 
        return 'Navigator';
      case 'pro_parker': 
      case 'pro': 
        return 'Pro Parker';
      case 'fleet_manager': 
      case 'enterprise': 
        return 'Fleet Manager';
      default: 
        return tierCode || 'Premium';
    }
  };

  if (paymentStatus.status === 'loading' || paymentStatus.status === 'processing') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-8 max-w-md w-full text-center">
            <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {paymentStatus.status === 'processing' ? 'Processing Payment...' : 'Verifying Payment...'}
            </h1>
            <p className="text-gray-600">
              {paymentStatus.status === 'processing' 
                ? 'Your payment is being processed. This may take a moment...'
                : 'Please wait while we confirm your subscription.'}
            </p>
            {retryCount > 5 && (
              <p className="text-sm text-gray-500 mt-4">
                This is taking longer than expected. Please wait...
              </p>
            )}
          </Card>
        </div>
        <SiteFooter />
      </div>
    )
  }

  if (paymentStatus.status === 'success') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your subscription to the {getTierName(paymentStatus.subscriptionTier)} plan.
              {paymentStatus.customerEmail && (
                <span> A confirmation email has been sent to {paymentStatus.customerEmail}.</span>
              )}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Redirecting to dashboard...
            </p>
          </Card>
        </div>
        <SiteFooter />
      </div>
    )
  }

  if (paymentStatus.status === 'error') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-red-50 to-pink-100">
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification Error</h1>
            <p className="text-gray-600 mb-6">{paymentStatus.error || 'An error occurred while verifying your payment.'}</p>
            <p className="text-sm text-gray-500 mb-4">
              Your payment may have still been successful. Please check your email for a receipt from Stripe.
            </p>
            <div className="flex flex-col space-y-3">
              <Link href="/dashboard">
                <Button variant="default" size="lg" className="w-full">Go to Dashboard</Button>
              </Link>
              <Link href="/subscription">
                <Button variant="secondary" size="lg" className="w-full">Return to Subscription Page</Button>
              </Link>
            </div>
          </Card>
        </div>
        <SiteFooter />
      </div>
    )
  }

  return null
}
