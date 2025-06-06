"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MapPin, Brain, Clock, Navigation, Filter, Zap, TrendingUp } from "lucide-react"
import { PredictionDashboard } from "@/components/ai/prediction-dashboard"

interface SmartParkingSpot {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  currentPrice: number
  predictedPrice: number
  currentAvailability: "available" | "occupied" | "unknown"
  predictedAvailability: number
  confidence: number
  walkingDistance: number
  features: string[]
}

export function SmartParkingFinder() {
  const [spots, setSpots] = useState<SmartParkingSpot[]>([])
  const [selectedSpot, setSelectedSpot] = useState<SmartParkingSpot | null>(null)
  const [searchLocation, setSearchLocation] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPredictions, setShowPredictions] = useState(false)

  // Mock data - in production, this would come from your API
  useEffect(() => {
    const mockSpots: SmartParkingSpot[] = [
      {
        id: "1",
        name: "Downtown Parking Garage",
        address: "123 Main St",
        latitude: 37.7749,
        longitude: -122.4194,
        currentPrice: 8,
        predictedPrice: 12,
        currentAvailability: "available",
        predictedAvailability: 85,
        confidence: 92,
        walkingDistance: 150,
        features: ["Covered", "Security", "EV Charging"],
      },
      {
        id: "2",
        name: "City Center Lot",
        address: "456 Oak Ave",
        latitude: 37.7849,
        longitude: -122.4094,
        currentPrice: 5,
        predictedPrice: 5,
        currentAvailability: "occupied",
        predictedAvailability: 45,
        confidence: 78,
        walkingDistance: 200,
        features: ["Outdoor", "Accessible"],
      },
      {
        id: "3",
        name: "Smart Parking Plaza",
        address: "789 Pine St",
        latitude: 37.7649,
        longitude: -122.4294,
        currentPrice: 10,
        predictedPrice: 8,
        currentAvailability: "available",
        predictedAvailability: 95,
        confidence: 88,
        walkingDistance: 100,
        features: ["Covered", "Security", "Valet", "EV Charging"],
      },
    ]
    setSpots(mockSpots)
  }, [])

  const getAvailabilityColor = (availability: number): string => {
    if (availability >= 70) return "bg-green-500"
    if (availability >= 40) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getAvailabilityText = (availability: number): string => {
    if (availability >= 70) return "High"
    if (availability >= 40) return "Medium"
    return "Low"
  }

  const getPriceChangeIcon = (current: number, predicted: number) => {
    if (predicted > current) return <TrendingUp className="w-3 h-3 text-red-500" />
    if (predicted < current) return <TrendingUp className="w-3 h-3 text-green-500 rotate-180" />
    return null
  }

  const handleBookingAction = (action: "book_now" | "wait" | "find_alternative") => {
    switch (action) {
      case "book_now":
        alert("Booking spot now!")
        break
      case "wait":
        alert("Setting availability alert!")
        break
      case "find_alternative":
        alert("Finding alternative spots!")
        break
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Brain className="w-6 h-6" />
            AI-Powered Smart Parking
          </CardTitle>
          <p className="text-blue-100">Find the perfect parking spot with AI predictions and real-time intelligence</p>
        </CardHeader>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input
              placeholder="Where do you need to park?"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="flex-1"
            />
            <Button onClick={() => setLoading(true)}>
              <MapPin className="w-4 h-4 mr-2" />
              Find Spots
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights Banner */}
      <Card className="border-l-4 border-l-blue-500 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">AI Insight</span>
          </div>
          <p className="text-blue-800 text-sm">
            Based on current patterns, parking demand will increase by 35% in the next hour due to nearby events. Book
            now to secure the best rates!
          </p>
        </CardContent>
      </Card>

      {/* Spots List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Available Spots</h3>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {spots.map((spot) => (
            <Card
              key={spot.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedSpot?.id === spot.id ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => {
                setSelectedSpot(spot)
                setShowPredictions(true)
              }}
            >
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{spot.name}</h4>
                      <p className="text-sm text-gray-600">{spot.address}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <span className="font-bold">${spot.currentPrice}/hr</span>
                        {getPriceChangeIcon(spot.currentPrice, spot.predictedPrice)}
                      </div>
                      {spot.predictedPrice !== spot.currentPrice && (
                        <div className="text-xs text-gray-500">Predicted: ${spot.predictedPrice}/hr</div>
                      )}
                    </div>
                  </div>

                  {/* Availability Prediction */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getAvailabilityColor(spot.predictedAvailability)}`} />
                      <span className="text-sm font-medium">
                        {getAvailabilityText(spot.predictedAvailability)} Availability
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {spot.confidence}% confident
                    </Badge>
                  </div>

                  {/* Features */}
                  <div className="flex gap-1 flex-wrap">
                    {spot.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>

                  {/* Distance & Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Navigation className="w-3 h-3" />
                      {spot.walkingDistance}m walk
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        Reserve
                      </Button>
                      <Button size="sm">
                        <Brain className="w-3 h-3 mr-1" />
                        AI Predict
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Prediction Panel */}
        <div className="lg:sticky lg:top-4">
          {selectedSpot && showPredictions ? (
            <PredictionDashboard
              spotId={selectedSpot.id}
              spotName={selectedSpot.name}
              onBookingAction={handleBookingAction}
            />
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a parking spot to see AI predictions</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
