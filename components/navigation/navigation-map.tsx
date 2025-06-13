"use client"

import { useEffect, useRef, useState } from "react"
import { useNavigationStore } from "@/lib/navigation-store"
import { NavigationService } from "@/lib/navigation-service"
import { cn } from "@/lib/utils"
import { Navigation, ArrowUp, ArrowRight, ArrowLeft, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface NavigationMapProps {
  mapboxToken?: string
}

export function NavigationMap({ mapboxToken }: NavigationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)

  // Add state for better error handling
  const [initializationError, setInitializationError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  const { currentRoute, userLocation, destination, currentStep, settings } = useNavigationStore()
  const navigationService = NavigationService.getInstance()

  const isDayMode =
    settings.theme === "day" || (settings.theme === "auto" && new Date().getHours() >= 6 && new Date().getHours() < 20)

  // Add initialization effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false)
      if (!mapLoaded && !mapError && shouldUseMapbox()) {
        console.log("Map taking too long to load, showing fallback")
        setMapError(true)
      }
    }, 5000) // 5 second timeout

    return () => clearTimeout(timer)
  }, [mapLoaded, mapError])

  // Determine if we should use Mapbox based on map style
  const shouldUseMapbox = () => {
    return settings.mapStyle !== "navigation" && mapboxToken
  }

  const TomTomStyleNavigation = () => {
    // Ensure we have route data
    if (!currentRoute || !currentRoute.steps || currentRoute.steps.length === 0) {
      return (
        <div className={cn("h-full flex items-center justify-center", isDayMode ? "bg-gray-100" : "bg-gray-900")}>
          <div className="text-center p-6">
            <Navigation className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Route Data</h3>
            <p className="text-gray-500">Unable to display navigation view</p>
          </div>
        </div>
      )
    }

    // Ensure current step is valid
    const safeCurrentStep = Math.min(currentStep, currentRoute.steps.length - 1)
    const currentStepData = currentRoute.steps[safeCurrentStep]

    if (!currentStepData) {
      return (
        <div className={cn("h-full flex items-center justify-center", isDayMode ? "bg-gray-100" : "bg-gray-900")}>
          <div className="text-center p-6">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-lg font-semibold mb-2">Invalid Step Data</h3>
            <p className="text-gray-500">Navigation step information is missing</p>
          </div>
        </div>
      )
    }

    const nextStep = currentRoute.steps[safeCurrentStep + 1]
    const distanceToNextTurn = nextStep ? nextStep.distance : 0
    const distanceFormatted = navigationService.formatDistance(distanceToNextTurn)

    // Get maneuver type for next turn
    const getNextManeuverType = () => {
      if (!nextStep) return "straight"
      return nextStep.maneuver.type
    }

    const nextManeuver = getNextManeuverType()

    // Get large arrow for next turn
    const getLargeArrow = () => {
      switch (nextManeuver) {
        case "turn-left":
          return (
            <div className="transform -rotate-90">
              <div className="w-16 h-16 border-t-[16px] border-t-yellow-500 border-r-[16px] border-r-transparent border-l-[16px] border-l-transparent" />
            </div>
          )
        case "turn-right":
          return (
            <div className="transform rotate-90">
              <div className="w-16 h-16 border-t-[16px] border-t-yellow-500 border-r-[16px] border-r-transparent border-l-[16px] border-l-transparent" />
            </div>
          )
        case "roundabout":
          return (
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-yellow-500 rounded-full" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-t-[8px] border-t-yellow-500 border-r-[8px] border-r-transparent border-l-[8px] border-l-transparent transform rotate-45" />
            </div>
          )
        default:
          return (
            <div className="transform -rotate-180">
              <div className="w-16 h-16 border-t-[16px] border-t-yellow-500 border-r-[16px] border-r-transparent border-l-[16px] border-l-transparent" />
            </div>
          )
      }
    }

    // Lane guidance visualization
    const renderLaneGuidance = () => {
      if (!currentStepData.laneGuidance) return null

      return (
        <div className="absolute top-32 left-0 right-0 flex justify-center">
          <div className="bg-black/80 rounded-lg p-3">
            <div className="flex gap-1">
              {currentStepData.laneGuidance.lanes.map((lane, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-10 h-16 border-2 rounded flex flex-col items-center justify-end pb-1",
                    lane.valid ? "border-green-500 bg-green-900/30" : "border-gray-500 bg-gray-800/30",
                  )}
                >
                  {lane.indications.includes("straight") && (
                    <ArrowUp className={cn("w-6 h-6", lane.valid ? "text-green-500" : "text-gray-500")} />
                  )}
                  {lane.indications.includes("right") && (
                    <ArrowRight className={cn("w-6 h-6", lane.valid ? "text-green-500" : "text-gray-500")} />
                  )}
                  {lane.indications.includes("left") && (
                    <ArrowLeft className={cn("w-6 h-6", lane.valid ? "text-green-500" : "text-gray-500")} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    // Determine perspective based on view mode
    const getPerspectiveTransform = () => {
      switch (settings.viewMode) {
        case "3d":
          return "rotateX(60deg)"
        case "bird-eye":
          return "rotateX(30deg)"
        case "2d":
          return "rotateX(0deg)"
        default:
          return "rotateX(60deg)"
      }
    }

    return (
      <div className={cn("h-full relative overflow-hidden", isDayMode ? "bg-gray-100" : "bg-gray-900")}>
        {/* 3D Perspective Container */}
        <div className="h-full w-full perspective-1000">
          <div
            className="h-full w-full transition-transform duration-500"
            style={{ transform: getPerspectiveTransform() }}
          >
            {/* Sky */}
            <div
              className={cn(
                "absolute top-0 left-0 right-0 h-1/2",
                isDayMode ? "bg-gradient-to-b from-blue-300 to-blue-100" : "bg-gradient-to-b from-gray-900 to-gray-800",
              )}
            />

            {/* Horizon */}
            <div className={cn("absolute top-1/2 left-0 right-0 h-px", isDayMode ? "bg-gray-300" : "bg-gray-700")} />

            {/* Ground */}
            <div
              className={cn("absolute top-1/2 left-0 right-0 bottom-0", isDayMode ? "bg-gray-200" : "bg-gray-800")}
            />

            {/* Main road with perspective */}
            <div className="absolute top-1/2 left-0 right-0 bottom-0 flex justify-center perspective-1000">
              <div
                className={cn(
                  "relative w-full max-w-md h-full transform-gpu",
                  isDayMode ? "bg-gray-400" : "bg-gray-700",
                )}
                style={{
                  clipPath:
                    settings.viewMode === "2d"
                      ? "polygon(40% 0%, 60% 0%, 60% 100%, 40% 100%)"
                      : "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)",
                }}
              >
                {/* Road surface */}
                <div
                  className={cn("absolute inset-[2px] transform-gpu", isDayMode ? "bg-gray-300" : "bg-gray-600")}
                  style={{
                    clipPath:
                      settings.viewMode === "2d"
                        ? "polygon(40% 0%, 60% 0%, 60% 100%, 40% 100%)"
                        : "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)",
                  }}
                >
                  {/* Center line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-yellow-400 transform -translate-x-1/2">
                    <div className="h-full flex flex-col">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 border-b-4 border-transparent"
                          style={{
                            borderBottomColor: i % 2 === 0 ? "rgba(250, 204, 21, 0.8)" : "transparent",
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Side lines */}
                  <div className="absolute left-[15%] top-0 bottom-0 w-[3px] bg-white" />
                  <div className="absolute right-[15%] top-0 bottom-0 w-[3px] bg-white" />
                </div>
              </div>
            </div>

            {/* 3D Buildings - only show in 3D and bird-eye modes */}
            {settings.viewMode !== "2d" && (
              <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
                {/* Left side buildings */}
                {Array.from({ length: 6 }).map((_, i) => {
                  const height = 120 + Math.random() * 80
                  const width = 80 + Math.random() * 40
                  const distance = 10 + i * 15
                  const opacity = 1 - i * 0.15

                  return (
                    <div
                      key={`left-${i}`}
                      className={cn("absolute transform-gpu", isDayMode ? "bg-blue-100" : "bg-gray-700")}
                      style={{
                        height: `${height}px`,
                        width: `${width}px`,
                        bottom: `${50 + i * 2}%`,
                        left: `${distance}%`,
                        opacity,
                        transform: `translateZ(${i * 10}px)`,
                      }}
                    >
                      {/* Windows */}
                      <div className="absolute inset-1 grid grid-cols-3 grid-rows-5 gap-1">
                        {Array.from({ length: 15 }).map((_, j) => (
                          <div
                            key={j}
                            className={cn(
                              "rounded-sm",
                              isDayMode
                                ? j % 3 === 0
                                  ? "bg-blue-200"
                                  : "bg-blue-300"
                                : j % 3 === 0
                                  ? "bg-yellow-500/20"
                                  : "bg-gray-800",
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}

                {/* Right side buildings */}
                {Array.from({ length: 6 }).map((_, i) => {
                  const height = 120 + Math.random() * 80
                  const width = 80 + Math.random() * 40
                  const distance = 10 + i * 15
                  const opacity = 1 - i * 0.15

                  return (
                    <div
                      key={`right-${i}`}
                      className={cn("absolute transform-gpu", isDayMode ? "bg-blue-100" : "bg-gray-700")}
                      style={{
                        height: `${height}px`,
                        width: `${width}px`,
                        bottom: `${50 + i * 2}%`,
                        right: `${distance}%`,
                        opacity,
                        transform: `translateZ(${i * 10}px)`,
                      }}
                    >
                      {/* Windows */}
                      <div className="absolute inset-1 grid grid-cols-3 grid-rows-5 gap-1">
                        {Array.from({ length: 15 }).map((_, j) => (
                          <div
                            key={j}
                            className={cn(
                              "rounded-sm",
                              isDayMode
                                ? j % 3 === 0
                                  ? "bg-blue-200"
                                  : "bg-blue-300"
                                : j % 3 === 0
                                  ? "bg-yellow-500/20"
                                  : "bg-gray-800",
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Intersections */}
            {nextManeuver !== "straight" && (
              <div className={cn("absolute top-[30%] left-0 right-0 h-24", isDayMode ? "bg-gray-300" : "bg-gray-600")}>
                {/* Intersection markings */}
                <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-white transform -translate-y-1/2" />
                <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-yellow-400 transform -translate-x-1/2" />
              </div>
            )}

            {/* Current Position */}
            <div className="absolute left-1/2 bottom-[15%] transform -translate-x-1/2 z-20">
              <div className="relative">
                <div className="w-12 h-12 bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <ArrowUp className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-blue-600" />
              </div>
            </div>

            {/* Route Line */}
            <div
              className="absolute left-1/2 top-[30%] bottom-[15%] w-4 bg-blue-500 opacity-80 z-10 transform -translate-x-1/2"
              style={{
                clipPath:
                  nextManeuver === "turn-left"
                    ? "polygon(0% 70%, 100% 70%, 100% 100%, 0% 100%)"
                    : nextManeuver === "turn-right"
                      ? "polygon(0% 70%, 100% 70%, 100% 100%, 0% 100%)"
                      : "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              }}
            />

            {/* Turn visualization */}
            {nextManeuver === "turn-left" && (
              <div className="absolute top-[30%] left-0 w-1/2 h-4 bg-blue-500 opacity-80 z-10" />
            )}
            {nextManeuver === "turn-right" && (
              <div className="absolute top-[30%] right-0 w-1/2 h-4 bg-blue-500 opacity-80 z-10" />
            )}
          </div>
        </div>

        {/* TomTom-style UI Overlays */}
        {/* Large Next Turn Arrow */}
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 z-30">{getLargeArrow()}</div>

        {/* Distance to next turn - large counter */}
        {nextStep && (
          <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 z-30 text-center">
            <div className="bg-black/70 text-white px-6 py-3 rounded-lg">
              <div className="text-3xl font-bold">{distanceFormatted}</div>
              <div className="text-sm opacity-80">to next turn</div>
            </div>
          </div>
        )}

        {/* Lane guidance */}
        {renderLaneGuidance()}

        {/* Street Names */}
        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm z-30">
          {currentStepData.streetName}
        </div>

        {nextStep && (
          <div className="absolute top-16 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm z-30">
            Next: {nextStep.streetName}
          </div>
        )}

        {/* Speed Limit */}
        {currentStepData.speedLimit && (
          <div className="absolute top-4 right-4 bg-white border-2 border-red-600 rounded-full p-2 text-center z-30 w-16 h-16 flex flex-col items-center justify-center">
            <div className="text-xl font-bold text-black">{currentStepData.speedLimit}</div>
            <div className="text-xs text-gray-600">{settings.units === "metric" ? "km/h" : "mph"}</div>
          </div>
        )}

        {/* Traffic incidents */}
        <div className="absolute bottom-32 right-4 z-30">
          <Badge variant="destructive" className="flex items-center gap-1 px-3 py-1">
            <AlertTriangle className="w-4 h-4" />
            <span>Traffic ahead</span>
          </Badge>
        </div>

        {/* Current speed */}
        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg z-30">
          <div className="text-2xl font-bold">35</div>
          <div className="text-xs opacity-75">{settings.units === "metric" ? "km/h" : "mph"}</div>
        </div>

        {/* ETA */}
        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg z-30">
          <div className="text-lg font-bold">12:45</div>
          <div className="text-xs opacity-75">ETA</div>
        </div>
      </div>
    )
  }

  // Mapbox loading - for satellite, terrain, street, hybrid views
  useEffect(() => {
    if (!shouldUseMapbox()) {
      // Clean up existing map if switching away from Mapbox
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        setMapLoaded(false)
      }
      return
    }

    let mounted = true

    const loadMapbox = async () => {
      try {
        const mapboxgl = (await import("mapbox-gl")).default

        if (!mounted || !mapContainer.current) return

        // Clean up existing map
        if (mapRef.current) {
          mapRef.current.remove()
        }

        mapboxgl.accessToken = mapboxToken!

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
            setMapError(false)
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
  }, [mapboxToken, settings.mapStyle, isDayMode, userLocation])

  // Update map when settings change
  useEffect(() => {
    if (mapRef.current && mapLoaded && shouldUseMapbox()) {
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
      {/* Show TomTom-style navigation for "navigation" style or as fallback */}
      {(!shouldUseMapbox() || mapError || !mapLoaded) && <TomTomStyleNavigation />}

      {/* Show Mapbox for other map styles */}
      {shouldUseMapbox() && !mapError && <div ref={mapContainer} className="w-full h-full" />}

      {/* Loading overlay for Mapbox */}
      {shouldUseMapbox() && !mapLoaded && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-50">
          <div className="text-center text-white">
            <Navigation className="w-12 h-12 mx-auto mb-2 animate-pulse" />
            <p className="text-sm">Loading {settings.mapStyle} view...</p>
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
