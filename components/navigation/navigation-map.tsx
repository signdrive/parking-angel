"use client"

import { useEffect, useRef, useState } from "react"
import { useNavigationStore } from "@/lib/navigation-store"
import { NavigationService } from "@/lib/navigation-service"
import { cn } from "@/lib/utils"
import { Navigation, ArrowUp, ArrowRight, ArrowLeft, RotateCcw, AlertTriangle, MapPin } from "lucide-react"

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

  // Real navigation map with Mapbox
  useEffect(() => {
    let mounted = true

    const loadMapbox = async () => {
      try {
        if (!mapboxToken) {
          console.log("No Mapbox token available, using fallback")
          setMapError(true)
          return
        }

        console.log("Loading Mapbox for navigation...")

        // Dynamic import of mapbox-gl
        const mapboxgl = await import("mapbox-gl")
        await import("mapbox-gl/dist/mapbox-gl.css")

        if (!mounted || !mapContainer.current) return

        mapboxgl.accessToken = mapboxToken

        // Get appropriate map style
        const getMapStyle = () => {
          switch (settings.mapStyle) {
            case "satellite":
              return "mapbox://styles/mapbox/satellite-streets-v12"
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
          style: getMapStyle(),
          center: userLocation ? [userLocation.longitude, userLocation.latitude] : [-122.4194, 37.7749],
          zoom: 17,
          pitch: settings.viewMode === "3d" ? 60 : settings.viewMode === "bird-eye" ? 45 : 0,
          bearing: userLocation?.heading || 0,
          attributionControl: false,
        })

        mapRef.current = map

        map.on("load", () => {
          if (!mounted) return

          console.log("✅ Navigation Mapbox loaded successfully")
          setMapLoaded(true)
          setMapError(false) // Ensure error state is cleared

          // Add navigation route
          if (currentRoute) {
            // Add route line
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
                "line-color": "#3b82f6",
                "line-width": 8,
                "line-opacity": 0.8,
              },
            })

            // Add route outline
            map.addLayer({
              id: "route-outline",
              type: "line",
              source: "route",
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                "line-color": "#1e40af",
                "line-width": 12,
                "line-opacity": 0.4,
              },
            })

            // Add destination marker
            if (destination) {
              new mapboxgl.Marker({
                color: "#ef4444",
                scale: 1.2,
              })
                .setLngLat([destination.longitude, destination.latitude])
                .addTo(map)
            }
          }

          // Add user location marker
          if (userLocation) {
            const userMarker = new mapboxgl.Marker({
              color: "#3b82f6",
              scale: 1.5,
            })
              .setLngLat([userLocation.longitude, userLocation.latitude])
              .addTo(map)

            // Add direction indicator
            const directionEl = document.createElement("div")
            directionEl.className = "w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-lg"
            directionEl.innerHTML = `<div class="w-full h-full flex items-center justify-center"><svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2L15 8H5L10 2Z"/></svg></div>`
            directionEl.style.transform = `rotate(${userLocation.heading || 0}deg)`

            new mapboxgl.Marker({ element: directionEl })
              .setLngLat([userLocation.longitude, userLocation.latitude])
              .addTo(map)
          }
        })

        map.on("error", (e) => {
          console.error("❌ Navigation Mapbox error:", e)
          if (mounted) {
            setMapError(true)
          }
        })

        return () => {
          if (map) map.remove()
        }
      } catch (error) {
        console.error("❌ Failed to load Navigation Mapbox:", error)
        if (mounted) {
          setMapError(true)
        }
      }
    }

    loadMapbox()

    return () => {
      mounted = false
    }
  }, [mapboxToken, isDayMode, userLocation, destination, currentRoute])

  // Update map when settings change
  useEffect(() => {
    if (mapRef.current && mapLoaded) {
      const map = mapRef.current

      // Update map style
      const getMapStyle = () => {
        switch (settings.mapStyle) {
          case "satellite":
            return "mapbox://styles/mapbox/satellite-streets-v12"
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

      map.setStyle(getMapStyle())

      // Update pitch and bearing based on view mode
      const targetPitch = settings.viewMode === "3d" ? 60 : settings.viewMode === "bird-eye" ? 45 : 0
      const targetBearing = settings.viewMode === "follow" ? userLocation?.heading || 0 : 0

      map.easeTo({
        pitch: targetPitch,
        bearing: targetBearing,
        duration: 1000,
      })

      console.log(`🗺️ Updated navigation map: style=${settings.mapStyle}, viewMode=${settings.viewMode}`)
    }
  }, [settings.mapStyle, settings.viewMode, isDayMode, mapLoaded, userLocation])

  // Fallback when Mapbox is not available
  const GoogleMapsStyleFallback = () => {
    if (!currentRoute || !currentRoute.steps[currentStep]) return null

    const currentStepData = currentRoute.steps[currentStep]
    const nextStep = currentRoute.steps[currentStep + 1]

    return (
      <div className="h-full relative bg-gray-100">
        {/* Map background */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-100 to-green-200">
          {/* Streets grid */}
          <div className="absolute inset-0">
            {/* Horizontal streets */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`h-${i}`}
                className="absolute left-0 right-0 h-2 bg-white border-t border-b border-gray-300"
                style={{ top: `${i * 12.5}%` }}
              />
            ))}
            {/* Vertical streets */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`v-${i}`}
                className="absolute top-0 bottom-0 w-2 bg-white border-l border-r border-gray-300"
                style={{ left: `${i * 16.66}%` }}
              />
            ))}
          </div>

          {/* Buildings */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-gray-300 border border-gray-400"
              style={{
                width: `${30 + Math.random() * 40}px`,
                height: `${20 + Math.random() * 30}px`,
                left: `${Math.random() * 90}%`,
                top: `${Math.random() * 90}%`,
              }}
            />
          ))}

          {/* Main route */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-blue-500 transform -translate-x-1/2" />
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-blue-500 transform -translate-y-1/2" />

          {/* Current position */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg" />
          </div>

          {/* Destination */}
          {destination && (
            <div className="absolute right-4 top-4">
              <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Street names overlay */}
        <div className="absolute top-4 left-4 bg-white/90 px-2 py-1 rounded text-sm font-medium">
          {currentStepData.streetName}
        </div>

        {currentRoute.steps[currentStep + 1] && (
          <div className="absolute top-16 left-4 bg-white/90 px-2 py-1 rounded text-sm">
            Next: {currentRoute.steps[currentStep + 1].streetName}
          </div>
        )}

        {/* Navigation instruction */}
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              {currentRoute.steps[currentStep + 1].maneuver.type === "turn-left" && "↰"}
              {currentRoute.steps[currentStep + 1].maneuver.type === "turn-right" && "↱"}
              {currentRoute.steps[currentStep + 1].maneuver.type === "straight" && "↑"}
              {currentRoute.steps[currentStep + 1].maneuver.type === "roundabout" && "↻"}
              {!currentRoute.steps[currentStep + 1] && "🏁"}
            </div>
            <div className="flex-1">
              <div className="font-medium text-lg">{currentRoute.steps[currentStep + 1].instruction}</div>
              <div className="text-gray-600">
                {currentRoute.steps[currentStep + 1]
                  ? `in ${navigationService.formatDistance(currentRoute.steps[currentStep + 1].distance)}`
                  : "You have arrived"}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {navigationService.formatDistance(currentRoute.steps[currentStep + 1].distance)}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {/* Mapbox container - show when loaded and no error */}
      <div ref={mapContainer} className={cn("w-full h-full", mapError || !mapLoaded ? "hidden" : "block")} />

      {/* Fallback when Mapbox fails or is loading */}
      {(mapError || !mapLoaded) && <GoogleMapsStyleFallback />}

      {/* Loading state - only show when not loaded and no error */}
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <div className="text-center">
            <Navigation className="w-12 h-12 mx-auto mb-2 text-blue-600 animate-pulse" />
            <p className="text-sm text-gray-600">Loading Navigation Map...</p>
          </div>
        </div>
      )}

      {/* Navigation overlays - show regardless of map type */}
      {currentRoute && (
        <>
          {/* Next turn instruction overlay */}
          {currentRoute.steps[currentStep + 1] && (
            <div className="absolute top-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl">
                  {currentRoute.steps[currentStep + 1].maneuver.type === "turn-left" && <ArrowLeft />}
                  {currentRoute.steps[currentStep + 1].maneuver.type === "turn-right" && <ArrowRight />}
                  {currentRoute.steps[currentStep + 1].maneuver.type === "straight" && <ArrowUp />}
                  {currentRoute.steps[currentStep + 1].maneuver.type === "roundabout" && <RotateCcw />}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-lg">{currentRoute.steps[currentStep + 1].instruction}</div>
                  <div className="text-gray-600">
                    in {navigationService.formatDistance(currentRoute.steps[currentStep + 1].distance)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {navigationService.formatDistance(currentRoute.steps[currentStep + 1].distance)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Speed limit */}
          {currentRoute.steps[currentStep].speedLimit && (
            <div className="absolute top-4 right-4 bg-white border-2 border-red-600 rounded-full w-16 h-16 flex flex-col items-center justify-center z-10">
              <div className="text-lg font-bold text-black">{currentRoute.steps[currentStep].speedLimit}</div>
              <div className="text-xs text-gray-600">{settings.units === "metric" ? "km/h" : "mph"}</div>
            </div>
          )}

          {/* Lane guidance */}
          {settings.showLaneGuidance && currentRoute.steps[currentStep].laneGuidance && (
            <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 bg-black/80 rounded-lg p-3 z-10">
              <div className="flex gap-1">
                {currentRoute.steps[currentStep].laneGuidance!.lanes.map((lane, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "w-8 h-12 border-2 rounded flex items-end justify-center pb-1",
                      lane.valid ? "border-green-500 bg-green-900/30" : "border-gray-500 bg-gray-800/30",
                    )}
                  >
                    {lane.indications.includes("straight") && (
                      <ArrowUp className={cn("w-5 h-5", lane.valid ? "text-green-500" : "text-gray-500")} />
                    )}
                    {lane.indications.includes("right") && (
                      <ArrowRight className={cn("w-5 h-5", lane.valid ? "text-green-500" : "text-gray-500")} />
                    )}
                    {lane.indications.includes("left") && (
                      <ArrowLeft className={cn("w-5 h-5", lane.valid ? "text-green-500" : "text-gray-500")} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Traffic alerts */}
          {settings.showIncidents && (
            <div className="absolute bottom-20 right-4 bg-red-600 text-white px-3 py-2 rounded-lg z-10 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">Traffic ahead</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
