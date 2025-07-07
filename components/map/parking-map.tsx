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
import { ParkingSpot } from "@/lib/types/supabase-helpers"

interface ParkingMapProps {
  onSpotSelect?: (spotId: string) => void
}

interface MarkerWithSpot extends mapboxgl.Marker {
  spotData?: ParkingSpot;
}

export function ParkingMap({ onSpotSelect }: ParkingMapProps) {
  // Block Mapbox telemetry
  useMapboxNoTelemetry()
  
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<MarkerWithSpot[]>([])
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

    // Remove existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers
    spots.forEach(spot => {
      if (!spot.latitude || !spot.longitude) return;

      const markerColor = spot.is_available ? '#4CAF50' : '#FF5252';
      const markerElement = document.createElement('div');
      markerElement.className = 'spot-marker';
      markerElement.style.backgroundColor = markerColor;

      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: 'bottom',
      })
        .setLngLat([spot.longitude, spot.latitude])
        .addTo(map.current!);

      (marker as MarkerWithSpot).spotData = spot;
      
      marker.getElement().addEventListener('click', () => {
        if (onSpotSelect) onSpotSelect(spot.id);
      });

      markers.current.push(marker as MarkerWithSpot);
    });
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