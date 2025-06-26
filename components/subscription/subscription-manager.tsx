"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Star, Zap, Crown } from 'lucide-react'
import { useAuth } from '@/components/auth/auth-provider'
import { getBrowserClient } from '@/lib/supabase/browser'
import { usePriceTest, useUpsellTest } from '@/hooks/use-ab-testing'

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

interface UserSubscription {
  tier: string
  status: 'active' | 'cancelled' | 'past_due'
  current_period_end: string
  cancel_at_period_end: boolean
}

export function SubscriptionManager() {
  const { user } = useAuth()
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)

  // A/B Testing hooks
  const priceTest = usePriceTest()
  const upsellTest = useUpsellTest()

  // Get pricing based on A/B test variant
  const getPricing = (baseTier: SubscriptionTier) => {
    if (priceTest.isLoading) return baseTier

    const variantData = priceTest.getVariantData()
    if (priceTest.variant === 'treatment' && variantData?.pricing) {
      return {
        ...baseTier,
        price: variantData.pricing[baseTier.id] || baseTier.price
      }
    }
    return baseTier
  }

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
      id: 'pro',
      name: 'Pro',
      price: 11.99,
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
      id: 'elite',
      name: 'Elite',
      price: 29.99,
      interval: 'month',
      icon: <Crown className="w-5 h-5" />,
      features: [
        'Everything in Pro',
        'AI-powered parking predictions',
        'Concierge parking service',
        'Premium spot reservations',
        'VIP customer support',
        'Advanced analytics dashboard',
        'Multi-city trip planning',
        'White-glove onboarding'
      ]
    }
  ]

  useEffect(() => {
    loadCurrentSubscription()
  }, [user])
  const loadCurrentSubscription = async () => {
    if (!user) return

    try {
      const supabase = getBrowserClient()
      // Since subscriptions table doesn't exist yet, we'll use profiles table
      // and add subscription info there or mock it for now
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('id', user.id)
        .single()

      if (data) {
        // Mock subscription data for now
        setCurrentSubscription({
          tier: 'basic',
          status: 'active',
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancel_at_period_end: false
        })
        
        // Mark current tier as basic for now
        tiers.forEach(tier => {
          tier.current = tier.id === 'basic'
        })
      }
    } catch (error) {
      console.error('Error loading subscription:', error)
    }
  }

  const handleSubscriptionChange = async (tierId: string) => {
    if (!user) {
      // Redirect to login page with return URL
      const returnUrl = `/subscription?plan=${tierId}`;
      window.location.href = `/auth/login?return_to=${encodeURIComponent(returnUrl)}`;
      return;
    }

    setLoading(true)
    setSelectedTier(tierId)

    try {
      if (tierId === 'basic') {
        // Handle downgrade to free tier
        await cancelSubscription()
      } else {
        // Handle upgrade/change to paid tier
        await createCheckoutSession(tierId)
      }
    } catch (error) {
      console.error('Error changing subscription:', error)
    } finally {
      setLoading(false)
      setSelectedTier(null)
    }
  }
  const createCheckoutSession = async (tierId: string) => {
    // Check if user is authenticated
    if (!user) {
      // Redirect to login page with return URL
      const returnUrl = `/subscription?plan=${tierId}`;
      window.location.href = `/auth/login?return_to=${encodeURIComponent(returnUrl)}`;
      return;
    }

    // Track A/B test conversion before checkout
    if (priceTest.variant === 'treatment') {
      await priceTest.trackConversion('checkout_initiated', tiers.find(t => t.id === tierId)?.price)
    }

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: `price_${tierId}`, // Stripe price IDs
          tier: tierId,
          userId: user?.id,
          abTestVariant: priceTest.variant,
          abTestExperiment: 'pricing_test_2025'
        }),
      })

      const data = await response.json();

      // Handle authentication required
      if (response.status === 401 || data.requiresAuth) {
          const returnUrl = `/subscription?plan=${tierId}`;
          window.location.href = `/auth/login?return_to=${encodeURIComponent(returnUrl)}`;
          return;
      }

      if (!response.ok) {
          throw new Error(data.error || 'Failed to create checkout session');
      }

      const { url } = data;
      if (url) {
        // Track upsell test if applicable
        if (upsellTest.variant === 'treatment') {
          await upsellTest.trackConversion('stripe_redirect')
        }
        window.location.href = url
      }
    } catch (error) {
      console.error('Checkout error:', error);
      // You could show a toast notification here
      alert('Failed to start checkout. Please try again.');
    }
  }

  const cancelSubscription = async () => {
    if (!currentSubscription) return

    const response = await fetch('/api/stripe/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId: currentSubscription.tier
      }),
    })

    if (response.ok) {
      await loadCurrentSubscription()
    }
  }

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price}/month`
  }

  return (
    <div className="space-y-8">
      {/* Current subscription status */}
      {currentSubscription && (
        <Card>
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>
              Your {currentSubscription.tier} plan is {currentSubscription.status}
              {currentSubscription.current_period_end && (
                <>
                  {' '}until {new Date(currentSubscription.current_period_end).toLocaleDateString()}
                </>
              )}
            </CardDescription>
          </CardHeader>
        </Card>
      )}      {/* Subscription tiers */}
      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const adjustedTier = getPricing(tier)
          const isTestVariant = priceTest.variant === 'treatment' && adjustedTier.price !== tier.price
          
          return (
            <Card 
              key={tier.id} 
              className={`relative ${tier.popular ? 'border-blue-500 shadow-lg' : ''} ${tier.current ? 'bg-blue-50' : ''}`}
            >
              {tier.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                  Most Popular
                </Badge>
              )}
              {tier.current && (
                <Badge className="absolute -top-2 right-4 bg-green-500">
                  Current Plan
                </Badge>
              )}
              {isTestVariant && (
                <Badge className="absolute -top-2 left-4 bg-orange-500">
                  Special Price
                </Badge>
              )}

            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                {tier.icon}
              </div>
              <CardTitle className="text-xl">{tier.name}</CardTitle>              <CardDescription className="text-2xl font-bold">
                {isTestVariant && (
                  <span className="text-sm line-through text-gray-500 mr-2">
                    {formatPrice(tier.price)}
                  </span>
                )}
                {formatPrice(adjustedTier.price)}
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
                variant={tier.current ? 'outline' : tier.popular ? 'default' : 'secondary'}
                onClick={() => handleSubscriptionChange(tier.id)}
                disabled={loading || tier.current}
              >
                {loading && selectedTier === tier.id ? (
                  'Processing...'
                ) : tier.current ? (
                  'Current Plan'
                ) : tier.id === 'basic' ? (
                  'Downgrade to Free'
                ) : currentSubscription ? (
                  'Change Plan'
                ) : (
                  'Get Started'
                )}
              </Button>

              {tier.id !== 'basic' && (
                <p className="text-xs text-gray-500 text-center">
                  Cancel anytime. No hidden fees.
                </p>
              )}            </CardContent>
          </Card>
        )})}
      </div>

      {/* Feature comparison table */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
          <CardDescription>
            See what's included with each subscription tier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Feature</th>
                  <th className="text-center py-2">Basic</th>
                  <th className="text-center py-2">Pro</th>
                  <th className="text-center py-2">Elite</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                <tr className="border-b">
                  <td className="py-2">Parking searches per day</td>
                  <td className="text-center">10</td>
                  <td className="text-center">Unlimited</td>
                  <td className="text-center">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Real-time updates</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">✅</td>
                  <td className="text-center">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">AI predictions</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Concierge service</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Customer support</td>
                  <td className="text-center">Community</td>
                  <td className="text-center">Priority</td>
                  <td className="text-center">VIP</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
