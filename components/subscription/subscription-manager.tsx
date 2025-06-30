"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Star, Zap, Crown } from 'lucide-react'
import { useAuth } from '@/components/auth/auth-provider'
import { getBrowserClient } from '@/lib/supabase/browser'
import { usePriceTest, useUpsellTest } from '@/hooks/use-ab-testing'
import { PremiumFeatureService } from '@/lib/premium-features'
import type { UserSubscription } from '@/lib/premium-features'

interface SubscriptionTier {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  icon: React.ReactNode
  popular?: boolean
  current?: boolean
}

export function SubscriptionManager() {
  const auth = useAuth()
  const user = auth.user
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)

  // A/B Testing hooks
  const priceTest = usePriceTest()
  const upsellTest = useUpsellTest()

  const tiers: SubscriptionTier[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 0,
      interval: 'month',
      icon: <Star className="w-5 h-5" />,
      features: [
        'Find nearby parking spots',
        'Basic map view',
        'Community spot reporting',
        'Limited to 10 searches/day',
        'Ad-supported experience'
      ]
    },
    {
      id: 'pro_parker',
      name: 'Pro Parker',
      price: 19.99,
      interval: 'month',
      icon: <Zap className="w-5 h-5" />,
      popular: true,
      features: [
        'Unlimited parking searches',
        'Real-time availability updates',
        'Route integration & navigation',
        'Historical analytics',
        'Priority customer support',
        'Ad-free experience',
        'Smart notifications',
        'Parking time predictions'
      ]
    },
    {
      id: 'fleet_manager',
      name: 'Fleet Manager',
      price: 49.99,
      interval: 'month',
      icon: <Crown className="w-5 h-5" />,
      features: [
        'Everything in Pro Parker',
        'Multi-vehicle management',
        'Team dashboard access',
        'API access & integrations',
        'Bulk booking discounts',
        'Custom reporting tools',
        'Dedicated account manager',
        'SLA guarantees'
      ]
    }
  ]

  useEffect(() => {
    loadCurrentSubscription()
  }, [user])

  const loadCurrentSubscription = async () => {
    if (!user) return
    try {
      const premiumService = PremiumFeatureService.getInstance()
      const subscription = await premiumService.getUserSubscription(user.id)
      setCurrentSubscription(subscription)
    } catch (error) {

    }
  }

  const handleSubscriptionChange = async (tierId: string) => {
    if (!user) {
      const returnUrl = `/subscription?plan=${tierId}`
      window.location.href = `/auth/login?return_to=${encodeURIComponent(returnUrl)}`
      return
    }

    setLoading(true)
    setSelectedTier(tierId)

    try {
      if (tierId === 'basic') {
        await cancelSubscription()
      } else {
        await createCheckoutSession(tierId)
      }
    } catch (error) {

      alert('Failed to process subscription change. Please try again.')
    } finally {
      setLoading(false)
      setSelectedTier(null)
    }
  }

  const createCheckoutSession = async (tierId: string) => {
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: tierId,
          userId: user?.id,
          abTestVariant: priceTest.variant,
          abTestExperiment: 'pricing_test_2025'
        }),
      })

      const data = await response.json()

      if (response.status === 401 || data.requiresAuth) {
        const returnUrl = `/subscription?plan=${tierId}`
        window.location.href = `/auth/login?return_to=${encodeURIComponent(returnUrl)}`
        return
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      const { url } = data
      if (url) {
        if (upsellTest.variant === 'treatment') {
          await upsellTest.trackConversion('stripe_redirect')
        }
        window.location.href = url
      }
    } catch (error) {

      throw error
    }
  }

  const cancelSubscription = async () => {
    if (!currentSubscription) return

    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: currentSubscription.planId
        }),
      })

      if (response.ok) {
        await loadCurrentSubscription()
      } else {
        throw new Error('Failed to cancel subscription')
      }
    } catch (error) {

      throw error
    }
  }

  return (
    <div className="space-y-8">
      {currentSubscription && (
        <Card>
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>
              {currentSubscription.status === 'active' ? (
                <>
                  Your {currentSubscription.planId} plan is active until{' '}
                  {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}
                  {currentSubscription.cancelAtPeriodEnd && ' (Cancels at end of period)'}
                </>
              ) : (
                `Subscription status: ${currentSubscription.status}`
              )}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const isTestVariant = priceTest.variant === 'treatment'
          const adjustedPrice = isTestVariant && tier.id !== 'basic' 
            ? tier.price * 0.8  // 20% discount for test variant
            : tier.price
          
          return (
            <Card 
              key={tier.id} 
              className={`relative ${tier.popular ? 'border-blue-500 shadow-lg' : ''}`}
            >
              {tier.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                  Most Popular
                </Badge>
              )}
              {isTestVariant && tier.id !== 'basic' && (
                <Badge className="absolute -top-2 left-4 bg-orange-500">
                  Special Price
                </Badge>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  {tier.icon}
                </div>
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <CardDescription className="text-2xl font-bold">
                  {isTestVariant && tier.id !== 'basic' && (
                    <span className="text-sm line-through text-gray-500 mr-2">
                      ${tier.price}/mo
                    </span>
                  )}
                  {tier.price === 0 ? 'Free' : `$${adjustedPrice}/mo`}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={tier.popular ? 'default' : 'secondary'}
                  onClick={() => handleSubscriptionChange(tier.id)}
                  disabled={loading || (currentSubscription?.planId === tier.id)}
                >
                  {loading && selectedTier === tier.id ? (
                    'Processing...'
                  ) : currentSubscription?.planId === tier.id ? (
                    'Current Plan'
                  ) : tier.id === 'basic' ? (
                    'Downgrade to Free'
                  ) : (
                    'Upgrade Now'
                  )}
                </Button>

                {tier.id !== 'basic' && (
                  <p className="text-xs text-gray-500 text-center">
                    7-day free trial • Cancel anytime
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
