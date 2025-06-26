'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { SiteFooter } from '@/components/layout/site-footer'

interface PaymentStatus {
  status: 'loading' | 'success' | 'error'
  sessionId?: string
  customerEmail?: string
  subscriptionTier?: string
  error?: string
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ status: 'loading' })
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 5

  useEffect(() => {
    if (!sessionId) {
      setPaymentStatus({ status: 'error', error: 'No session ID provided' })
      return
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`)
        const data = await response.json()

        if (response.ok && data.success) {
          setPaymentStatus({
            status: 'success',
            sessionId,
            customerEmail: data.customerEmail,
            subscriptionTier: data.subscriptionTier
          })
        } else if (retryCount < maxRetries) {
          // Retry after 2 seconds
          setTimeout(() => {
            setRetryCount(prev => prev + 1)
          }, 2000)
        } else {
          setPaymentStatus({
            status: 'error',
            error: data.error || 'Failed to verify payment'
          })
        }
      } catch (error) {
        console.error('Payment verification error:', error)
        setPaymentStatus({
          status: 'error',
          error: 'Failed to verify payment status'
        })
      }
    }

    verifyPayment()
  }, [sessionId, retryCount])

  if (paymentStatus.status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-8 max-w-md w-full text-center">
            <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment...</h1>
            <p className="text-gray-600">
              Please wait while we confirm your subscription.
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h1>
            <p className="text-gray-600 mb-6">{paymentStatus.error}</p>
            <Link href="/subscription">
              <Button variant="secondary" size="lg" className="w-full">Try Again</Button>
            </Link>
          </Card>
        </div>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="flex-1 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to {paymentStatus.subscriptionTier}!</h1>
          <p className="text-gray-600 mb-4">
            Your payment was successful and your premium features are now unlocked.
          </p>
          {paymentStatus.customerEmail && (
            <p className="text-sm text-gray-500 mb-6">
              A confirmation email has been sent to {paymentStatus.customerEmail}
            </p>
          )}
          <div className="space-y-3">
            <Link href="/dashboard">
              <Button size="lg" className="w-full">Go to Dashboard</Button>
            </Link>
            <Link href="/parking-finder">
              <Button variant="outline" size="lg" className="w-full">Find Parking</Button>
            </Link>
          </div>
        </Card>
      </div>
      <SiteFooter />
    </div>
  )
}
