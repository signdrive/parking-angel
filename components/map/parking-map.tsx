"use client"

import { useEffect, useRef, useState } from "react"
import { useParkingSpots } from "@/hooks/use-parking-spots"
import { useGeolocation } from "@/hooks/use-geolocation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Plus, Navigation, Loader2 } from "lucide-react"
import { SpotReportDialog } from "./spot-report-dialog"

interface ParkingMapProps {
  onSpotSelect?: (spotId: string) => void
}

export function ParkingMap({ onSpotSelect }: ParkingMapProps) {
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [reportLocation, setReportLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [mapboxError, setMapboxError] = useState<string | null>(null)
  const [mapboxToken, setMapboxToken] = useState<string | null>(null)
  const [useMapbox, setUseMapbox] = useState(false)
  const [mapboxMap, setMapboxMap] = useState<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapContainer = useRef<HTMLDivElement>(null)

  const { latitude, longitude, error: locationError } = useGeolocation()
  const { spots, loading: spotsLoading } = useParkingSpots({
    latitude,
    longitude,
    radius: 1000,
  })

  // Try to load Mapbox with your token
  useEffect(() => {
    const loadMapbox = async () => {
      try {
        // First try to get token from API
        const response = await fetch("/api/mapbox/token")
        let token = null

        if (response.ok) {
          const data = await response.json()
          token = data.token
        } else {
          // Fallback to your provided token
          token = "pk.eyJ1Ijoic3VyZmVhc3lhcHAiLCJhIjoiY21hdGtlODlnMG1jaDJsczQ2YmNtZmdxbyJ9.QVy8Bx_v_4GH6B_RBqGoCA"
        }

        setMapboxToken(token)

        // Try to dynamically import mapbox-gl
        const mapboxgl = await import("mapbox-gl")
        await import("mapbox-gl/dist/mapbox-gl.css")

        if (mapContainer.current && token) {
          mapboxgl.default.accessToken = token

          const map = new mapboxgl.default.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/streets-v12",
            center: [longitude || -122.4194, latitude || 37.7749],
            zoom: 15,
          })

          map.addControl(new mapboxgl.default.NavigationControl())
          map.addControl(
            new mapboxgl.default.GeolocateControl({
              positionOptions: {
                enableHighAccuracy: true,
              },
              trackUserLocation: true,
              showUserHeading: true,
            }),
          )

          map.on("load", () => {
            setMapLoaded(true)
          })

          map.on("click", (e: any) => {
            setReportLocation({
              lat: e.lngLat.lat,
              lng: e.lngLat.lng,
            })
            setShowReportDialog(true)
          })

          setMapboxMap(map)
          setUseMapbox(true)
        }
      } catch (error) {
        console.log("Mapbox not available, using fallback map")
        setMapboxError("Using simplified map view")
        setUseMapbox(false)
      }
    }

    loadMapbox()

    return () => {
      if (mapboxMap) {
        mapboxMap.remove()
      }
    }
  }, [])

  // Update map center when location changes
  useEffect(() => {
    if (mapboxMap && mapLoaded && latitude && longitude) {
      mapboxMap.setCenter([longitude, latitude])

      // Add user location marker
      try {
        const mapboxgl = require("mapbox-gl")
        new mapboxgl.Marker({ color: "#3B82F6" })
          .setLngLat([longitude, latitude])
          .setPopup(new mapboxgl.Popup().setHTML("<p>Your Location</p>"))
          .addTo(mapboxMap)
      } catch (error) {
        console.log("Could not add user marker")
      }
    }
  }, [mapboxMap, mapLoaded, latitude, longitude])

  // Add parking spot markers
  useEffect(() => {
    if (!mapboxMap || !mapLoaded || spotsLoading) return

    // Remove existing markers
    const existingMarkers = document.querySelectorAll(".parking-spot-marker")
    existingMarkers.forEach((marker) => marker.remove())

    // Add new markers
    spots.forEach((spot) => {
      const el = document.createElement("div")
      el.className = "parking-spot-marker"
      el.innerHTML = `
        <div class="w-8 h-8 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:bg-green-600 transition-colors">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        </div>
      `

      try {
        const mapboxgl = require("mapbox-gl")
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="p-2">
            <h3 class="font-semibold">${spot.spot_type.charAt(0).toUpperCase() + spot.spot_type.slice(1)} Parking</h3>
            <p class="text-sm text-gray-600">${spot.address || "Address not available"}</p>
            <p class="text-xs text-gray-500">Expires: ${new Date(spot.expires_at).toLocaleTimeString()}</p>
            <p class="text-xs text-green-600">Confidence: ${spot.confidence_score}%</p>
          </div>
        `)

        new mapboxgl.Marker(el).setLngLat([spot.longitude, spot.latitude]).setPopup(popup).addTo(mapboxMap)

        el.addEventListener("click", () => {
          onSpotSelect?.(spot.id)
        })
      } catch (error) {
        console.log("Could not add marker")
      }
    })
  }, [mapboxMap, mapLoaded, spots, spotsLoading, onSpotSelect])

  if (locationError) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-6">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Location Access Required</h3>
          <p className="text-gray-600 mb-4">Please enable location access to find nearby parking spots.</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  // Mapbox map view
  if (useMapbox && mapboxMap) {
    return (
      <div className="relative h-full">
        <div ref={mapContainer} className="h-full w-full" />

        <Button
          className="absolute bottom-6 right-6 rounded-full w-14 h-14 shadow-lg"
          onClick={() => {
            if (latitude && longitude) {
              setReportLocation({ lat: latitude, lng: longitude })
              setShowReportDialog(true)
            }
          }}
          disabled={!latitude || !longitude}
        >
          <Plus className="w-6 h-6" />
        </Button>

        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md px-4 py-2">
          <p className="text-sm font-medium">{spotsLoading ? "Loading..." : `${spots.length} spots nearby`}</p>
          <p className="text-xs text-green-600">Interactive Map</p>
        </div>

        <SpotReportDialog open={showReportDialog} onOpenChange={setShowReportDialog} location={reportLocation} />
      </div>
    )
  }

  // Fallback map view when Mapbox is not available
  return (
    <div className="relative h-full bg-gray-100">
      <div className="h-full flex flex-col">
        {/* Map Header */}
        <div className="bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Parking Spots Near You</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Navigation className="w-4 h-4" />
              {latitude && longitude ? (
                <span>
                  {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </span>
              ) : (
                <span>Getting location...</span>
              )}
            </div>
          </div>
        </div>

        {/* Spots List */}
        <div className="flex-1 overflow-y-auto p-4">
          {spotsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading nearby spots...</span>
            </div>
          ) : spots.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Spots Found</h3>
              <p className="text-gray-600 mb-4">Be the first to report a parking spot in this area!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 mb-3">
                {spots.length} Available Spot{spots.length !== 1 ? "s" : ""} Nearby
              </h3>
              {spots.map((spot) => (
                <Card
                  key={spot.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onSpotSelect?.(spot.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="font-medium capitalize">{spot.spot_type} Parking</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{spot.address || "Address not available"}</p>
                        <p className="text-xs text-gray-500">
                          Expires: {new Date(spot.expires_at).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-green-600">Confidence: {spot.confidence_score}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{spot.latitude.toFixed(4)}°</p>
                        <p className="text-sm font-medium text-gray-900">{spot.longitude.toFixed(4)}°</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Report Button */}
      <Button
        className="absolute bottom-6 right-6 rounded-full w-14 h-14 shadow-lg"
        onClick={() => {
          if (latitude && longitude) {
            setReportLocation({ lat: latitude, lng: longitude })
            setShowReportDialog(true)
          }
        }}
        disabled={!latitude || !longitude}
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Status Info */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md px-4 py-2">
        <p className="text-sm font-medium">{spotsLoading ? "Loading..." : `${spots.length} spots nearby`}</p>
        <p className="text-xs text-orange-600">List View</p>
      </div>

      <SpotReportDialog open={showReportDialog} onOpenChange={setShowReportDialog} location={reportLocation} />
    </div>
  )
}
