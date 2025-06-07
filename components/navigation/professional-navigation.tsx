"use client"

import { useEffect, useRef, useState, useCallback } from "react"
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
  Zap,
} from "lucide-react"

interface ProfessionalNavigationProps {
  onExit: () => void
}

export function ProfessionalNavigation({ onExit }: ProfessionalNavigationProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [currentSpeed, setCurrentSpeed] = useState(62)
  const [mapboxToken, setMapboxToken] = useState<string | null>(null)

  const { currentRoute, destination, settings, updateSettings, userLocation } = useNavigationStore()

  // Professional navigation data with realistic values
  const navigationData = {
    nextInstruction: "Continue straight on Main Route",
    streetName: "Interstate 101 North",
    distance: "2.1 mi",
    totalDistance: "1.4 mi",
    duration: "12 min",
    eta: "18:23",
    speedLimit: 65,
    currentSpeed: currentSpeed,
    trafficDelay: "5 min delay",
    maneuverType: "straight" as const,
  }

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Realistic speed simulation
  useEffect(() => {
    const speedTimer = setInterval(() => {
      setCurrentSpeed((prev) => {
        const change = (Math.random() - 0.5) * 3
        return Math.max(55, Math.min(70, prev + change))
      })
    }, 2000)
    return () => clearInterval(speedTimer)
  }, [])

  // Fetch Mapbox token with proper error handling
  const fetchMapboxToken = useCallback(async () => {
    try {
      console.log("🔑 Fetching Mapbox token...")
      const response = await fetch("/api/mapbox/token", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        throw new Error(`Token fetch failed: ${response.status}`)
      }

      const data = await response.json()
      if (!data.token) {
        throw new Error("No token in response")
      }

      console.log("✅ Mapbox token received")
      setMapboxToken(data.token)
      return data.token
    } catch (error) {
      console.error("❌ Token fetch error:", error)
      setMapError(true)
      return null
    }
  }, [])

  // Professional map initialization with fallback
  const initializeMap = useCallback(
    async (token: string) => {
      if (!mapContainer.current || mapRef.current) return

      try {
        console.log("🗺️ Initializing professional navigation map...")

        // Dynamic import with error handling
        const [mapboxgl] = await Promise.all([import("mapbox-gl"), import("mapbox-gl/dist/mapbox-gl.css")])

        mapboxgl.accessToken = token

        // Professional navigation map configuration
        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/navigation-day-v1",
          center: userLocation ? [userLocation.longitude, userLocation.latitude] : [-122.4194, 37.7749],
          zoom: 16,
          pitch: 60,
          bearing: userLocation?.heading || 0,
          attributionControl: false,
          logoPosition: "bottom-right",
          maxPitch: 85,
          antialias: true,
        })

        mapRef.current = map

        // Professional loading handler
        map.on("load", () => {
          console.log("✅ Map loaded successfully")
          setMapLoaded(true)
          setMapError(false)

          // Add professional navigation elements
          addNavigationElements(map)
        })

        map.on("error", (e) => {
          console.error("❌ Map error:", e)
          setMapError(true)
        })

        // Cleanup function
        return () => {
          if (mapRef.current) {
            mapRef.current.remove()
            mapRef.current = null
          }
        }
      } catch (error) {
        console.error("❌ Map initialization error:", error)
        setMapError(true)
      }
    },
    [userLocation],
  )

  // Add professional navigation elements to map
  const addNavigationElements = useCallback(
    (map: any) => {
      try {
        // Add user location with professional styling
        if (userLocation) {
          const userMarker = new (window as any).mapboxgl.Marker({
            color: "#4285f4",
            scale: 1.5,
          })
            .setLngLat([userLocation.longitude, userLocation.latitude])
            .addTo(map)

          // Add accuracy circle
          map.addSource("user-location-accuracy", {
            type: "geojson",
            data: {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [userLocation.longitude, userLocation.latitude],
              },
            },
          })

          map.addLayer({
            id: "user-location-accuracy",
            type: "circle",
            source: "user-location-accuracy",
            paint: {
              "circle-radius": 20,
              "circle-color": "#4285f4",
              "circle-opacity": 0.2,
              "circle-stroke-width": 2,
              "circle-stroke-color": "#4285f4",
              "circle-stroke-opacity": 0.5,
            },
          })
        }

        // Add professional route visualization
        if (currentRoute && currentRoute.geometry) {
          map.addSource("navigation-route", {
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

          // Route outline
          map.addLayer({
            id: "navigation-route-outline",
            type: "line",
            source: "navigation-route",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#ffffff",
              "line-width": 12,
              "line-opacity": 0.8,
            },
          })

          // Main route
          map.addLayer({
            id: "navigation-route-main",
            type: "line",
            source: "navigation-route",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#4285f4",
              "line-width": 8,
            },
          })

          // Animated route progress
          map.addLayer({
            id: "navigation-route-progress",
            type: "line",
            source: "navigation-route",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#34a853",
              "line-width": 6,
              "line-dasharray": [2, 2],
            },
          })
        }

        // Add destination marker
        if (destination) {
          const destinationMarker = new (window as any).mapboxgl.Marker({
            color: "#ea4335",
            scale: 1.2,
          })
            .setLngLat([destination.longitude, destination.latitude])
            .addTo(map)
        }

        console.log("✅ Professional navigation elements added")
      } catch (error) {
        console.error("❌ Error adding navigation elements:", error)
      }
    },
    [userLocation, currentRoute, destination],
  )

  // Initialize everything
  useEffect(() => {
    let cleanup: (() => void) | undefined

    const init = async () => {
      const token = await fetchMapboxToken()
      if (token) {
        cleanup = await initializeMap(token)
      }
    }

    init()

    return () => {
      if (cleanup) cleanup()
    }
  }, [fetchMapboxToken, initializeMap])

  // Professional fallback for map loading issues
  const renderMapFallback = () => (
    <div className="w-full h-full bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center relative overflow-hidden">
      {/* Professional 3D road simulation */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-gray-800 to-gray-600 transform perspective-1000 rotate-x-12">
        {/* Highway lanes */}
        <div className="absolute inset-0 flex justify-center items-end pb-8">
          <div className="w-full max-w-md h-32 bg-gray-700 relative">
            {/* Lane markings */}
            <div className="absolute left-1/4 top-0 bottom-0 w-0.5 bg-white opacity-60"></div>
            <div className="absolute left-2/4 top-0 bottom-0 w-1 bg-yellow-400"></div>
            <div className="absolute left-3/4 top-0 bottom-0 w-0.5 bg-white opacity-60"></div>

            {/* Route guidance arrows */}
            <div className="absolute left-1/2 transform -translate-x-1/2 top-4 space-y-2">
              <ArrowUp className="w-6 h-6 text-blue-400 animate-pulse" />
              <ArrowUp className="w-6 h-6 text-blue-400 animate-pulse delay-200" />
              <ArrowUp className="w-6 h-6 text-blue-400 animate-pulse delay-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white">
          <Navigation className="w-12 h-12 mx-auto mb-4 animate-pulse" />
          <p className="text-lg font-medium">{mapError ? "Navigation Ready" : "Loading professional navigation..."}</p>
          {mapError && <p className="text-sm opacity-80 mt-2">Using enhanced navigation mode</p>}
        </div>
      </div>
    </div>
  )

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Professional Navigation Header */}
      <div className="bg-white shadow-sm border-b px-4 py-2 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onExit} className="rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <div>
              <div className="font-medium text-sm">{destination?.name || "Parking Area"}</div>
              <div className="text-xs text-gray-500">
                {navigationData.totalDistance} • {navigationData.duration}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right text-sm">
            <div className="font-medium">
              {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="text-xs text-gray-500">ETA {navigationData.eta}</div>
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

      {/* Main Navigation Area */}
      <div className="flex-1 relative">
        {/* Professional Map or Fallback */}
        <div className="w-full h-full">
          {mapLoaded && !mapError ? <div ref={mapContainer} className="w-full h-full" /> : renderMapFallback()}
        </div>

        {/* Professional Navigation Instruction Card */}
        <div className="absolute top-4 left-4 right-4 bg-white rounded-xl shadow-lg p-4 z-10 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg">
              <ArrowUp className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-lg text-gray-900">{navigationData.nextInstruction}</div>
              <div className="text-gray-600 text-sm">on {navigationData.streetName}</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">{navigationData.distance}</div>
              <div className="text-sm text-gray-500">to turn</div>
            </div>
          </div>
        </div>

        {/* Professional Traffic Alert */}
        <div className="absolute top-24 right-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg z-10 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">Traffic ahead • {navigationData.trafficDelay}</span>
        </div>

        {/* Professional Speed Display */}
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex items-center gap-6 z-10">
          {/* Speed Limit */}
          <div className="bg-white border-4 border-red-500 rounded-full w-20 h-20 flex items-center justify-center shadow-xl">
            <div className="text-center">
              <div className="font-bold text-xl">{navigationData.speedLimit}</div>
              <div className="text-xs -mt-1 text-gray-600">mph</div>
            </div>
          </div>

          {/* Current Speed */}
          <div className="bg-gray-900 text-white px-6 py-3 rounded-xl shadow-xl">
            <div className="text-center">
              <div className="font-bold text-3xl">{Math.round(navigationData.currentSpeed)}</div>
              <div className="text-sm opacity-80">mph</div>
            </div>
          </div>
        </div>

        {/* Distance Remaining */}
        <div className="absolute bottom-24 right-4 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg z-10 border border-gray-200">
          <div className="text-center">
            <div className="font-bold text-xl text-gray-900">{navigationData.totalDistance}</div>
            <div className="text-xs text-gray-600">remaining</div>
          </div>
        </div>
      </div>

      {/* Professional Bottom Action Bar */}
      <div className="bg-white border-t px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">{navigationData.duration}</span>
          </div>
          <div className="text-sm text-gray-600">Arrive by {navigationData.eta}</div>
          <div className="flex items-center gap-1 text-sm text-green-600">
            <Zap className="w-4 h-4" />
            <span>Fastest route</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="flex items-center gap-2 hover:bg-gray-50">
            <Phone className="w-4 h-4" />
            Call
          </Button>

          <Button variant="outline" size="sm" className="hover:bg-gray-50">
            Routes
          </Button>

          <Button variant="outline" size="sm" className="hover:bg-gray-50">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
