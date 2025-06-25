"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, DollarSign, Shield, Zap, CreditCard } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { toast } from "@/components/ui/use-toast"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface HoldSpotModalProps {
  isOpen: boolean
  onClose: () => void
  spot: {
    id: string
    name: string
    address?: string
    latitude: number
    longitude: number
    price_per_hour?: number
    features?: string[]
  }
  onHoldCreated?: (holdData: any) => void
}

const HOLD_OPTIONS = [
  {
    duration: 15,
    price: 0.99,
    label: "Quick Hold",
    description: "Perfect for short errands",
    popular: false,
  },
  {
    duration: 30,
    price: 1.99,
    label: "Standard Hold",
    description: "Most popular choice",
    popular: true,
  },
  {
    duration: 60,
    price: 3.99,
    label: "Extended Hold",
    description: "For longer appointments",
    popular: false,
  },
] as const

function HoldSpotForm({ spot, onClose, onHoldCreated }: Omit<HoldSpotModalProps, 'isOpen'>) {
  const [selectedDuration, setSelectedDuration] = useState<15 | 30 | 60>(30)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'select' | 'payment' | 'processing'>('select')
  const [paymentIntent, setPaymentIntent] = useState<any>(null)

  const stripe = useStripe()
  const elements = useElements()

  const selectedOption = HOLD_OPTIONS.find(opt => opt.duration === selectedDuration)!

  const handleCreateHold = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/spots/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spotId: spot.id,
          duration: selectedDuration,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create hold')
      }

      setPaymentIntent(data.paymentIntent)
      setStep('payment')

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!stripe || !elements || !paymentIntent) return

    setStep('processing')
    
    const cardElement = elements.getElement(CardElement)
    if (!cardElement) return

    try {
      const { error, paymentIntent: confirmedPayment } = await stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      )

      if (error) {
        throw new Error(error.message)
      }

      if (confirmedPayment?.status === 'succeeded') {
        toast({
          title: "Success!",
          description: `Spot held for ${selectedDuration} minutes`,
        })
        
        onHoldCreated?.({
          duration: selectedDuration,
          expiresAt: new Date(Date.now() + selectedDuration * 60 * 1000),
          amount: selectedOption.price,
        })
        
        onClose()
      }

    } catch (error: any) {
      toast({
        title: "Payment failed",
        description: error.message,
        variant: "destructive",
      })
      setStep('payment')
    }
  }

  if (step === 'select') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
          <Shield className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="font-semibold text-blue-900">Guaranteed Parking</h3>
            <p className="text-sm text-blue-700">Reserve this spot and we'll hold it just for you</p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Choose hold duration:</h3>
          {HOLD_OPTIONS.map((option) => (
            <Card 
              key={option.duration}
              className={`cursor-pointer transition-all ${
                selectedDuration === option.duration 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedDuration(option.duration)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedDuration === option.duration 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'border-gray-300'
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{option.label}</span>
                        {option.popular && (
                          <Badge variant="secondary" className="text-xs">Most Popular</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">${option.price}</div>
                    <div className="text-sm text-gray-600">{option.duration} min</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleCreateHold} 
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Creating..." : `Hold for $${selectedOption.price}`}
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'payment') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="font-semibold text-lg">Secure Payment</h3>
          <p className="text-gray-600">Complete payment to hold your spot</p>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Spot hold ({selectedDuration} min)</span>
                <span>${selectedOption.price}</span>
              </div>
              <hr />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${selectedOption.price}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <CardElement 
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                },
              }}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('select')} className="flex-1">
              Back
            </Button>
            <Button 
              onClick={handlePayment}
              disabled={!stripe || !elements}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Pay ${selectedOption.price}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
        <Zap className="w-8 h-8 text-blue-600 animate-pulse" />
      </div>
      <h3 className="font-semibold text-lg">Processing Payment...</h3>
      <p className="text-gray-600">Please wait while we secure your spot</p>
    </div>
  )
}

export function HoldSpotModal({ isOpen, onClose, spot, onHoldCreated }: HoldSpotModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Hold This Spot
          </DialogTitle>
          <div className="text-sm text-gray-600">
            <p className="font-medium">{spot.name}</p>
            {spot.address && <p>{spot.address}</p>}
          </div>
        </DialogHeader>
        
        <Elements stripe={stripePromise}>
          <HoldSpotForm 
            spot={spot}
            onClose={onClose}
            onHoldCreated={onHoldCreated}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  )
}
