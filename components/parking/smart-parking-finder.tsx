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
  vehicleCompatibility: {
    car: boolean
    truck: boolean
    motorcycle: boolean
    ev: boolean
    oversized: boolean
  }
  restrictions: string[]
}

interface VehicleType {
  id: string
  name: string
  icon: string
  requirements: string[]
}

export function SmartParkingFinder() {
  const [spots, setSpots] = useState<SmartParkingSpot[]>([])
  const [filteredSpots, setFilteredSpots] = useState<SmartParkingSpot[]>([])
  const [selectedSpot, setSelectedSpot] = useState<SmartParkingSpot | null>(null)
  const [searchLocation, setSearchLocation] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number, address: string} | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<string>("")
  const [searchStep, setSearchStep] = useState<"location" | "vehicle" | "results">("location")
  const [locationMethod, setLocationMethod] = useState<"search" | "map" | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPredictions, setShowPredictions] = useState(false)

  const vehicleTypes: VehicleType[] = [
    {
      id: "car",
      name: "Standard Car",
      icon: "🚗",
      requirements: ["Standard parking space", "Height clearance 7ft"]
    },
    {
      id: "truck",
      name: "Truck/Large Vehicle",
      icon: "🚛",
      requirements: ["Large vehicle space", "Height clearance 10ft+", "Weight capacity"]
    },
    {
      id: "motorcycle",
      name: "Motorcycle",
      icon: "🏍️", 
      requirements: ["Motorcycle parking", "Secure area"]
    },
    {
      id: "ev",
      name: "Electric Vehicle",
      icon: "⚡",
      requirements: ["EV charging station", "Standard parking space"]
    },
    {
      id: "oversized",
      name: "Oversized Vehicle",
      icon: "🚌",
      requirements: ["Oversized parking", "Special clearance", "Weight capacity"]
    }
  ]

  // Mock data with vehicle compatibility - in production, this would come from your API
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
        vehicleCompatibility: {
          car: true,
          truck: false,
          motorcycle: true,
          ev: true,
          oversized: false
        },
        restrictions: ["Max height 7ft", "No RVs"]
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
        vehicleCompatibility: {
          car: true,
          truck: true,
          motorcycle: true,
          ev: false,
          oversized: true
        },
        restrictions: ["24-hour access"]
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
        vehicleCompatibility: {
          car: true,
          truck: false,
          motorcycle: true,
          ev: true,
          oversized: false
        },
        restrictions: ["Premium access only", "Max height 6.5ft"]
      },
    ]
    setSpots(mockSpots)
  }, [])

  // Filter spots based on vehicle compatibility
  useEffect(() => {
    if (!selectedVehicle) {
      setFilteredSpots(spots)
      return
    }

    const compatible = spots.filter(spot => {
      return spot.vehicleCompatibility[selectedVehicle as keyof typeof spot.vehicleCompatibility]
    })
    
    setFilteredSpots(compatible)
  }, [spots, selectedVehicle])

  const handleLocationSearch = () => {
    if (!searchLocation.trim()) return
    
    // Simulate geocoding - in production, use a real geocoding service
    const mockLocation = {
      lat: 37.7749 + (Math.random() - 0.5) * 0.1, // San Francisco area
      lng: -122.4194 + (Math.random() - 0.5) * 0.1,
      address: searchLocation
    }
    
    setSelectedLocation(mockLocation)
    setSearchStep("vehicle")
  }

  const handleMapSelection = (location: {lat: number, lng: number, address: string}) => {
    setSelectedLocation(location)
    setSearchStep("vehicle")
  }

  const handleLocationMethodSelect = (method: "search" | "map") => {
    setLocationMethod(method)
  }

  const handleVehicleSelection = (vehicleId: string) => {
    setSelectedVehicle(vehicleId)
    setLoading(true)
    
    // Simulate API call with actual location data
    setTimeout(() => {
      // Update mock spots to use selected location
      generateSpotsForLocation(selectedLocation!)
      setLoading(false)
      setSearchStep("results")
    }, 1500)
  }

  const generateSpotsForLocation = (location: {lat: number, lng: number, address: string}) => {
    const mockSpots: SmartParkingSpot[] = []
    const spotCount = Math.floor(Math.random() * 12) + 8 // 8-20 spots

    for (let i = 0; i < spotCount; i++) {
      // Generate spots around the selected location
      const angle = Math.random() * 2 * Math.PI
      const distance = Math.random() * 800 // Within 800m
      const lat = location.lat + (distance * Math.cos(angle)) / 111000
      const lng = location.lng + (distance * Math.sin(angle)) / (111000 * Math.cos(location.lat * Math.PI / 180))

      const spot: SmartParkingSpot = {
        id: `spot_${i}_${location.address.replace(/\s+/g, '_')}`,
        name: `Parking ${i + 1} - ${location.address}`,
        address: `${Math.floor(Math.random() * 999) + 1} ${['Main St', 'Oak Ave', 'Pine Blvd', 'Elm Dr', 'Park Way'][Math.floor(Math.random() * 5)]}`,
        latitude: lat,
        longitude: lng,
        currentPrice: 3 + Math.random() * 12,
        predictedPrice: 3 + Math.random() * 12,
        currentAvailability: Math.random() > 0.3 ? "available" : "occupied",
        predictedAvailability: Math.floor(Math.random() * 100),
        confidence: Math.floor(Math.random() * 40) + 60,
        walkingDistance: Math.floor(distance),
        features: [],
        vehicleCompatibility: {
          car: Math.random() > 0.1,
          truck: Math.random() > 0.7,
          motorcycle: Math.random() > 0.2,
          ev: Math.random() > 0.6,
          oversized: Math.random() > 0.8
        },
        restrictions: []
      }

      // Add random features
      if (Math.random() > 0.6) spot.features.push("Covered")
      if (Math.random() > 0.7) spot.features.push("Security")
      if (Math.random() > 0.8) spot.features.push("EV Charging")
      if (Math.random() > 0.9) spot.features.push("Valet")

      mockSpots.push(spot)
    }

    setSpots(mockSpots)
  }

  const handleBackToSearch = () => {
    setSearchStep("location")
    setSearchLocation("")
    setSelectedLocation(null)
    setSelectedVehicle("")
    setLocationMethod(null)
    setFilteredSpots([])
  }

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

  // Step 1: Location Selection Method
  if (searchStep === "location" && !locationMethod) {
    return (
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Brain className="w-6 h-6" />
              AI-Powered Smart Parking
            </CardTitle>
            <p className="text-blue-100">Find the perfect parking spot with AI predictions and real-time intelligence</p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              How would you like to choose your parking location?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Search Option */}
              <Button
                variant="outline"
                className="h-auto p-6 flex flex-col items-center space-y-4 hover:bg-blue-50 hover:border-blue-300"
                onClick={() => handleLocationMethodSelect("search")}
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">Search by Address</div>
                  <div className="text-sm text-gray-600 mt-2">
                    Enter an address, landmark, or area name to find nearby parking
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Example: "Times Square, NYC" or "123 Main Street"
                  </div>
                </div>
              </Button>

              {/* Map Option */}
              <Button
                variant="outline"
                className="h-auto p-6 flex flex-col items-center space-y-4 hover:bg-green-50 hover:border-green-300"
                onClick={() => handleLocationMethodSelect("map")}
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Navigation className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">Pick on Map</div>
                  <div className="text-sm text-gray-600 mt-2">
                    Use an interactive map to select exactly where you want to park
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Tap anywhere on the map to set your destination
                  </div>
                </div>
              </Button>
            </div>

            <div className="text-center text-sm text-gray-500">
              Both methods will show you parking spots compatible with your vehicle type
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Step 1a: Address Search
  if (searchStep === "location" && locationMethod === "search") {
    return (
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Brain className="w-6 h-6" />
              AI-Powered Smart Parking
            </CardTitle>
            <p className="text-blue-100">Search for parking by address or landmark</p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Where do you need to park?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter address, landmark, or area..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
              />
              <Button onClick={handleLocationSearch} disabled={!searchLocation.trim()}>
                <MapPin className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Popular searches:</div>
              <div className="flex flex-wrap gap-2">
                {["Downtown", "Airport", "Shopping Mall", "Train Station", "City Center"].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchLocation(suggestion)
                      handleLocationSearch()
                    }}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <Button variant="ghost" onClick={() => setLocationMethod(null)}>
                ← Back to Options
              </Button>
              <div className="text-sm text-gray-600">
                Or try map selection for precise location
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Step 1b: Map Selection
  if (searchStep === "location" && locationMethod === "map") {
    return (
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Brain className="w-6 h-6" />
              AI-Powered Smart Parking
            </CardTitle>
            <p className="text-blue-100">Select your destination on the map</p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              Tap on the map to select your parking destination
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Interactive Map Component */}
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Navigation className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <div className="font-semibold text-lg mb-2">Interactive Map</div>
                  <div className="text-sm text-gray-600 mb-4">
                    Click anywhere on the map to set your destination
                  </div>
                  
                  {/* Simulate map selection */}
                  <div className="space-y-2">
                    <Button 
                      onClick={() => handleMapSelection({
                        lat: 37.7749, 
                        lng: -122.4194, 
                        address: "Downtown San Francisco"
                      })}
                      variant="outline"
                      size="sm"
                    >
                      📍 Downtown Area
                    </Button>
                    <Button 
                      onClick={() => handleMapSelection({
                        lat: 37.7849, 
                        lng: -122.4094, 
                        address: "Financial District"
                      })}
                      variant="outline"
                      size="sm"
                    >
                      🏢 Financial District  
                    </Button>
                    <Button 
                      onClick={() => handleMapSelection({
                        lat: 37.7649, 
                        lng: -122.4294, 
                        address: "Union Square"
                      })}
                      variant="outline"
                      size="sm"
                    >
                      🛍️ Union Square
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button variant="ghost" onClick={() => setLocationMethod(null)}>
                ← Back to Options
              </Button>
              <div className="text-sm text-gray-600">
                Tap any location to find nearby parking
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Step 2: Vehicle Selection
  if (searchStep === "vehicle") {
    return (
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Brain className="w-6 h-6" />
              AI-Powered Smart Parking
            </CardTitle>
            <p className="text-blue-100">Searching near: {selectedLocation?.address}</p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Step 2: What type of vehicle do you have?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {vehicleTypes.map((vehicle) => (
                <Button
                  key={vehicle.id}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-blue-50 hover:border-blue-300"
                  onClick={() => handleVehicleSelection(vehicle.id)}
                >
                  <div className="text-2xl">{vehicle.icon}</div>
                  <div className="font-medium">{vehicle.name}</div>
                  <div className="text-xs text-gray-500 text-center">
                    {vehicle.requirements.join(" • ")}
                  </div>
                </Button>
              ))}
            </div>
            <div className="flex justify-between items-center pt-4">
              <Button variant="ghost" onClick={handleBackToSearch}>
                ← Back to Search
              </Button>
              <div className="text-sm text-gray-600">
                Select your vehicle type to see compatible parking spots
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Step 3: Results
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Brain className="w-6 h-6" />
              Finding Compatible Spots...
            </CardTitle>
            <p className="text-blue-100">Analyzing {selectedLocation?.address} for {vehicleTypes.find(v => v.id === selectedVehicle)?.name}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Searching for compatible parking spots...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Results section
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Brain className="w-6 h-6" />
            Compatible Parking Spots
          </CardTitle>
          <p className="text-blue-100">
            Found {filteredSpots.length} spots compatible with your {vehicleTypes.find(v => v.id === selectedVehicle)?.name} near {selectedLocation?.address}
          </p>
        </CardHeader>
      </Card>

      {/* Search Again */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing results for {vehicleTypes.find(v => v.id === selectedVehicle)?.name} near {selectedLocation?.address}
            </div>
            <Button variant="outline" size="sm" onClick={handleBackToSearch}>
              New Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* No Results Message */}
      {filteredSpots.length === 0 && (
        <Card className="border-l-4 border-l-yellow-500 bg-yellow-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-yellow-900">No Compatible Spots Found</span>
            </div>
            <p className="text-yellow-700 mb-4">
              We couldn't find any parking spots that are compatible with your {vehicleTypes.find(v => v.id === selectedVehicle)?.name} in this area.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-yellow-600">Try:</p>
              <ul className="text-sm text-yellow-600 list-disc list-inside space-y-1">
                <li>Searching in a different area</li>
                <li>Selecting a different vehicle type</li>
                <li>Expanding your search radius</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Insights Banner */}
      {filteredSpots.length > 0 && (
        <Card className="border-l-4 border-l-blue-500 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">AI Insight</span>
            </div>
            <p className="text-blue-800">
              Best time to park: <strong>2:00 PM - 4:00 PM</strong> | 
              Predicted savings: <strong>$3.50</strong> | 
              Optimal spot: <strong>{filteredSpots[0]?.name}</strong>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Parking Spots Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {filteredSpots.map((spot) => (
          <Card key={spot.id} className="border-l-4 border-l-green-500">
            <CardContent className="pt-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{spot.name}</h3>
                  <p className="text-gray-600">{spot.address}</p>
                  <p className="text-sm text-gray-500">{spot.walkingDistance}m walk</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-lg font-bold">${spot.currentPrice}</span>
                    {getPriceChangeIcon(spot.currentPrice, spot.predictedPrice)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Predicted: ${spot.predictedPrice}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${getAvailabilityColor(spot.predictedAvailability)}`}></div>
                    <span className="text-sm font-medium">
                      {getAvailabilityText(spot.predictedAvailability)} Availability
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {spot.predictedAvailability}% confidence
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">AI Confidence</div>
                  <div className="text-xs text-gray-500">{spot.confidence}%</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {spot.features.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>

              <div className="mb-4">
                <div className="text-sm font-medium mb-2">Vehicle Compatibility</div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(spot.vehicleCompatibility).map(([vehicle, compatible]) => (
                    <Badge 
                      key={vehicle} 
                      variant={compatible ? "default" : "outline"}
                      className={`text-xs ${compatible ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}
                    >
                      {vehicleTypes.find(v => v.id === vehicle)?.name || vehicle}
                    </Badge>
                  ))}
                </div>
              </div>

              {spot.restrictions.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm font-medium mb-2">Restrictions</div>
                  <div className="text-xs text-gray-600">
                    {spot.restrictions.join(" • ")}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => handleBookingAction("book_now")}
                >
                  Book Now
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleBookingAction("wait")}
                >
                  Wait for Better Price
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Predictions Section */}
      {filteredSpots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              AI Predictions & Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PredictionDashboard 
              spotId={filteredSpots[0]?.id || ""}
              spotName={filteredSpots[0]?.name || ""}
              onBookingAction={handleBookingAction}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
