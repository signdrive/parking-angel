"use client"

import { useState, useEffect } from "react"
import { MapPin, Clock, DollarSign, Navigation, Filter, List, MapIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ParkingSpot {
  id: string
  name: string
  address: string
  price: number
  distance: number
  availability: "available" | "limited" | "full"
  features: string[]
  walkTime: number
  rating: number
  lat: number
  lng: number
}

const mockSpots: ParkingSpot[] = [
  {
    id: "1",
    name: "Downtown Plaza Garage",
    address: "123 Main St",
    price: 12,
    distance: 0.2,
    availability: "available",
    features: ["Covered", "Security", "EV Charging"],
    walkTime: 3,
    rating: 4.8,
    lat: 40.7128,
    lng: -74.006,
  },
  {
    id: "2",
    name: "City Center Lot",
    address: "456 Broadway",
    price: 8,
    distance: 0.4,
    availability: "limited",
    features: ["24/7 Access", "Security"],
    walkTime: 5,
    rating: 4.5,
    lat: 40.713,
    lng: -74.0058,
  },
  {
    id: "3",
    name: "Metro Station Parking",
    address: "789 Transit Ave",
    price: 15,
    distance: 0.1,
    availability: "available",
    features: ["Covered", "Valet", "Car Wash"],
    walkTime: 2,
    rating: 4.9,
    lat: 40.7126,
    lng: -74.0062,
  },
]

export default function MobileFinder() {
  const [viewMode, setViewMode] = useState<"list" | "map">("list")
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available":
        return "bg-green-500"
      case "limited":
        return "bg-yellow-500"
      case "full":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case "available":
        return "Available"
      case "limited":
        return "Few spots left"
      case "full":
        return "Full"
      default:
        return "Unknown"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        </div>

        {/* Controls Skeleton */}
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="flex gap-2 mb-3">
            <div className="h-10 bg-gray-200 rounded flex-1 animate-pulse"></div>
            <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Spots Skeleton */}
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse mb-3"></div>
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900">Find Parking</h1>
        <p className="text-sm text-gray-600">Downtown San Francisco • Now</p>
      </div>

      {/* Search & Controls */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Enter destination"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button variant="outline" size="sm" className="px-3">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="flex items-center gap-1"
          >
            <List className="w-4 h-4" />
            List
          </Button>
          <Button
            variant={viewMode === "map" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("map")}
            className="flex items-center gap-1"
          >
            <MapIcon className="w-4 h-4" />
            Map
          </Button>
        </div>
      </div>

      {/* Results */}
      {viewMode === "list" ? (
        <div className="p-4 space-y-3">
          {mockSpots.map((spot) => (
            <Card key={spot.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{spot.name}</h3>
                    <p className="text-sm text-gray-600">{spot.address}</p>
                  </div>
                  <Badge className={`${getAvailabilityColor(spot.availability)} text-white`}>
                    {getAvailabilityText(spot.availability)}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Navigation className="w-4 h-4" />
                    {spot.distance} mi
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {spot.walkTime} min walk
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    {spot.rating}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {spot.features.map((feature) => (
                    <Badge key={feature} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-green-600">${spot.price}</span>
                    <span className="text-sm text-gray-500">/hour</span>
                  </div>
                  <Button size="sm" onClick={() => setSelectedSpot(spot)} className="bg-blue-600 hover:bg-blue-700">
                    Reserve Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="relative h-96 bg-gray-200 m-4 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Interactive map view</p>
              <p className="text-sm text-gray-500">Showing {mockSpots.length} nearby spots</p>
            </div>
          </div>

          {/* Mock map pins */}
          <div className="absolute top-1/4 left-1/3 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">$12</span>
          </div>
          <div className="absolute top-1/2 right-1/3 w-6 h-6 bg-yellow-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">$8</span>
          </div>
          <div className="absolute bottom-1/3 left-1/2 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">$15</span>
          </div>
        </div>
      )}

      {/* Quick Booking Modal */}
      {selectedSpot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-6 animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>

            <h2 className="text-xl font-bold mb-2">{selectedSpot.name}</h2>
            <p className="text-gray-600 mb-4">{selectedSpot.address}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-semibold">2 hours</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <DollarSign className="w-5 h-5 mx-auto mb-1 text-green-600" />
                <p className="text-sm text-gray-600">Total</p>
                <p className="font-semibold text-green-600">${selectedSpot.price * 2}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedSpot(null)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700">Book Now</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
