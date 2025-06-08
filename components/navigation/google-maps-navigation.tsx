"use client"

import { useEffect, useRef, useState } from "react"
import { useNavigationStore } from "@/lib/navigation-store"
import { NavigationService } from "@/lib/navigation-service"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  MoreVertical,
  Navigation,
  Phone,
  Share,
  Star,
  Clock,
  AlertTriangle,
  Camera,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface GoogleMapsNavigationProps {
  onExit: () => void
}

export function GoogleMapsNavigation({ onExit }: GoogleMapsNavigationProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapboxToken, setMapboxToken] = useState<string | null>(null)
  const [currentSpeed, setCurrentSpeed] = useState(0)
  const [showSpeedCamera, setShowSpeedCamera] = useState(false)

  const {
    currentRoute,
    currentStep,
    userLocation,
    destination,
    eta,
    remainingDistance,
    remainingTime,
    isOffRoute,
    isRecalculating,
    settings,
    updateSettings,
    confirmArrival,
    updateUserLocation,
    updateGpsSignal,
  } = useNavigationStore()

  const navigationService = NavigationService.getInstance()
  const { toast } = useToast()

  // Fetch Mapbox token
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const response = await fetch("/api/mapbox/token")
        if (response.ok) {
          const data = await response.json()
          setMapboxToken(data.token)
        }
      } catch (error) {
        console.error("Failed to fetch Mapbox token:", error)
      }
    }

    fetchMapboxToken()
  }, [])

  // Initialize Google Maps style map
  useEffect(() => {
    let mounted = true

    const loadMap = async () => {
      try {
        if (!mapboxToken || !mapContainer.current) return

        const mapboxgl = await import("mapbox-gl")
        await import("mapbox-gl/dist/mapbox-gl.css")

        if (!mounted) return

        mapboxgl.accessToken = mapboxToken

        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/navigation-day-v1", // Google Maps style
          center: userLocation ? [userLocation.longitude, userLocation.latitude] : [-122.4194, 37.7749],
          zoom: 17,
          pitch: 0, // Google Maps uses 2D by default
          bearing: 0,
          attributionControl: false,
        })

        mapRef.current = map

        map.on("load", () => {
          if (!mounted) return

          // Add Google Maps style route
          if (currentRoute) {
            // Main route line (Google Maps blue)
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

            // Route outline (darker blue)
            map.addLayer({
              id: "route-outline",
              type: "line",
              source: "route",
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                "line-color": "#1a73e8", // Google blue
                "line-width": 12,
                "line-opacity": 0.8,
              },
            })

            // Route main line
            map.addLayer({
              id: "route",
              type: "line",
              source: "route",
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                "line-color": "#4285f4", // Google Maps blue
                "line-width": 8,
                "line-opacity": 1,
              },
            })

            // Add destination marker (Google Maps style)
            if (destination) {
              const destinationEl = document.createElement("div")
              destinationEl.innerHTML = `
                <div class="w-8 h-8 bg-red-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                  <div class="w-3 h-3 bg-white rounded-full"></div>
                </div>
              `
              new mapboxgl.Marker({ element: destinationEl })
                .setLngLat([destination.longitude, destination.latitude])
                .addTo(map)
            }
          }

          // Add user location (Google Maps style blue dot)
          if (userLocation) {
            const userEl = document.createElement("div")
            userEl.innerHTML = `
              <div class="relative">
                <div class="w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div class="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            `

            new mapboxgl.Marker({ element: userEl })
              .setLngLat([userLocation.longitude, userLocation.latitude])
              .addTo(map)
          }

          setMapLoaded(true)
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
  }, [mapboxToken, userLocation, destination, currentRoute])

  // Simulate speed updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSpeed(Math.floor(Math.random() * 20) + 25) // 25-45 mph
      setShowSpeedCamera(Math.random() > 0.8) // Occasionally show speed camera
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  if (!currentRoute || !destination) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <div className="text-center">
          <Navigation className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-pulse" />
          <p className="text-gray-600">Loading navigation...</p>
        </div>
      </div>
    )
  }

  const currentStepData = currentRoute.steps[currentStep]
  const nextStep = currentRoute.steps[currentStep + 1]
  const isLastStep = currentStep === currentRoute.steps.length - 1

  // Get next turn instruction
  const getNextInstruction = () => {
    if (!nextStep) return "Continue to destination"
    return nextStep.instruction
  }

  // Get next turn distance
  const getNextDistance = () => {
    if (!nextStep) return remainingDistance
    return nextStep.distance
  }

  // Get turn icon for Google Maps style
  const getTurnIcon = () => {
    if (!nextStep) return "🏁"
    switch (nextStep.maneuver.type) {
      case "turn-left":
        return "↰"
      case "turn-right":
        return "↱"
      case "straight":
        return "↑"
      case "roundabout":
        return "↻"
      case "arrive":
        return "🏁"
      default:
        return "↑"
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Google Maps Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Back button and destination */}
          <div className="flex items-center gap-3 flex-1">
            <Button variant="ghost" size="icon" onClick={onExit} className="rounded-full hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                <span className="font-medium text-gray-900 truncate">{destination.name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>{navigationService.formatDistance(remainingDistance)}</span>
                <span>•</span>
                <span>{navigationService.formatDuration(remainingTime)}</span>
                <span>•</span>
                <span className="text-green-600 font-medium">
                  {eta ? eta.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}
                </span>
              </div>
            </div>
          </div>

          {/* Right side - Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => updateSettings({ voiceGuidance: !settings.voiceGuidance })}
              className="rounded-full hover:bg-gray-100"
            >
              {settings.voiceGuidance ? (
                <Volume2 className="w-5 h-5 text-blue-600" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-600" />
              )}
            </Button>

            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Rerouting banner */}
      {isRecalculating && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
          <div className="flex items-center gap-2 text-blue-800">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Rerouting...</span>
          </div>
        </div>
      )}

      {/* Off route banner */}
      {isOffRoute && !isRecalculating && (
        <div className="bg-orange-50 border-b border-orange-200 px-4 py-2">
          <div className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Off route • Rerouting</span>
          </div>
        </div>
      )}

      {/* Main Map */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full" />

        {/* Speed limit (Google Maps style) */}
        {currentStepData.speedLimit && (
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
            <div className="w-12 h-12 border-2 border-red-600 rounded-full flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-black">{currentStepData.speedLimit}</span>
              <span className="text-xs text-gray-600 -mt-1">mph</span>
            </div>
          </div>
        )}

        {/* Speed camera alert */}
        {showSpeedCamera && (
          <div className="absolute top-20 right-4 bg-red-600 text-white rounded-lg shadow-lg p-3 flex items-center gap-2">
            <Camera className="w-4 h-4" />
            <span className="text-sm font-medium">Speed camera ahead</span>
          </div>
        )}

        {/* Current speed */}
        <div className="absolute bottom-32 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{currentSpeed}</div>
            <div className="text-xs text-gray-600">mph</div>
          </div>
        </div>

        {/* Lane guidance (Google Maps style) */}
        {currentStepData.laneGuidance && (
          <div className="absolute bottom-40 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
            <div className="flex gap-1">
              {currentStepData.laneGuidance.lanes.map((lane, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-8 h-12 border-2 rounded flex items-end justify-center pb-1",
                    lane.valid ? "border-blue-600 bg-blue-50" : "border-gray-300 bg-gray-50",
                  )}
                >
                  {lane.indications.includes("straight") && (
                    <div className={cn("text-lg", lane.valid ? "text-blue-600" : "text-gray-400")}>↑</div>
                  )}
                  {lane.indications.includes("right") && (
                    <div className={cn("text-lg", lane.valid ? "text-blue-600" : "text-gray-400")}>↗</div>
                  )}
                  {lane.indications.includes("left") && (
                    <div className={cn("text-lg", lane.valid ? "text-blue-600" : "text-gray-400")}>↖</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Google Maps Bottom Sheet */}
      <div className="bg-white border-t border-gray-200 shadow-lg">
        {/* Main instruction */}
        <div className="px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Turn icon */}
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {getTurnIcon()}
            </div>

            {/* Instruction text */}
            <div className="flex-1">
              <div className="text-lg font-medium text-gray-900">{getNextInstruction()}</div>
              {nextStep && <div className="text-sm text-gray-600 mt-1">on {nextStep.streetName}</div>}
            </div>

            {/* Distance */}
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {navigationService.formatDistance(getNextDistance())}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="border-t border-gray-100 px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left actions */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                <Star className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>

              {/* Arrival button */}
              {isLastStep && remainingDistance < 100 && (
                <Button
                  onClick={confirmArrival}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full"
                >
                  I'm here
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Traffic info */}
        <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Typical traffic for this time</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-green-600 font-medium">Light traffic</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
