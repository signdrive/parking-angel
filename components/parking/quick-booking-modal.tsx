"use client"

import { useState } from "react"
import { CreditCard, MapPin, Car, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface BookingModalProps {
  spot: {
    id: string
    name: string
    address: string
    price: number
    features: string[]
  }
  onClose: () => void
  onConfirm: (booking: any) => void
}

export default function QuickBookingModal({ spot, onClose, onConfirm }: BookingModalProps) {
  const [step, setStep] = useState(1)
  const [duration, setDuration] = useState(2)
  const [startTime, setStartTime] = useState("now")
  const [paymentMethod, setPaymentMethod] = useState("card-1234")
  const [isProcessing, setIsProcessing] = useState(false)

  const timeOptions = [
    { value: "now", label: "Now", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
    {
      value: "30min",
      label: "In 30 min",
      time: new Date(Date.now() + 30 * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
    {
      value: "1hour",
      label: "In 1 hour",
      time: new Date(Date.now() + 60 * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]

  const durationOptions = [1, 2, 3, 4, 6, 8]

  const total = spot.price * duration
  const serviceFee = 1.5
  const finalTotal = total + serviceFee

  const handleConfirm = async () => {
    setIsProcessing(true)

    // Simulate booking process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const booking = {
      spotId: spot.id,
      spotName: spot.name,
      address: spot.address,
      duration,
      startTime,
      total: finalTotal,
      confirmationCode: "PK" + Math.random().toString(36).substr(2, 6).toUpperCase(),
    }

    onConfirm(booking)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        {/* Handle */}
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-4"></div>

        {step === 1 && (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-2">Book Parking</h2>
            <div className="flex items-center gap-2 text-gray-600 mb-6">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{spot.name}</span>
            </div>

            {/* Time Selection */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">When do you need parking?</h3>
              <div className="grid grid-cols-1 gap-2">
                {timeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStartTime(option.value)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      startTime === option.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.time}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Selection */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">How long will you park?</h3>
              <div className="grid grid-cols-3 gap-2">
                {durationOptions.map((hours) => (
                  <button
                    key={hours}
                    onClick={() => setDuration(hours)}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      duration === hours ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-medium">{hours}h</div>
                    <div className="text-sm text-gray-600">${spot.price * hours}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Included features</h3>
              <div className="flex flex-wrap gap-2">
                {spot.features.map((feature) => (
                  <Badge key={feature} variant="secondary" className="flex items-center gap-1">
                    {feature === "Security" && <Shield className="w-3 h-3" />}
                    {feature === "EV Charging" && <Zap className="w-3 h-3" />}
                    {feature === "Covered" && <Car className="w-3 h-3" />}
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span>Parking ({duration}h)</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                  <span>Service fee</span>
                  <span>${serviceFee.toFixed(2)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between items-center font-bold">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => setStep(2)}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6">Payment Method</h2>

            {/* Payment Methods */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => setPaymentMethod("card-1234")}
                className={`w-full p-4 rounded-lg border text-left transition-colors ${
                  paymentMethod === "card-1234" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5" />
                  <div>
                    <div className="font-medium">•••• •••• •••• 1234</div>
                    <div className="text-sm text-gray-600">Expires 12/25</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod("apple-pay")}
                className={`w-full p-4 rounded-lg border text-left transition-colors ${
                  paymentMethod === "apple-pay" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-black rounded flex items-center justify-center">
                    <span className="text-white text-xs">🍎</span>
                  </div>
                  <div>
                    <div className="font-medium">Apple Pay</div>
                    <div className="text-sm text-gray-600">Touch ID or Face ID</div>
                  </div>
                </div>
              </button>
            </div>

            {/* Final Summary */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location</span>
                    <span>{spot.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span>{duration} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start time</span>
                    <span>{timeOptions.find((t) => t.value === startTime)?.label}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleConfirm} disabled={isProcessing}>
                {isProcessing ? "Processing..." : "Confirm Booking"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
