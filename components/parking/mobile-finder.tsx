"use client"

import { useState, useEffect } from "react"
import { MapPin, Clock, DollarSign, Navigation, Filter, List, MapIcon, Search, Target, Car, Star, Route, Zap, Brain, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

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
  vehicleCompatible?: string[]
  confidence?: number
  predictedPrice?: number
}

interface VehicleType {
  id: string
  name: string
  icon: string
  color: string
}

const vehicleTypes: VehicleType[] = [
  { id: "car", name: "Car", icon: "🚗", color: "blue" },
  { id: "truck", name: "Truck/SUV", icon: "🚛", color: "orange" },
  { id: "motorcycle", name: "Motorcycle", icon: "🏍️", color: "green" },
  { id: "ev", name: "Electric", icon: "⚡", color: "purple" }
]

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
    vehicleCompatible: ["car", "truck", "ev"],
    confidence: 92,
    predictedPrice: 15
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
    vehicleCompatible: ["car", "motorcycle", "ev"],
    confidence: 78,
    predictedPrice: 10
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
    vehicleCompatible: ["car", "truck"],
    confidence: 85,
    predictedPrice: 12
  },
]

export default function MobileFinder() {
  const [searchStep, setSearchStep] = useState<"start" | "location" | "vehicle" | "results">("start")
  const [locationQuery, setLocationQuery] = useState("")
  const [selectedVehicle, setSelectedVehicle] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "map">("list")
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [filteredSpots, setFilteredSpots] = useState<ParkingSpot[]>([])
  const [sortBy, setSortBy] = useState<"distance" | "price" | "rating">("distance")

  // Filter spots by vehicle compatibility
  useEffect(() => {
    if (selectedVehicle) {
      const compatible = mockSpots.filter(spot => 
        spot.vehicleCompatible?.includes(selectedVehicle)
      )
      setFilteredSpots(compatible.sort((a, b) => {
        switch (sortBy) {
          case "distance": return a.distance - b.distance
          case "price": return a.price - b.price
          case "rating": return b.rating - a.rating
          default: return 0
        }
      }))
    }
  }, [selectedVehicle, sortBy])

  const handleLocationSubmit = () => {
    if (!locationQuery.trim()) return
    setSearchStep("vehicle")
  }

  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicle(vehicleId)
    setIsLoading(true)
    
    setTimeout(() => {
      setIsLoading(false)
      setSearchStep("results")
    }, 1500)
  }

  const resetSearch = () => {
    setSearchStep("start")
    setLocationQuery("")
    setSelectedVehicle("")
    setFilteredSpots([])
    setSelectedSpot(null)
  }

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

  // Start screen
  if (searchStep === "start") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-3">
              <Brain className="w-10 h-10 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Smart Parking</h1>
            </div>
            <p className="text-lg text-gray-600">AI-powered parking finder</p>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 max-w-sm mx-auto">
              <h2 className="text-xl font-semibold text-gray-900">Find Parking</h2>
              
              <div className="space-y-4">
                <Button 
                  className="w-full h-14 text-lg" 
                  onClick={() => setSearchStep("location")}
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search by Address
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full h-14 text-lg"
                  onClick={() => setSearchStep("location")}
                >
                  <Target className="w-5 h-5 mr-2" />
                  Use Current Location
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Location input step
  if (searchStep === "location") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={resetSearch}>
              ← Back
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Where to Park?</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <Card className="shadow-lg">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Enter destination</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Address, landmark, or area..."
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    className="pl-12 h-12 text-lg"
                    onKeyPress={(e) => e.key === 'Enter' && handleLocationSubmit()}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">Popular destinations:</p>
                <div className="flex flex-wrap gap-2">
                  {["Downtown", "Airport", "Mall", "Train Station"].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLocationQuery(suggestion)
                        handleLocationSubmit()
                      }}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                className="w-full h-12 text-lg" 
                onClick={handleLocationSubmit}
                disabled={!locationQuery.trim()}
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Vehicle selection step
  if (searchStep === "vehicle") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => setSearchStep("location")}>
              ← Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Vehicle Type</h1>
              <p className="text-sm text-gray-600">Parking near: {locationQuery}</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="space-y-4">
            <p className="text-center text-gray-600">What type of vehicle do you have?</p>
            
            <div className="grid grid-cols-2 gap-4">
              {vehicleTypes.map((vehicle) => (
                <Button
                  key={vehicle.id}
                  variant="outline"
                  className="h-24 flex flex-col items-center space-y-2 hover:bg-blue-50 hover:border-blue-300"
                  onClick={() => handleVehicleSelect(vehicle.id)}
                >
                  <div className="text-3xl">{vehicle.icon}</div>
                  <div className="font-medium text-sm">{vehicle.name}</div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <h3 className="text-xl font-semibold">Finding Compatible Spots</h3>
          <p className="text-gray-600">
            Searching for {vehicleTypes.find(v => v.id === selectedVehicle)?.name} parking near {locationQuery}
          </p>
        </div>
      </div>
    )
  }

  // Results screen (enhanced)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back navigation */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => setSearchStep("vehicle")}>
            ← Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Parking Results</h1>
            <p className="text-sm text-gray-600">
              {vehicleTypes.find(v => v.id === selectedVehicle)?.name} spots near {locationQuery}
            </p>
          </div>
        </div>
      </div>

      {/* AI Insights Banner */}
      <div className="bg-blue-50 border-b border-blue-200 p-4">
        <div className="flex items-center space-x-3">
          <Brain className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">AI Recommendation</p>
            <p className="text-xs text-blue-700">
              Found {filteredSpots.length} compatible spots. Best time to park: now (low demand)
            </p>
          </div>
        </div>
      </div>

      {/* Search Controls */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex gap-2 mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={resetSearch}
            className="flex items-center gap-1"
          >
            <Search className="w-4 h-4" />
            New Search
          </Button>
          <div className="flex-1"></div>
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

        {/* Sort options */}
        <div className="flex gap-2">
          <Button
            variant={sortBy === "distance" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("distance")}
          >
            Distance
          </Button>
          <Button
            variant={sortBy === "price" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("price")}
          >
            Price
          </Button>
          <Button
            variant={sortBy === "rating" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("rating")}
          >
            Rating
          </Button>
        </div>
      </div>

      {/* Enhanced Results */}
      {viewMode === "list" ? (
        <div className="p-4 space-y-3">
          {filteredSpots.length === 0 ? (
            <div className="text-center py-8">
              <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Compatible Spots</h3>
              <p className="text-gray-600 mb-4">
                No parking spots found for {vehicleTypes.find(v => v.id === selectedVehicle)?.name} near {locationQuery}
              </p>
              <Button onClick={() => setSearchStep("vehicle")} variant="outline">
                Try Different Vehicle Type
              </Button>
            </div>
          ) : (
            filteredSpots.map((spot, index) => (
              <Card key={spot.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{spot.name}</h3>
                        {index === 0 && (
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            AI Recommended
                          </Badge>
                        )}
                      </div>
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

                  {/* Vehicle compatibility indicator */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-700 font-medium">
                        Compatible with {vehicleTypes.find(v => v.id === selectedVehicle)?.name}
                      </span>
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
                    <Button 
                      size="sm" 
                      onClick={() => setSelectedSpot(spot)} 
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Reserve Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="relative h-96 bg-gray-200 m-4 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Interactive map view</p>
              <p className="text-sm text-gray-500">
                Showing {filteredSpots.length} compatible spots for {vehicleTypes.find(v => v.id === selectedVehicle)?.name}
              </p>
            </div>
          </div>

          {/* Enhanced map pins with vehicle compatibility */}
          {filteredSpots.slice(0, 3).map((spot, index) => (
            <div 
              key={spot.id}
              className={`absolute w-8 h-8 ${getAvailabilityColor(spot.availability)} rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform`}
              style={{
                top: `${25 + index * 20}%`,
                left: `${30 + index * 15}%`
              }}
              onClick={() => setSelectedSpot(spot)}
            >
              <span className="text-white text-xs font-bold">${spot.price}</span>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Quick Booking Modal */}
      {selectedSpot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-6 animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>

            <h2 className="text-xl font-bold mb-2">{selectedSpot.name}</h2>
            <p className="text-gray-600 mb-4">{selectedSpot.address}</p>

            {/* Vehicle compatibility confirmation */}
            <div className="flex items-center gap-2 mb-4 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-700 font-medium">
                Perfect for your {vehicleTypes.find(v => v.id === selectedVehicle)?.name}
              </span>
            </div>

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
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                Book Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
