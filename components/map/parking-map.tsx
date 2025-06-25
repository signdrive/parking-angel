"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { useMapboxNoTelemetry } from "@/hooks/use-mapbox-no-telemetry"
import { useParkingSpots } from "@/hooks/use-parking-spots"
import { useGeolocation } from "@/hooks/use-geolocation"
import { Button } from "@/components/ui/button"
import { MapPin, Plus } from "lucide-react"
import { SpotReportDialog } from "./spot-report-dialog"

interface ParkingMapProps {
  onSpotSelect?: (spotId: string) => void
}

export function ParkingMap({ onSpotSelect }: ParkingMapProps) {
  // Block Mapbox telemetry
  useMapboxNoTelemetry()
  
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [reportLocation, setReportLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [mapboxError, setMapboxError] = useState<string | null>(null)
  const [mapboxToken, setMapboxToken] = useState<string | null>(null)

  const { latitude, longitude, error: locationError } = useGeolocation()
  const { spots, loading: spotsLoading } = useParkingSpots({
    latitude,
    longitude,
    radius: 1000,
  })

  // Fetch Mapbox token from server
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
          positionOptions: {
            enableHighAccuracy: true,
          },
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
    }
  }, [latitude, longitude])

  // Update parking spot markers
  useEffect(() => {
    if (!map.current || spotsLoading) return

    const existingMarkers = document.querySelectorAll(".parking-spot-marker")
    existingMarkers.forEach((marker) => marker.remove())

    spots.forEach((spot) => {
      const el = document.createElement("div")
      el.className = "parking-spot-marker"
      el.innerHTML = `
        <div class="w-8 h-8 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:bg-green-600 transition-colors">          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        </div>
      `

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-semibold">${spot.spot_type ? spot.spot_type.charAt(0).toUpperCase() + spot.spot_type.slice(1) : 'Unknown'} Parking</h3>
          <p class="text-sm text-gray-600">${spot.address || "Address not available"}</p>
          <p class="text-xs text-gray-500">Updated: ${spot.updated_at ? new Date(spot.updated_at).toLocaleTimeString() : 'Unknown'}</p>
          <p class="text-xs text-green-600">Confidence: ${spot.confidence_score || 0}%</p>
        </div>
      `)

      const marker = new mapboxgl.Marker(el)
        .setLngLat([spot.longitude, spot.latitude])
        .setPopup(popup)
        .addTo(map.current!)

      el.addEventListener("click", () => {
        onSpotSelect?.(spot.id)
      })
    })
  }, [spots, spotsLoading, onSpotSelect])

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
      </div>

      <SpotReportDialog open={showReportDialog} toggleAction={setShowReportDialog} location={reportLocation} />
    </div>
  )
}