"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { useGeolocation } from "@/hooks/use-geolocation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Plus, Navigation, DollarSign, Car } from "lucide-react"
import { ParkingDataService, type RealParkingSpot } from "@/lib/parking-data-service"
import { SpotReportDialog } from "./spot-report-dialog"

interface EnhancedParkingMapProps {
  onSpotSelect?: (spot: RealParkingSpot) => void
}

export function EnhancedParkingMap({ onSpotSelect }: EnhancedParkingMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [reportLocation, setReportLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [mapboxError, setMapboxError] = useState<string | null>(null)
  const [mapboxToken, setMapboxToken] = useState<string | null>(null)
  const [realSpots, setRealSpots] = useState<RealParkingSpot[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSpot, setSelectedSpot] = useState<RealParkingSpot | null>(null)
  const [filters, setFilters] = useState({
    maxPrice: null as number | null,
    spotTypes: [] as string[],
    requireRealTime: false,
    requireAvailability: true,
    includeAccessible: false,
    includeEVCharging: false,
  })

  const { latitude, longitude, error: locationError } = useGeolocation()
  const parkingService = ParkingDataService.getInstance()

  // Fetch Mapbox token
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const response = await fetch("/api/mapbox/token")
        if (response.ok) {
          const data = await response.json()
          setMapboxToken(data.token)
        } else {
          setMapboxError("Failed to load Mapbox token")
        }
      } catch (error) {
        setMapboxError("Failed to connect to Mapbox service")
      }
    }

    fetchMapboxToken()
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current || !mapboxToken) return

    try {
      mapboxgl.accessToken = mapboxToken

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [-122.4194, 37.7749],
        zoom: 15,
      })

      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
          showUserHeading: true,
        }),
      )

      map.current.addControl(new mapboxgl.NavigationControl())

      map.current.on("click", (e) => {
        setReportLocation({
          lat: e.lngLat.lat,
          lng: e.lngLat.lng,
        })
        setShowReportDialog(true)
      })

      map.current.on("error", (e) => {
        console.error("Mapbox error:", e)
        setMapboxError("Failed to load map. Please check your internet connection.")
      })
    } catch (error) {
      console.error("Failed to initialize Mapbox:", error)
      setMapboxError("Failed to initialize map.")
    }

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [mapboxToken])

  // Update map center when user location is available
  useEffect(() => {
    if (map.current && latitude && longitude) {
      map.current.setCenter([longitude, latitude])

      new mapboxgl.Marker({ color: "#3B82F6" })
        .setLngLat([longitude, latitude])
        .setPopup(new mapboxgl.Popup().setHTML("<p>Your Location</p>"))
        .addTo(map.current)

      // Fetch real parking data for this location
      fetchRealParkingData(latitude, longitude)
    }
  }, [latitude, longitude])

  const fetchRealParkingData = async (lat: number, lng: number) => {
    setLoading(true)
    try {
      const spots = await parkingService.getRealParkingSpots(lat, lng, 2000, {
        maxPrice: filters.maxPrice || undefined,
        requireRealTime: filters.requireRealTime,
        requireAvailability: filters.requireAvailability,
      })
      setRealSpots(spots)
    } catch (error) {
      console.error("Error fetching real parking data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Update parking spot markers
  useEffect(() => {
    if (!map.current) return

    // Clear existing markers
    const existingMarkers = document.querySelectorAll(".parking-spot-marker")
    existingMarkers.forEach((marker) => marker.remove())

    realSpots.forEach((spot) => {
      const el = document.createElement("div")
      el.className = "parking-spot-marker"

      const markerColor = getMarkerColor(spot)
      const markerIcon = getMarkerIcon(spot)

      el.innerHTML = `
        <div class="w-10 h-10 ${markerColor} rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
          ${markerIcon}
        </div>
      `

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-3 max-w-sm">
          <h3 class="font-semibold text-lg mb-2">${spot.name}</h3>
          <div class="space-y-1 text-sm">
            <p class="text-gray-600">${spot.address}</p>
            <div class="flex items-center gap-2">
              <Badge variant="outline">${spot.spot_type}</Badge>
              <Badge variant="outline">${spot.provider}</Badge>
              ${spot.real_time_data ? '<Badge class="bg-green-100 text-green-800">Live</Badge>' : ""}
            </div>
            ${spot.price_per_hour ? `<p class="text-green-600 font-medium">$${spot.price_per_hour}/hour</p>` : '<p class="text-blue-600">Free</p>'}
            ${spot.total_spaces ? `<p class="text-gray-500">${spot.available_spaces || "?"}/${spot.total_spaces} spaces</p>` : ""}
            ${spot.restrictions?.length ? `<p class="text-orange-600 text-xs">${spot.restrictions.join(", ")}</p>` : ""}
          </div>
          <div class="flex gap-1 mt-2">
            ${spot.accessibility ? '<Badge class="text-xs bg-blue-100 text-blue-800">♿</Badge>' : ""}
            ${spot.ev_charging ? '<Badge class="text-xs bg-green-100 text-green-800">⚡</Badge>' : ""}
            ${spot.covered ? '<Badge class="text-xs bg-gray-100 text-gray-800">🏠</Badge>' : ""}
            ${spot.security ? '<Badge class="text-xs bg-purple-100 text-purple-800">🔒</Badge>' : ""}
          </div>
        </div>
      `)

      const marker = new mapboxgl.Marker(el)
        .setLngLat([spot.longitude, spot.latitude])
        .setPopup(popup)
        .addTo(map.current!)

      el.addEventListener("click", () => {
        setSelectedSpot(spot)
        onSpotSelect?.(spot)
      })
    })
  }, [realSpots, onSpotSelect])

  const getMarkerColor = (spot: RealParkingSpot): string => {
    if (!spot.is_available) return "bg-red-500"
    if (spot.real_time_data) return "bg-green-500"
    if (spot.price_per_hour === 0) return "bg-blue-500"
    return "bg-yellow-500"
  }

  const getMarkerIcon = (spot: RealParkingSpot): string => {
    const iconClass = "w-5 h-5 text-white"
    switch (spot.spot_type) {
      case "garage":
        return `<svg class="${iconClass}" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/></svg>`
      case "meter":
        return `<svg class="${iconClass}" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1a2 2 0 002 2V4zM4 13v3a2 2 0 002 2h8a2 2 0 002-2v-3a2 2 0 002-2V9a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z"/></svg>`
      default:
        return `<svg class="${iconClass}" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>`
    }
  }

  if (mapboxError) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-6 max-w-md">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Map Unavailable</h3>
          <p className="text-gray-600 mb-4">{mapboxError}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

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

  if (!mapboxToken) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-6">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Map...</h3>
          <p className="text-gray-600">Initializing Mapbox service</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full">
      <div ref={mapContainer} className="h-full w-full" />

      {/* Map Controls */}
      <div className="absolute top-4 left-4 space-y-2">
        <Card className="p-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Live Data</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Free</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Paid</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Unavailable</span>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="text-sm font-medium">{loading ? "Loading..." : `${realSpots.length} spots found`}</div>
          <div className="text-xs text-gray-500 mt-1">
            From {new Set(realSpots.map((s) => s.provider)).size} providers
          </div>
        </Card>
      </div>

      {/* Add Spot Button */}
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

      {/* Refresh Button */}
      <Button
        variant="outline"
        className="absolute bottom-6 right-24 rounded-full w-14 h-14 shadow-lg"
        onClick={() => {
          if (latitude && longitude) {
            fetchRealParkingData(latitude, longitude)
          }
        }}
        disabled={!latitude || !longitude || loading}
      >
        <Navigation className="w-6 h-6" />
      </Button>

      <SpotReportDialog open={showReportDialog} onOpenChange={setShowReportDialog} location={reportLocation} />

      {/* Selected Spot Details */}
      {selectedSpot && (
        <Card className="absolute bottom-6 left-6 max-w-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{selectedSpot.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-600">{selectedSpot.address}</p>

            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline">{selectedSpot.spot_type}</Badge>
              <Badge variant="outline">{selectedSpot.provider}</Badge>
              {selectedSpot.real_time_data && <Badge className="bg-green-100 text-green-800">Live</Badge>}
            </div>

            {selectedSpot.price_per_hour !== undefined && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span className="font-medium">
                  {selectedSpot.price_per_hour === 0 ? "Free" : `$${selectedSpot.price_per_hour}/hour`}
                </span>
              </div>
            )}

            {selectedSpot.total_spaces && (
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4" />
                <span>
                  {selectedSpot.available_spaces || "?"}/{selectedSpot.total_spaces} spaces
                </span>
              </div>
            )}

            <div className="flex gap-1 flex-wrap">
              {selectedSpot.accessibility && <Badge className="text-xs bg-blue-100 text-blue-800">♿ Accessible</Badge>}
              {selectedSpot.ev_charging && (
                <Badge className="text-xs bg-green-100 text-green-800">⚡ EV Charging</Badge>
              )}
              {selectedSpot.covered && <Badge className="text-xs bg-gray-100 text-gray-800">🏠 Covered</Badge>}
              {selectedSpot.security && <Badge className="text-xs bg-purple-100 text-purple-800">🔒 Secure</Badge>}
            </div>

            {selectedSpot.restrictions && selectedSpot.restrictions.length > 0 && (
              <div className="text-xs text-orange-600">
                <strong>Restrictions:</strong> {selectedSpot.restrictions.join(", ")}
              </div>
            )}

            <div className="flex gap-2">
              <Button size="sm" className="flex-1">
                Navigate
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedSpot(null)}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
