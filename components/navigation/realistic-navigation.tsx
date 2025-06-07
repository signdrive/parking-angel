"use client"

import { useEffect, useRef, useState } from "react"
import { useNavigationStore } from "@/lib/navigation-store"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Phone,
  Volume2,
  VolumeX,
  MoreHorizontal,
  Navigation,
  Clock,
  AlertTriangle,
  ArrowUp,
} from "lucide-react"

interface RealisticNavigationProps {
  onExit: () => void
}

export function RealisticNavigation({ onExit }: RealisticNavigationProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [currentSpeed, setCurrentSpeed] = useState(63)

  const { currentRoute, destination, settings, updateSettings, userLocation } = useNavigationStore()

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Simulate speed changes
  useEffect(() => {
    const speedTimer = setInterval(() => {
      setCurrentSpeed((prev) => {
        const change = (Math.random() - 0.5) * 4
        return Math.max(45, Math.min(75, prev + change))
      })
    }, 2000)
    return () => clearInterval(speedTimer)
  }, [])

  // Load real Mapbox map
  useEffect(() => {
    let mounted = true

    const loadMap = async () => {
      try {
        // Get Mapbox token
        const tokenResponse = await fetch("/api/mapbox/token")
        if (!tokenResponse.ok) {
          console.error("Failed to get Mapbox token")
          return
        }
        const { token } = await tokenResponse.json()

        // Load Mapbox GL
        const mapboxgl = await import("mapbox-gl")
        await import("mapbox-gl/dist/mapbox-gl.css")

        if (!mounted || !mapContainer.current) return

        mapboxgl.accessToken = token

        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/navigation-day-v1",
          center: userLocation ? [userLocation.longitude, userLocation.latitude] : [-122.4194, 37.7749],
          zoom: 17,
          pitch: 60,
          bearing: userLocation?.heading || 0,
          attributionControl: false,
        })

        map.on("load", () => {
          if (!mounted) return
          setMapLoaded(true)

          // Add user location
          if (userLocation) {
            new mapboxgl.Marker({
              color: "#4285f4",
              scale: 1.2,
            })
              .setLngLat([userLocation.longitude, userLocation.latitude])
              .addTo(map)
          }

          // Add route if available
          if (currentRoute) {
            map.addSource("route", {
              type: "geojson",
              data: {
                type: "Feature",
                properties: {},
                geometry: {
                  type: "LineString",
                  coordinates: currentRoute.geometry,
                },
              },
            })

            map.addLayer({
              id: "route",
              type: "line",
              source: "route",
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                "line-color": "#4285f4",
                "line-width": 8,
              },
            })
          }
        })

        return () => {
          if (map) map.remove()
        }
      } catch (error) {
        console.error("Failed to load map:", error)
      }
    }

    loadMap()

    return () => {
      mounted = false
    }
  }, [userLocation, currentRoute])

  // Mock navigation data for realistic display
  const mockNavigation = {
    nextInstruction: "Continue straight on Main Route",
    distance: "3520.5 km",
    duration: "293h 22m",
    eta: "18:23",
    speedLimit: 65,
    streetName: "Interstate 101 North",
    nextTurn: {
      direction: "straight",
      distance: "2.1 mi",
      instruction: "Continue on I-101 N",
    },
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Top Navigation Bar - Google Maps Style */}
      <div className="bg-white shadow-sm border-b px-4 py-2 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onExit} className="rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div>
              <div className="font-medium text-sm">{destination?.name || "Parking Area"}</div>
              <div className="text-xs text-gray-500">
                {mockNavigation.distance} • {mockNavigation.duration}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right text-sm">
            <div className="font-medium">
              {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="text-xs text-gray-500">ETA {mockNavigation.eta}</div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => updateSettings({ voiceGuidance: !settings.voiceGuidance })}
            className="rounded-full hover:bg-gray-100"
          >
            {settings.voiceGuidance ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>

          <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 relative">
        {/* Real Mapbox Map */}
        <div ref={mapContainer} className="w-full h-full" />

        {/* Loading overlay */}
        {!mapLoaded && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <Navigation className="w-8 h-8 mx-auto mb-2 text-blue-500 animate-pulse" />
              <p className="text-sm text-gray-600">Loading navigation...</p>
            </div>
          </div>
        )}

        {/* Navigation Instruction Overlay */}
        <div className="absolute top-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white">
              <ArrowUp className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-lg">{mockNavigation.nextInstruction}</div>
              <div className="text-gray-600">on {mockNavigation.streetName}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{mockNavigation.nextTurn.distance}</div>
            </div>
          </div>
        </div>

        {/* Speed Display */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-10">
          {/* Speed Limit */}
          <div className="bg-white border-4 border-red-500 rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
            <div className="text-center">
              <div className="font-bold text-lg">{mockNavigation.speedLimit}</div>
              <div className="text-xs -mt-1">mph</div>
            </div>
          </div>

          {/* Current Speed */}
          <div className="bg-black/80 text-white px-4 py-2 rounded-lg shadow-lg">
            <div className="text-center">
              <div className="font-bold text-2xl">{Math.round(currentSpeed)}</div>
              <div className="text-sm">mph</div>
            </div>
          </div>
        </div>

        {/* Traffic Alert */}
        <div className="absolute top-20 right-4 bg-orange-500 text-white px-3 py-2 rounded-lg shadow-lg z-10 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">Traffic ahead - 5 min delay</span>
        </div>

        {/* Distance Remaining */}
        <div className="absolute bottom-20 right-4 bg-white/90 px-3 py-2 rounded-lg shadow-lg z-10">
          <div className="text-center">
            <div className="font-bold text-lg">1.4 mi</div>
            <div className="text-xs text-gray-600">remaining</div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-white border-t px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">{mockNavigation.duration}</span>
          </div>
          <div className="text-sm text-gray-600">Arrive by {mockNavigation.eta}</div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Call
          </Button>

          <Button variant="outline" size="sm">
            Routes
          </Button>
        </div>
      </div>
    </div>
  )
}
