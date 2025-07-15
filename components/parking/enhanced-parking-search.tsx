"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MapPin, Brain, Clock, Navigation, Filter, Zap, TrendingUp, Search, Target, Car, Truck, Map, List, Star, DollarSign, Route, Loader2 } from "lucide-react"
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
  rating: number
  totalSpaces?: number
  availableSpaces?: number
  provider: string
}

interface VehicleType {
  id: string
  name: string
  icon: string
  description: string
  requirements: string[]
  color: string
}

interface LocationResult {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  type: "address" | "landmark" | "poi"
  category?: string
}

export function EnhancedParkingSearch() {
  const [searchStep, setSearchStep] = useState<"location" | "vehicle" | "results">("vehicle") // Start on vehicle page
  const [locationMethod, setLocationMethod] = useState<"search" | "map" | "current" | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [locationResults, setLocationResults] = useState<LocationResult[]>([])
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<string>("")
  const [parkingSpots, setParkingSpots] = useState<SmartParkingSpot[]>([])
  const [filteredSpots, setFilteredSpots] = useState<SmartParkingSpot[]>([])
  const [loading, setLoading] = useState(false)
  const [searchingLocation, setSearchingLocation] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "map">("list")
  const [sortBy, setSortBy] = useState<"distance" | "price" | "availability" | "rating">("distance")
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Location detection state
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'pending'>('pending')
  const [isNearSelectedArea, setIsNearSelectedArea] = useState<boolean | null>(null)

  // Get user location from browser
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.')
      return
    }
    setLocationPermission('pending')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setUserLocation(userCoords)
        setLocationPermission('granted')
        if (selectedLocation) {
          checkProximityToSelectedArea(userCoords, selectedLocation)
        }
      },
      (error) => {
        setLocationPermission('denied')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  }

  // Calculate distance between two coordinates (km)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Check if user is near selected area
  const checkProximityToSelectedArea = (userCoords: {lat: number, lng: number}, selectedArea: LocationResult) => {
    const distance = calculateDistance(userCoords.lat, userCoords.lng, selectedArea.lat, selectedArea.lng)
    setIsNearSelectedArea(distance <= 50)
  }

  // Use current location button handler
  const useCurrentLocation = () => {
    getUserLocation()
  }

  // Progress indicator component
  const ProgressIndicator = () => {
    const steps = [
      { id: "vehicle", name: "Search & Select", completed: selectedLocation !== null && selectedVehicle !== "" },
      { id: "results", name: "View Results", completed: searchStep === "results" }
    ]

    return (
      <div className="mb-6">
        <div className="flex items-center justify-center space-x-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center space-x-2 ${
                searchStep === step.id || step.completed ? 'text-blue-600' : 'text-gray-400'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step.completed ? 'bg-blue-600 text-white' : 
                  searchStep === step.id ? 'bg-blue-100 text-blue-600 border-2 border-blue-600' : 
                  'bg-gray-200 text-gray-400'
                }`}>
                  {step.completed ? '✓' : index + 1}
                </div>
                <span className="font-medium">{step.name}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  steps[index + 1].completed || searchStep === steps[index + 1].id ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const vehicleTypes: VehicleType[] = [
    {
      id: "car",
      name: "Standard Car",
      icon: "🚗",
      description: "Regular passenger car",
      requirements: ["Standard parking space", "Height clearance 7ft"],
      color: "blue"
    },
    {
      id: "truck",
      name: "Truck/SUV",
      icon: "🚛",
      description: "Large vehicle or truck",
      requirements: ["Large vehicle space", "Height clearance 10ft+", "Weight capacity"],
      color: "orange"
    },
    {
      id: "motorcycle",
      name: "Motorcycle",
      icon: "🏍️",
      description: "Motorcycle or scooter",
      requirements: ["Motorcycle parking", "Secure area"],
      color: "green"
    },
    {
      id: "ev",
      name: "Electric Vehicle",
      icon: "⚡",
      description: "Electric car with charging needs",
      requirements: ["EV charging station", "Standard parking space"],
      color: "purple"
    },
    {
      id: "oversized",
      name: "RV/Bus",
      icon: "🚌",
      description: "Large recreational vehicle",
      requirements: ["Oversized parking", "Special clearance", "Weight capacity"],
      color: "red"
    }
  ]

  // Simulated location search
  const handleLocationSearch = async (query: string) => {
    if (!query.trim()) return

    setSearchingLocation(true)
    
    // Simulate API delay
    setTimeout(() => {
      const mockResults: LocationResult[] = [
        {
          id: "1",
          name: "Downtown Area",
          address: "Financial District, San Francisco, CA",
          lat: 37.7749,
          lng: -122.4194,
          type: "landmark" as const,
          category: "Business District"
        },
        {
          id: "2", 
          name: "Union Square",
          address: "Union Square, San Francisco, CA",
          lat: 37.7880,
          lng: -122.4075,
          type: "landmark" as const,
          category: "Shopping"
        },
        {
          id: "3",
          name: "Moscone Center",
          address: "747 Howard St, San Francisco, CA",
          lat: 37.7842,
          lng: -122.4016,
          type: "poi" as const,
          category: "Convention Center"
        },
        {
          id: "4",
          name: query,
          address: `${query}, San Francisco, CA`,
          lat: 37.7749 + (Math.random() - 0.5) * 0.1,
          lng: -122.4194 + (Math.random() - 0.5) * 0.1,
          type: "address" as const
        }
      ].filter(result => 
        result.name.toLowerCase().includes(query.toLowerCase()) ||
        result.address.toLowerCase().includes(query.toLowerCase())
      )

      setLocationResults(mockResults)
      setSearchingLocation(false)
    }, 500)
  }

  // Generate parking spots for selected location
  const generateParkingSpots = (location: LocationResult, vehicleType: string) => {
    const spots: SmartParkingSpot[] = []
    
    for (let i = 0; i < 12; i++) {
      const distance = 50 + Math.random() * 500 // 50-550m
      const lat = location.lat + (Math.random() - 0.5) * 0.01
      const lng = location.lng + (Math.random() - 0.5) * 0.01
      
      const spot: SmartParkingSpot = {
        id: `spot_${i + 1}`,
        name: `${["Smart Parking", "City Center", "Downtown", "Metro", "Plaza", "Garage"][Math.floor(Math.random() * 6)]} ${["Lot", "Garage", "Plaza", "Center"][Math.floor(Math.random() * 4)]}`,
        address: `${Math.floor(Math.random() * 999) + 1} ${['Main St', 'Oak Ave', 'Pine Blvd', 'Elm Dr', 'Park Way'][Math.floor(Math.random() * 5)]}`,
        latitude: lat,
        longitude: lng,
        currentPrice: 3 + Math.random() * 15,
        predictedPrice: 3 + Math.random() * 15,
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
          oversized: Math.random() > 0.9
        },
        restrictions: [],
        rating: 3 + Math.random() * 2,
        totalSpaces: Math.floor(Math.random() * 100) + 20,
        availableSpaces: Math.floor(Math.random() * 30) + 1,
        provider: ["SpotHero", "ParkWhiz", "City Parking", "Smart Park"][Math.floor(Math.random() * 4)]
      }

      // Add random features
      if (Math.random() > 0.6) spot.features.push("Covered")
      if (Math.random() > 0.7) spot.features.push("Security")
      if (Math.random() > 0.8) spot.features.push("EV Charging")
      if (Math.random() > 0.9) spot.features.push("Valet")
      if (Math.random() > 0.85) spot.features.push("24/7 Access")

      spots.push(spot)
    }

    setParkingSpots(spots)
    
    // Filter by vehicle compatibility
    const compatible = spots.filter(spot => 
      spot.vehicleCompatibility[vehicleType as keyof typeof spot.vehicleCompatibility]
    )
    setFilteredSpots(compatible)
  }

  // Handle location selection
  const handleLocationSelect = (location: LocationResult) => {
    setSelectedLocation(location)
    setLocationResults([])
    // Don't automatically navigate to next step - stay on the same page
  }

  // Handle vehicle selection
  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicle(vehicleId)
    setLoading(true)
    
    setTimeout(() => {
      if (selectedLocation) {
        generateParkingSpots(selectedLocation, vehicleId)
      }
      setLoading(false)
      setSearchStep("results")
    }, 1500)
  }

  // Sort spots
  const sortSpots = (spots: SmartParkingSpot[], sortBy: string) => {
    return [...spots].sort((a, b) => {
      switch (sortBy) {
        case "distance":
          return a.walkingDistance - b.walkingDistance
        case "price":
          return a.currentPrice - b.currentPrice
        case "availability":
          return b.predictedAvailability - a.predictedAvailability
        case "rating":
          return b.rating - a.rating
        default:
          return 0
      }
    })
  }

  // Reset search
  const resetSearch = () => {
    setSearchStep("vehicle") // Go back to main search page (vehicle step with area search)
    setLocationMethod(null)
    setSearchQuery("")
    setLocationResults([])
    setSelectedLocation(null)
    setSelectedVehicle("")
    setParkingSpots([])
    setFilteredSpots([])
    setLoading(false)
  }

  useEffect(() => {
    if (searchQuery) {
      const timer = setTimeout(() => {
        handleLocationSearch(searchQuery)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setLocationResults([])
    }
  }, [searchQuery])

  useEffect(() => {
    setFilteredSpots(sortSpots(filteredSpots, sortBy))
  }, [sortBy])

  // Step 1: Simple Start Screen
  if (searchStep === "location") {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <ProgressIndicator />
        
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-3">
            <Brain className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Smart Parking Finder</h1>
          </div>
          <p className="text-gray-600 text-lg">AI-powered parking search with real-time intelligence</p>
          
          <Button 
            size="lg"
            className="h-16 px-12 text-lg"
            onClick={() => setSearchStep("vehicle")}
          >
            Start Finding Parking
          </Button>
        </div>
      </div>
    )
  }

  // Step 2: Vehicle Selection with Area Search
  if (searchStep === "vehicle") {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <ProgressIndicator />
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Find Parking</h1>
          <p className="text-gray-600">Search for an area, use your location, and select your vehicle type</p>
        </div>

        {/* Area Search Section with Location Detection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Where do you want to park?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Use My Location Button */}
            <div className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
              <Target className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <div className="font-medium">Use My Location</div>
                <div className="text-sm text-gray-600">
                  {userLocation ? `Location detected (${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})` : 'Get parking suggestions for your current area'}
                </div>
              </div>
              <Button 
                onClick={useCurrentLocation}
                variant="outline"
                size="sm"
                disabled={locationPermission === 'pending'}
              >
                {locationPermission === 'pending' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Use Location'}
              </Button>
            </div>

            {/* Location permission status */}
            {locationPermission === 'denied' && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-yellow-900">Location Access Denied</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Please enable location access to find parking near you, or search manually below.
                </p>
              </div>
            )}

            {/* Search input with location context */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                ref={searchInputRef}
                placeholder={userLocation ? "Search nearby areas..." : "Enter city, area, or address..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg"
                autoFocus
              />
              {searchingLocation && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 animate-spin" />
              )}
            </div>

            {/* Proximity warning */}
            {selectedLocation && isNearSelectedArea === false && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-orange-900">Location Notice</span>
                </div>
                <p className="text-sm text-orange-700 mt-1">
                  You're searching for parking in <strong>{selectedLocation.name}</strong>, but you appear to be in a different area. Make sure this is where you actually need parking.
                </p>
              </div>
            )}

            {/* Proximity confirmation */}
            {selectedLocation && isNearSelectedArea === true && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">Perfect!</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  You're near <strong>{selectedLocation.name}</strong>. We'll show you the best parking options in your area.
                </p>
              </div>
            )}

            {/* Popular areas */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Popular areas:</p>
              <div className="flex flex-wrap gap-2">
                {["Downtown", "Airport", "Shopping Mall", "Union Square", "Financial District", "Times Square", "Central Park"].map((area) => (
                  <Button
                    key={area}
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery(area)}
                  >
                    {area}
                  </Button>
                ))}
              </div>
            </div>

            {/* Search results */}
            {locationResults.length > 0 && (
              <div className="space-y-2 border-t pt-4">
                <h3 className="font-medium text-sm text-gray-700">Search Results</h3>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {locationResults.map((location) => (
                    <Button
                      key={location.id}
                      variant="ghost"
                      className="w-full justify-start h-auto p-3 hover:bg-blue-50"
                      onClick={() => handleLocationSelect(location)}
                    >
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div className="text-left">
                          <div className="font-medium">{location.name}</div>
                          <div className="text-sm text-gray-500">{location.address}</div>
                          {location.category && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {location.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Selected location display */}
            {selectedLocation && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">Selected Area</span>
                </div>
                <div className="text-green-800">
                  <div className="font-medium">{selectedLocation.name}</div>
                  <div className="text-sm">{selectedLocation.address}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vehicle Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              What vehicle are you driving?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {vehicleTypes.map((vehicle) => (
                <Button
                  key={vehicle.id}
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-center space-y-4 hover:bg-blue-50 hover:border-blue-300 transition-all"
                  onClick={() => handleVehicleSelect(vehicle.id)}
                  disabled={!selectedLocation}
                >
                  <div className="text-4xl">{vehicle.icon}</div>
                  <div className="text-center">
                    <div className="font-semibold text-lg">{vehicle.name}</div>
                    <div className="text-sm text-gray-600 mt-1">{vehicle.description}</div>
                    <div className="text-xs text-gray-500 mt-2">
                      {vehicle.requirements.slice(0, 2).join(" • ")}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
            
            {!selectedLocation && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-yellow-900">Select an area first</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Please search and select a parking area before choosing your vehicle type.
                </p>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Why Vehicle Type Matters</span>
              </div>
              <p className="text-sm text-blue-700">
                Different vehicles need different parking spaces. We'll only show spots that are compatible with your vehicle type, ensuring you can actually park there.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <ProgressIndicator />
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
              <h3 className="text-xl font-semibold">Finding Compatible Parking Spots</h3>
              <p className="text-gray-600 text-center">
                Analyzing {selectedLocation?.name} for {vehicleTypes.find(v => v.id === selectedVehicle)?.name} parking...
              </p>
              <div className="text-sm text-gray-500">
                This may take a moment while we check vehicle compatibility
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Step 3: Results
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <ProgressIndicator />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" onClick={resetSearch}>
            ← New Search
          </Button>
          <div>
            <h2 className="text-2xl font-bold">
              {filteredSpots.length} Compatible Spots Found
            </h2>
            <p className="text-gray-600">
              {vehicleTypes.find(v => v.id === selectedVehicle)?.name} near {selectedLocation?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="distance">Sort by Distance</option>
            <option value="price">Sort by Price</option>
            <option value="availability">Sort by Availability</option>
            <option value="rating">Sort by Rating</option>
          </select>

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "map" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("map")}
            >
              <Map className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      {filteredSpots.length > 0 && (
        <Card className="border-l-4 border-l-blue-500 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">AI Recommendations</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Best Value:</span> {filteredSpots[0]?.name}
              </div>
              <div>
                <span className="font-medium">Closest:</span> {filteredSpots.find(s => s.walkingDistance === Math.min(...filteredSpots.map(s => s.walkingDistance)))?.name}
              </div>
              <div>
                <span className="font-medium">Highest Availability:</span> {filteredSpots.find(s => s.predictedAvailability === Math.max(...filteredSpots.map(s => s.predictedAvailability)))?.name}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results List */}
      {filteredSpots.length === 0 ? (
        <Card className="border-l-4 border-l-yellow-500 bg-yellow-50">
          <CardContent className="pt-4">
            <div className="text-center py-8">
              <Car className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                No Compatible Spots Found
              </h3>
              <p className="text-yellow-700 mb-4">
                We couldn't find parking spots compatible with your {vehicleTypes.find(v => v.id === selectedVehicle)?.name} in this area.
              </p>
              <Button onClick={resetSearch} variant="outline">
                Try Different Location
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {sortSpots(filteredSpots, sortBy).map((spot) => (
            <Card key={spot.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{spot.name}</h3>
                      <p className="text-gray-600">{spot.address}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {spot.provider}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600">{spot.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-xl font-bold text-green-600">
                          ${spot.currentPrice.toFixed(0)}
                        </span>
                        <span className="text-sm text-gray-500">/hr</span>
                      </div>
                      {spot.predictedPrice !== spot.currentPrice && (
                        <div className="text-xs text-gray-500">
                          Predicted: ${spot.predictedPrice.toFixed(0)}/hr
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <Route className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                      <div className="font-medium">{spot.walkingDistance}m</div>
                      <div className="text-gray-500">walk</div>
                    </div>
                    <div className="text-center">
                      <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                        spot.predictedAvailability > 70 ? 'bg-green-500' : 
                        spot.predictedAvailability > 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <div className="font-medium">{spot.predictedAvailability}%</div>
                      <div className="text-gray-500">available</div>
                    </div>
                    <div className="text-center">
                      <Brain className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                      <div className="font-medium">{spot.confidence}%</div>
                      <div className="text-gray-500">confidence</div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1">
                    {spot.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button className="flex-1">
                      Reserve Now
                    </Button>
                    <Button variant="outline">
                      <Navigation className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}