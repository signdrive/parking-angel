"use client"

import { useState } from "react"
import { Check, MapPin, Clock, Navigation, Share, Calendar, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ConfirmationProps {
  booking: {
    spotId: string
    spotName: string
    address: string
    duration: number
    startTime: string
    total: number
    confirmationCode: string
  }
  onClose: () => void
}

export default function ConfirmationScreen({ booking, onClose }: ConfirmationProps) {
  const [showQR, setShowQR] = useState(false)

  const endTime = new Date(Date.now() + booking.duration * 60 * 60 * 1000)
  const startTimeFormatted = booking.startTime === "now" ? "Now" : booking.startTime

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Header */}
      <div className="bg-green-500 text-white p-6 text-center">
        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-green-100">Your parking spot is reserved</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Confirmation Details */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold mb-2">{booking.spotName}</h2>
              <p className="text-gray-600 flex items-center justify-center gap-1">
                <MapPin className="w-4 h-4" />
                {booking.address}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-bold">{booking.duration} hours</p>
                <p className="text-xs text-gray-500">
                  {startTimeFormatted} - {endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 mx-auto mb-2 text-green-600 font-bold text-lg">$</div>
                <p className="text-sm text-gray-600">Total Paid</p>
                <p className="font-bold">${booking.total.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Including fees</p>
              </div>
            </div>

            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 mb-2">Confirmation Code</p>
              <Badge variant="outline" className="text-lg font-mono px-4 py-2">
                {booking.confirmationCode}
              </Badge>
            </div>

            {/* QR Code */}
            <div className="text-center mb-6">
              <Button variant="outline" onClick={() => setShowQR(!showQR)} className="mb-4">
                {showQR ? "Hide QR Code" : "Show QR Code"}
              </Button>

              {showQR && (
                <div className="w-32 h-32 bg-gray-200 mx-auto rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div
                      className="w-24 h-24 bg-black mx-auto mb-2 rounded"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23000'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23fff'/%3E%3Crect x='30' y='10' width='10' height='10' fill='%23fff'/%3E%3Crect x='50' y='10' width='10' height='10' fill='%23fff'/%3E%3Crect x='70' y='10' width='10' height='10' fill='%23fff'/%3E%3Crect x='10' y='30' width='10' height='10' fill='%23fff'/%3E%3Crect x='50' y='30' width='10' height='10' fill='%23fff'/%3E%3Crect x='70' y='30' width='10' height='10' fill='%23fff'/%3E%3Crect x='10' y='50' width='10' height='10' fill='%23fff'/%3E%3Crect x='30' y='50' width='10' height='10' fill='%23fff'/%3E%3Crect x='70' y='50' width='10' height='10' fill='%23fff'/%3E%3Crect x='10' y='70' width='10' height='10' fill='%23fff'/%3E%3Crect x='30' y='70' width='10' height='10' fill='%23fff'/%3E%3Crect x='50' y='70' width='10' height='10' fill='%23fff'/%3E%3C/svg%3E")`,
                        backgroundSize: "cover",
                      }}
                    ></div>
                    <p className="text-xs text-gray-600">Scan at gate</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Navigation className="w-4 h-4" />
            Get Directions
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Share className="w-4 h-4" />
            Share Details
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Add to Calendar
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Contact Support
          </Button>
        </div>

        {/* Important Info */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Important Information</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Arrive within 15 minutes of your start time</li>
              <li>• Keep your confirmation code handy</li>
              <li>• Extensions available through the app</li>
              <li>• Late fees apply after grace period</li>
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button className="w-full bg-blue-600 hover:bg-blue-700">Extend Parking Time</Button>
          <Button variant="outline" className="w-full" onClick={onClose}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
