"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Zap, Truck, MapPin, Search, Filter, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function VehicleSearch() {
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    loadVehicleTypes()
  }, [])

  const loadVehicleTypes = async () => {
    try {
      const response = await fetch('/api/parking/vehicle-specific?action=vehicle-types')
      const data = await response.json()
      if (data.vehicle_types) {
        setVehicleTypes(data.vehicle_types)
      }
    } catch (error) {
      console.error('Error loading vehicle types:', error)
    }
  }

  const searchForVehicle = async () => {
    if (!selectedVehicle) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/parking/vehicle-specific', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicle_id: selectedVehicle,
          location: { lat: 51.5074, lng: -0.1278 },
          radius: 1000,
          requirements: vehicleTypes.find(v => v.id === selectedVehicle)?.needs_charging ? { needs_charging: true } : {}
        }),
      })
      
      const data = await response.json()
      if (data.compatible_spots) {
        setSearchResults(data.compatible_spots)
        setShowResults(true)
      }
    } catch (error) {
      console.error('Error searching for vehicle spots:', error)
    } finally {
      setLoading(false)
    }
  }

  const getVehicleIcon = (type: string) => {
    if (type === 'electric') return <Zap className="w-5 h-5 text-green-600" />
    if (type === 'van' || type === 'truck') return <Truck className="w-5 h-5 text-blue-600" />
    return <Car className="w-5 h-5 text-gray-600" />
  }

  const getVehicleColor = (type: string) => {
    switch (type) {
      case 'electric': return 'bg-green-100 text-green-800'
      case 'van': return 'bg-blue-100 text-blue-800'
      case 'truck': return 'bg-orange-100 text-orange-800'
      case 'motorcycle': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const selectedVehicleData = vehicleTypes.find(v => v.id === selectedVehicle)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Find Parking for Your Vehicle</h2>
        <p className="text-gray-600">
          Get personalized parking recommendations based on your vehicle's specific needs
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Car className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Vehicle Types</p>
                <p className="text-2xl font-bold text-gray-900">{vehicleTypes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">EV Charging Spots</p>
                <p className="text-2xl font-bold text-gray-900">156</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Truck className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Commercial Spots</p>
                <p className="text-2xl font-bold text-gray-900">89</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">97%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Car className="w-5 h-5" />
            <span>Select Your Vehicle</span>
          </CardTitle>
          <CardDescription>
            Choose your vehicle type to find compatible parking spots
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {vehicleTypes.map((vehicle) => (
              <button
                key={vehicle.id}
                onClick={() => setSelectedVehicle(vehicle.id)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  selectedVehicle === vehicle.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  {getVehicleIcon(vehicle.type)}
                  <Badge className={getVehicleColor(vehicle.type)}>
                    {vehicle.type}
                  </Badge>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{vehicle.name}</h3>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>L: {vehicle.length}m × W: {vehicle.width}m × H: {vehicle.height}m</div>
                  {vehicle.needs_charging && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <Zap className="w-3 h-3" />
                      <span>Needs charging</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {selectedVehicle && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-900 mb-2">Selected Vehicle Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Dimensions:</span>
                  <p className="text-blue-800">
                    {selectedVehicleData?.length}m × {selectedVehicleData?.width}m × {selectedVehicleData?.height}m
                  </p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Type:</span>
                  <p className="text-blue-800 capitalize">{selectedVehicleData?.type}</p>
                </div>
              </div>
            </div>
          )}

          <Button 
            onClick={searchForVehicle} 
            disabled={!selectedVehicle || loading}
            className="w-full flex items-center justify-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Searching...' : 'Find Compatible Spots'}</span>
          </Button>
        </CardContent>
      </Card>

      {/* Search Results */}
      {showResults && (
        <Card>
          <CardHeader>
            <CardTitle>Compatible Parking Spots</CardTitle>
            <CardDescription>
              Found {searchResults.length} spots suitable for your {selectedVehicleData?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {searchResults.length === 0 ? (
              <div className="text-center py-8">
                <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Compatible Spots Found</h3>
                <p className="text-gray-600">Try searching in a different area or with different requirements.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((spot, index) => (
                  <div key={spot.id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{spot.name}</h3>
                          {spot.features.ev_charging && (
                            <Badge className="bg-green-100 text-green-800">
                              <Zap className="w-3 h-3 mr-1" />
                              EV Charging
                            </Badge>
                          )}
                          {spot.features.covered && (
                            <Badge variant="secondary">Covered</Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{spot.distance}m away</span>
                          </div>
                          <div>
                            Dimensions: {spot.dimensions.length}m × {spot.dimensions.width}m
                            {spot.dimensions.height && ` × ${spot.dimensions.height}m`}
                          </div>
                        </div>

                        {spot.features && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {spot.features.accessible && (
                              <Badge variant="outline">Accessible</Badge>
                            )}
                            {spot.features.overnight_allowed && (
                              <Badge variant="outline">Overnight OK</Badge>
                            )}
                            {spot.features.commercial_allowed && (
                              <Badge variant="outline">Commercial OK</Badge>
                            )}
                          </div>
                        )}

                        {spot.restrictions && spot.restrictions.length > 0 && (
                          <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                            <div className="flex items-center space-x-1 mb-1">
                              <Info className="w-3 h-3" />
                              <span className="font-medium">Restrictions:</span>
                            </div>
                            <ul className="list-disc list-inside space-y-0.5">
                              {spot.restrictions.map((restriction: string, i: number) => (
                                <li key={i}>{restriction}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4 text-right">
                        <div className="mb-2">
                          <div className="text-lg font-bold text-gray-900">
                            £{spot.pricing.hourly}/hr
                          </div>
                          <div className="text-sm text-gray-600">
                            £{spot.pricing.daily}/day
                          </div>
                        </div>
                        
                        <div className="mb-2">
                          <div className="text-sm font-medium text-green-600">
                            {spot.compatibility_score}% match
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          {spot.availability.available_now ? (
                            <Badge className="bg-green-100 text-green-800">Available Now</Badge>
                          ) : (
                            <Badge variant="secondary">
                              Next: {new Date(spot.availability.next_available).toLocaleTimeString()}
                            </Badge>
                          )}
                        </div>
                        
                        <Button size="sm" className="mt-2 w-full">
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How Vehicle-Specific Search Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Car className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">1. Select Vehicle</h3>
              <p className="text-sm text-gray-600">
                Choose your vehicle type or enter custom dimensions
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Filter className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">2. Smart Filtering</h3>
              <p className="text-sm text-gray-600">
                Our algorithm filters spots by size, clearance, and features
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">3. Perfect Match</h3>
              <p className="text-sm text-gray-600">
                Get spots guaranteed to fit with 97% success rate
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
