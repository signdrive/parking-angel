"use client"

import { useEffect, useRef, useState } from "react"
import { useNavigationStore } from "@/lib/navigation-store"
import { NavigationService } from "@/lib/navigation-service"
import { cn } from "@/lib/utils"
import { Navigation, MapPin, ArrowUp, ArrowRight, ArrowLeft, RotateCcw, Mountain, Satellite, Eye } from "lucide-react"

interface NavigationMapProps {
  mapboxToken?: string
}

export function NavigationMap({ mapboxToken }: NavigationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)

  const { currentRoute, userLocation, destination, currentStep, settings } = useNavigationStore()
  const navigationService = NavigationService.getInstance()

  const isDayMode =
    settings.theme === "day" || (settings.theme === "auto" && new Date().getHours() >= 6 && new Date().getHours() < 20)

  // Enhanced street visualization with different modes
  const EnhancedStreetVisualization = () => {
    if (!currentRoute || !currentRoute.steps[currentStep]) return null

    const currentStepData = currentRoute.steps[currentStep]
    const nextStep = currentRoute.steps[currentStep + 1]

    // Different visual styles based on settings
    const getMapStyle = () => {
      switch (settings.mapStyle) {
        case "satellite":
          return {
            background: "bg-green-800",
            road: "bg-gray-600",
            buildings: "bg-green-900",
            overlay: "satellite view",
          }
        case "terrain":
          return {
            background: "bg-amber-100",
            road: "bg-gray-400",
            buildings: "bg-amber-200",
            overlay: "terrain view",
          }
        case "hybrid":
          return {
            background: "bg-green-700",
            road: "bg-gray-500",
            buildings: "bg-green-800",
            overlay: "hybrid view",
          }
        default:
          return {
            background: isDayMode ? "bg-gray-100" : "bg-gray-800",
            road: isDayMode ? "bg-gray-300" : "bg-gray-600",
            buildings: isDayMode ? "bg-gray-400" : "bg-gray-700",
            overlay: "navigation view",
          }
      }
    }

    const mapStyle = getMapStyle()

    // Different perspectives based on view mode
    const getViewPerspective = () => {
      switch (settings.viewMode) {
        case "3d":
          return {
            perspective: "perspective-1000",
            transform: "rotateX(60deg)",
            buildings: "h-32",
            description: "3D perspective view",
          }
        case "bird-eye":
          return {
            perspective: "perspective-500",
            transform: "rotateX(30deg)",
            buildings: "h-24",
            description: "bird's eye view",
          }
        case "follow":
          return {
            perspective: "",
            transform: "rotateX(0deg)",
            buildings: "h-20",
            description: "follow mode",
          }
        default:
          return {
            perspective: "",
            transform: "rotateX(0deg)",
            buildings: "h-16",
            description: "2D top-down view",
          }
      }
    }

    const viewPerspective = getViewPerspective()

    return (
      <div className={cn("h-full relative overflow-hidden", mapStyle.background)}>
        {/* Map Style Indicator */}
        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm z-10">
          {mapStyle.overlay} • {viewPerspective.description}
        </div>

        {/* 3D Container */}
        <div className={cn("h-full w-full", viewPerspective.perspective)}>
          <div
            className="h-full w-full transition-transform duration-500"
            style={{ transform: viewPerspective.transform }}
          >
            {/* Street Background */}
            <div className="absolute inset-0">
              {/* Main road */}
              <div className={cn("absolute left-1/2 transform -translate-x-1/2 w-32 h-full", mapStyle.road)}>
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
              <div className={cn("absolute top-1/3 left-0 right-0 h-20", mapStyle.road)} />
              <div className={cn("absolute top-2/3 left-0 right-0 h-20", mapStyle.road)} />

              {/* Buildings with different heights based on view mode */}
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "absolute w-16 rounded-sm transition-all duration-500",
                    mapStyle.buildings,
                    viewPerspective.buildings,
                    i % 2 === 0 ? "left-4" : "right-4",
                  )}
                  style={{
                    top: `${5 + i * 8}%`,
                    height:
                      settings.viewMode === "3d" ? `${80 + Math.random() * 60}px` : `${40 + Math.random() * 30}px`,
                  }}
                />
              ))}

              {/* Satellite view overlay */}
              {settings.mapStyle === "satellite" && (
                <div className="absolute inset-0 bg-green-900/20">
                  {/* Simulate satellite imagery patterns */}
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute bg-green-700/30 rounded-full"
                      style={{
                        left: `${20 + i * 15}%`,
                        top: `${10 + i * 12}%`,
                        width: `${30 + Math.random() * 20}px`,
                        height: `${30 + Math.random() * 20}px`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Terrain view overlay */}
              {settings.mapStyle === "terrain" && (
                <div className="absolute inset-0">
                  {/* Contour lines */}
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute border-amber-600 border-2 rounded-full opacity-30"
                      style={{
                        left: `${10 + i * 20}%`,
                        top: `${15 + i * 15}%`,
                        width: `${100 + i * 50}px`,
                        height: `${100 + i * 50}px`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Current Position */}
            <div className="absolute left-1/2 bottom-20 transform -translate-x-1/2 z-20">
              <div className="relative">
                <div className="w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <ArrowUp className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-blue-600" />
              </div>
            </div>

            {/* Route Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-2 h-full bg-blue-500 opacity-80 z-10" />

            {/* Turn Indicator */}
            {nextStep && (
              <div className="absolute left-1/2 top-1/3 transform -translate-x-1/2 z-20">
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
              <div className="absolute left-1/2 top-20 transform -translate-x-1/2 z-20">
                <div className="bg-red-600 rounded-full p-3 shadow-lg">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Street Names */}
        <div className="absolute top-16 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm z-10">
          {currentStepData.streetName}
        </div>

        {nextStep && (
          <div className="absolute top-1/3 right-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm z-10">
            Next: {nextStep.streetName}
          </div>
        )}

        {/* Speed Limit */}
        {currentStepData.speedLimit && (
          <div className="absolute top-4 right-4 bg-white border-2 border-red-600 rounded-lg p-2 text-center z-10">
            <div className="text-lg font-bold text-red-600">{currentStepData.speedLimit}</div>
            <div className="text-xs text-gray-600">{settings.units === "metric" ? "KM/H" : "MPH"}</div>
          </div>
        )}

        {/* Distance to next turn */}
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg text-center z-10">
          <div className="text-2xl font-bold">{navigationService.formatDistance(currentStepData.distance)}</div>
          <div className="text-xs opacity-75">to next turn</div>
        </div>

        {/* View Mode Indicator */}
        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm z-10 flex items-center gap-2">
          {settings.viewMode === "3d" && <Mountain className="w-4 h-4" />}
          {settings.viewMode === "bird-eye" && <Eye className="w-4 h-4" />}
          {settings.mapStyle === "satellite" && <Satellite className="w-4 h-4" />}
          <span className="capitalize">{settings.viewMode}</span>
        </div>

        {/* Route Preference Indicator */}
        <div className="absolute bottom-16 right-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm z-10">
          Route: {settings.routePreference}
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
          console.log("No Mapbox token, using enhanced fallback visualization")
          setMapError(true)
          return
        }

        // Dynamic import of mapbox-gl
        const mapboxgl = await import("mapbox-gl")
        await import("mapbox-gl/dist/mapbox-gl.css")

        if (!mounted || !mapContainer.current) return

        mapboxgl.accessToken = mapboxToken

        // Get map style based on settings
        const getMapboxStyle = () => {
          switch (settings.mapStyle) {
            case "satellite":
              return "mapbox://styles/mapbox/satellite-v9"
            case "terrain":
              return "mapbox://styles/mapbox/outdoors-v12"
            case "hybrid":
              return "mapbox://styles/mapbox/satellite-streets-v12"
            case "street":
              return "mapbox://styles/mapbox/streets-v12"
            default:
              return isDayMode
                ? "mapbox://styles/mapbox/navigation-day-v1"
                : "mapbox://styles/mapbox/navigation-night-v1"
          }
        }

        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: getMapboxStyle(),
          center: userLocation ? [userLocation.longitude, userLocation.latitude] : [-122.4194, 37.7749],
          zoom: 16,
          pitch: settings.viewMode === "3d" ? 60 : settings.viewMode === "bird-eye" ? 30 : 0,
          bearing: userLocation?.heading || 0,
          attributionControl: false,
        })

        mapRef.current = map

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

  // Update map when settings change
  useEffect(() => {
    if (mapRef.current && mapLoaded) {
      const map = mapRef.current

      // Update map style
      const getMapboxStyle = () => {
        switch (settings.mapStyle) {
          case "satellite":
            return "mapbox://styles/mapbox/satellite-v9"
          case "terrain":
            return "mapbox://styles/mapbox/outdoors-v12"
          case "hybrid":
            return "mapbox://styles/mapbox/satellite-streets-v12"
          case "street":
            return "mapbox://styles/mapbox/streets-v12"
          default:
            return isDayMode ? "mapbox://styles/mapbox/navigation-day-v1" : "mapbox://styles/mapbox/navigation-night-v1"
        }
      }

      map.setStyle(getMapboxStyle())

      // Update pitch based on view mode
      const targetPitch = settings.viewMode === "3d" ? 60 : settings.viewMode === "bird-eye" ? 30 : 0
      map.easeTo({
        pitch: targetPitch,
        duration: 1000,
      })

      console.log(`🗺️ Updated map: style=${settings.mapStyle}, viewMode=${settings.viewMode}, pitch=${targetPitch}`)
    }
  }, [settings.mapStyle, settings.viewMode, isDayMode, mapLoaded])

  return (
    <div className="relative w-full h-full">
      {/* Mapbox container */}
      <div ref={mapContainer} className={cn("w-full h-full", mapError ? "hidden" : "block")} />

      {/* Enhanced fallback street visualization */}
      {(mapError || !mapLoaded) && <EnhancedStreetVisualization />}

      {/* Loading state */}
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div className="text-center">
            <Navigation className="w-12 h-12 mx-auto mb-2 opacity-50 animate-pulse" />
            <p className="text-sm opacity-75">Loading Navigation Map...</p>
          </div>
        </div>
      )}

      {/* Speed indicator */}
      {userLocation?.speed && userLocation.speed > 0 && (
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg z-30">
          <div className="text-2xl font-bold">{Math.round(userLocation.speed * 2.237)}</div>
          <div className="text-xs opacity-75">mph</div>
        </div>
      )}

      {/* Next turn preview */}
      {currentRoute && currentStep < currentRoute.steps.length - 1 && (
        <div className="absolute bottom-20 right-4 bg-black/80 text-white p-3 rounded-lg max-w-48 z-30">
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
