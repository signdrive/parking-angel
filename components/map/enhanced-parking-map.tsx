"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, MapPin } from "lucide-react"
import useGeolocation from "@/hooks/use-geolocation"
import { google } from "googlemaps"

interface Spot {
  id: number
  lat: number
  lng: number
  status: string
  price: number
  address: string
  aiPrediction?: number
}

interface EnhancedParkingMapProps {
  initialCenter?: { lat: number; lng: number }
  zoom?: number
}

const EnhancedParkingMap = ({
  initialCenter = { lat: 51.5074, lng: -0.1278 }, // London as default
  zoom = 15,
}: EnhancedParkingMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string | null>(null)
  const [isLoadingApiKey, setIsLoadingApiKey] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null)
  const [spots, setSpots] = useState<Spot[]>([])

  const {
    location: userLocation,
    error: locationError,
    isLoading: isLoadingLocation,
    getLocation: refreshLocation,
  } = useGeolocation()

  const mapStyles = {
    height: "500px",
    width: "100%",
  }

  const defaultCenter = {
    lat: 40.7128,
    lng: -74.006,
  }

  // Fetch Google Maps API key from our secure API endpoint
  useEffect(() => {
    async function fetchApiKey() {
      try {
        setIsLoadingApiKey(true)
        const response = await fetch("/api/maps/api-key")
        if (!response.ok) {
          throw new Error("Failed to fetch Google Maps API key")
        }
        const data = await response.json()
        setGoogleMapsApiKey(data.apiKey)
      } catch (err) {
        console.error("Error fetching Google Maps API key:", err)
        setError("Failed to load map configuration")
      } finally {
        setIsLoadingApiKey(false)
      }
    }

    fetchApiKey()
  }, [])

  // Load Google Maps script
  useEffect(() => {
    if (!googleMapsApiKey || googleMapsLoaded) return

    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => setGoogleMapsLoaded(true)
    script.onerror = () => setError("Failed to load Google Maps")

    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [googleMapsApiKey, googleMapsLoaded])

  // Initialize map
  useEffect(() => {
    if (!googleMapsLoaded || !mapRef.current) return

    try {
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: userLocation || initialCenter,
        zoom,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: true,
        styles: [
          {
            featureType: "poi.business",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "transit",
            elementType: "labels.icon",
            stylers: [{ visibility: "off" }],
          },
        ],
      })

      setMap(mapInstance)

      // Add user location marker if available
      if (userLocation) {
        new google.maps.Marker({
          position: userLocation,
          map: mapInstance,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
          title: "Your Location",
        })
      }

      // Add some sample parking spots
      const parkingSpots = [
        {
          lat: userLocation?.lat || initialCenter.lat + 0.002,
          lng: userLocation?.lng || initialCenter.lng + 0.001,
          available: true,
        },
        {
          lat: userLocation?.lat || initialCenter.lat - 0.001,
          lng: userLocation?.lng || initialCenter.lng + 0.002,
          available: false,
        },
        {
          lat: userLocation?.lat || initialCenter.lat + 0.001,
          lng: userLocation?.lng || initialCenter.lng - 0.002,
          available: true,
        },
      ]

      parkingSpots.forEach((spot) => {
        new google.maps.Marker({
          position: spot,
          map: mapInstance,
          icon: {
            path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale: 5,
            fillColor: spot.available ? "#4CAF50" : "#FF5252",
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: "#ffffff",
          },
          title: spot.available ? "Available Parking" : "Occupied Parking",
        })
      })
    } catch (err) {
      console.error("Error initializing map:", err)
      setError("Failed to initialize map")
    }
  }, [googleMapsLoaded, userLocation, initialCenter, zoom])

  // Center map on user location when it changes
  useEffect(() => {
    if (map && userLocation) {
      map.setCenter(userLocation)
    }
  }, [map, userLocation])

  useEffect(() => {
    if (userLocation) {
      const mockSpots = [
        {
          id: 1,
          lat: userLocation.lat + 0.001,
          lng: userLocation.lng + 0.001,
          status: "available",
          price: 8,
          aiPrediction: 85,
          address: "123 Main St",
        },
        {
          id: 2,
          lat: userLocation.lat - 0.001,
          lng: userLocation.lng - 0.001,
          status: "occupied",
          price: 10,
          aiPrediction: 20,
          address: "456 Oak Ave",
        },
        {
          id: 3,
          lat: userLocation.lat + 0.002,
          lng: userLocation.lng - 0.002,
          status: "available",
          price: 12,
          aiPrediction: 95,
          address: "789 Pine Ln",
        },
      ]
      setSpots(mockSpots)
    }
  }, [userLocation])

  const getSpotColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500"
      case "occupied":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  if (isLoadingApiKey) {
    return (
      <Card className="w-full h-[500px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading map configuration...</p>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full h-[500px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-red-500">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="w-full h-[500px] relative">
        <div ref={mapRef} className="w-full h-full rounded-lg" />

        {!googleMapsLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {isLoadingLocation && (
          <div className="absolute top-2 left-2 bg-white p-2 rounded-md shadow-md">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        )}

        <Button
          variant="secondary"
          size="sm"
          className="absolute bottom-4 right-4 shadow-md flex items-center gap-1"
          onClick={refreshLocation}
          disabled={isLoadingLocation}
        >
          <MapPin className="h-4 w-4" />
          {isLoadingLocation ? "Locating..." : "My Location"}
        </Button>
      </Card>

      {/* Spot Status Indicators */}
      <div className="absolute top-2 left-2 bg-white p-2 rounded-md shadow-md">
        <div className="flex items-center space-x-2">
          <span className="w-4 h-4 rounded-full bg-green-500"></span>
          <span>Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-4 h-4 rounded-full bg-red-500"></span>
          <span>Occupied</span>
        </div>
      </div>

      {/* Parking Spots */}
      <div className="absolute bottom-2 left-2 bg-white p-2 rounded-md shadow-md">
        {spots.map((spot) => (
          <div key={spot.id} className="relative">
            {/* Existing spot marker */}
            <div className={`w-4 h-4 rounded-full ${getSpotColor(spot.status)}`} />

            {/* AI Prediction Badge */}
            <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {spot.aiPrediction || "?"}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EnhancedParkingMap
