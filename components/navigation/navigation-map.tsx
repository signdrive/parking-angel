"use client"

import { useEffect, useRef, useState } from "react"
import { useNavigationStore } from "@/lib/navigation-store"
import { NavigationService } from "@/lib/navigation-service"
import { cn } from "@/lib/utils"
import { Navigation, MapPin, ArrowUp, ArrowRight, ArrowLeft, RotateCcw } from "lucide-react"

interface NavigationMapProps {
  mapboxToken?: string
}

export function NavigationMap({ mapboxToken }: NavigationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)

  const { currentRoute, userLocation, destination, currentStep, isDayMode } = useNavigationStore()
  const navigationService = NavigationService.getInstance()

  // Fallback street visualization when Mapbox fails
  const StreetVisualization = () => {
    if (!currentRoute || !currentRoute.steps[currentStep]) return null

    const currentStepData = currentRoute.steps[currentStep]
    const nextStep = currentRoute.steps[currentStep + 1]

    return (
      <div className={cn("h-full relative overflow-hidden", isDayMode ? "bg-gray-100" : "bg-gray-800")}>
        {/* Street Background */}
        <div className="absolute inset-0">
          {/* Main road */}
          <div
            className={cn(
              "absolute left-1/2 transform -translate-x-1/2 w-32 h-full",
              isDayMode ? "bg-gray-300" : "bg-gray-600",
            )}
          >
            {/* Road markings */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-white opacity-60">
              <div className="flex flex-col h-full">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="flex-1 border-b-4 border-transparent border-b-white opacity-80" />
                ))}
              </div>
            </div>
          </div>

          {/* Side streets */}
          <div className={cn("absolute top-1/3 left-0 right-0 h-20", isDayMode ? "bg-gray-300" : "bg-gray-600")} />
          <div className={cn("absolute top-2/3 left-0 right-0 h-20", isDayMode ? "bg-gray-300" : "bg-gray-600")} />

          {/* Buildings */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute w-16 h-24 rounded-sm",
                isDayMode ? "bg-gray-400" : "bg-gray-700",
                i % 2 === 0 ? "left-4" : "right-4",
              )}
              style={{
                top: `${10 + i * 10}%`,
                height: `${60 + Math.random() * 40}px`,
              }}
            />
          ))}
        </div>

        {/* Current Position */}
        <div className="absolute left-1/2 bottom-20 transform -translate-x-1/2">
          <div className="relative">
            <div className="w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              <ArrowUp className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-blue-600" />
          </div>
        </div>

        {/* Route Line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-2 h-full bg-blue-500 opacity-80" />

        {/* Turn Indicator */}
        {nextStep && (
          <div className="absolute left-1/2 top-1/3 transform -translate-x-1/2">
            <div className="bg-yellow-500 rounded-full p-3 shadow-lg animate-pulse">
              {nextStep.maneuver.type === "turn-left" && <ArrowLeft className="w-6 h-6 text-white" />}
              {nextStep.maneuver.type === "turn-right" && <ArrowRight className="w-6 h-6 text-white" />}
              {nextStep.maneuver.type === "straight" && <ArrowUp className="w-6 h-6 text-white" />}
              {nextStep.maneuver.type === "roundabout" && <RotateCcw className="w-6 h-6 text-white" />}
            </div>
          </div>
        )}

        {/* Destination */}
        {currentStep === currentRoute.steps.length - 1 && (
          <div className="absolute left-1/2 top-20 transform -translate-x-1/2">
            <div className="bg-red-600 rounded-full p-3 shadow-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
          </div>
        )}

        {/* Street Names */}
        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
          {currentStepData.streetName}
        </div>

        {nextStep && (
          <div className="absolute top-1/3 right-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
            Next: {nextStep.streetName}
          </div>
        )}

        {/* Speed Limit */}
        {currentStepData.speedLimit && (
          <div className="absolute top-4 right-4 bg-white border-2 border-red-600 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-red-600">{currentStepData.speedLimit}</div>
            <div className="text-xs text-gray-600">MPH</div>
          </div>
        )}

        {/* Distance to next turn */}
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg text-center">
          <div className="text-2xl font-bold">{navigationService.formatDistance(currentStepData.distance)}</div>
          <div className="text-xs opacity-75">to next turn</div>
        </div>
      </div>
    )
  }

  // Try to load Mapbox map
  useEffect(() => {
    let mounted = true

    const loadMapbox = async () => {
      try {
        if (!mapboxToken) {
          console.log("No Mapbox token, using fallback visualization")
          setMapError(true)
          return
        }

        // Dynamic import of mapbox-gl
        const mapboxgl = await import("mapbox-gl")
        await import("mapbox-gl/dist/mapbox-gl.css")

        if (!mounted || !mapContainer.current) return

        mapboxgl.accessToken = mapboxToken

        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: isDayMode ? "mapbox://styles/mapbox/navigation-day-v1" : "mapbox://styles/mapbox/navigation-night-v1",
          center: userLocation ? [userLocation.longitude, userLocation.latitude] : [-122.4194, 37.7749],
          zoom: 16,
          pitch: 60,
          bearing: userLocation?.heading || 0,
          attributionControl: false,
        })

        map.on("load", () => {
          if (mounted) {
            setMapLoaded(true)
            console.log("✅ Mapbox map loaded successfully")
          }
        })

        map.on("error", (e) => {
          console.error("❌ Mapbox error:", e)
          if (mounted) {
            setMapError(true)
          }
        })

        return () => {
          if (map) map.remove()
        }
      } catch (error) {
        console.error("❌ Failed to load Mapbox:", error)
        if (mounted) {
          setMapError(true)
        }
      }
    }

    loadMapbox()

    return () => {
      mounted = false
    }
  }, [mapboxToken, isDayMode, userLocation])

  return (
    <div className="relative w-full h-full">
      {/* Mapbox container */}
      <div ref={mapContainer} className={cn("w-full h-full", mapError ? "hidden" : "block")} />

      {/* Fallback street visualization */}
      {(mapError || !mapLoaded) && <StreetVisualization />}

      {/* Loading state */}
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div className="text-center">
            <Navigation className="w-12 h-12 mx-auto mb-2 opacity-50 animate-pulse" />
            <p className="text-sm opacity-75">Loading Navigation Map...</p>
          </div>
        </div>
      )}

      {/* Navigation overlay elements */}
      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
        {mapLoaded ? "Live Navigation" : "Street View"}
      </div>

      {/* Speed indicator */}
      {userLocation?.speed && userLocation.speed > 0 && (
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg">
          <div className="text-2xl font-bold">{Math.round(userLocation.speed * 2.237)}</div>
          <div className="text-xs opacity-75">mph</div>
        </div>
      )}

      {/* Next turn preview */}
      {currentRoute && currentStep < currentRoute.steps.length - 1 && (
        <div className="absolute bottom-20 right-4 bg-black/80 text-white p-3 rounded-lg max-w-48">
          <div className="text-xs opacity-75 mb-1">Next</div>
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {navigationService.getManeuverIcon(currentRoute.steps[currentStep + 1].maneuver)}
            </span>
            <div className="text-sm">{currentRoute.steps[currentStep + 1].instruction}</div>
          </div>
          <div className="text-xs opacity-75 mt-1">
            in {navigationService.formatDistance(currentRoute.steps[currentStep + 1].distance)}
          </div>
        </div>
      )}
    </div>
  )
}
