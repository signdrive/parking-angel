"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, NavigationIcon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useNavigationStore } from "@/lib/navigation-store"
import { NavigationService } from "@/lib/navigation-service"
import { cn } from "@/lib/utils"
import { ArrowUp, ArrowRight, ArrowLeft, RotateCcw } from "lucide-react"
import { setMapboxToken } from "@/lib/mapbox-token" // Declare the variable before using it

interface NavigationMapProps {
  origin: [number, number]
  destination: [number, number]
  route?: any
  onArrival?: () => void
  mapboxToken?: string
}

export function NavigationMap({ origin, destination, route, onArrival, mapboxToken }: NavigationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [mapboxError, setMapboxError] = useState<string | null>(null)
  const [mapInitialized, setMapInitialized] = useState(false)
  const [mapboxLoaded, setMapboxLoaded] = useState(false)
  const [estimatedTime, setEstimatedTime] = useState<string | null>(null)
  const [distance, setDistance] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<any | null>(null)
  const [nextStep, setNextStep] = useState<any | null>(null)
  const [progress, setProgress] = useState(0)

  const { userLocation, settings } = useNavigationStore()
  const navigationService = NavigationService.getInstance()

  // Fetch Mapbox token securely from server
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const response = await fetch("/api/mapbox/token")
        if (response.ok) {
          const data = await response.json()
          setMapboxToken(data.token)
        } else {
          setMapboxError("Failed to load map configuration")
        }
      } catch (error) {
        console.error("Error fetching map config:", error)
        setMapboxError("Failed to connect to map service")
      }
    }

    if (!mapboxToken) {
      fetchMapboxToken()
    }
  }, [mapboxToken])

  // Load Mapbox dynamically
  useEffect(() => {
    if (!mapboxToken || mapboxLoaded) return

    const loadMapbox = async () => {
      try {
        // Dynamically import mapbox-gl
        const mapboxModule = await import("mapbox-gl")
        const mapboxgl = mapboxModule.default

        // Import CSS
        await import("mapbox-gl/dist/mapbox-gl.css")

        // Set the token
        mapboxgl.accessToken = mapboxToken

        setMapboxLoaded(true)

        // Initialize map after mapbox is loaded
        if (mapContainer.current && !map.current) {
          map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style:
              settings.viewMode === "3d"
                ? "mapbox://styles/mapbox/navigation-day-v1"
                : "mapbox://styles/mapbox/navigation-night-v1",
            center: origin,
            zoom: 14,
            pitch: settings.viewMode === "3d" ? 45 : 0,
          })

          map.current.addControl(
            new mapboxgl.GeolocateControl({
              positionOptions: { enableHighAccuracy: true },
              trackUserLocation: true,
              showUserHeading: true,
            }),
          )

          // Wait for map to load before adding route
          map.current.on("load", () => {
            console.log("Navigation map loaded successfully")
            setMapInitialized(true)
          })

          map.current.on("error", (e: any) => {
            console.error("Mapbox navigation error:", e)
            setMapboxError("Failed to load navigation map. Please check your internet connection.")
          })
        }
      } catch (error) {
        console.error("Failed to initialize Mapbox for navigation:", error)
        setMapboxError("Failed to initialize navigation map.")
      }
    }

    loadMapbox()

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [mapboxToken, origin, mapboxLoaded, settings.viewMode])

  // Add route to map when it's available
  useEffect(() => {
    if (!map.current || !mapInitialized || !route || !route.geometry) return

    const addRouteToMap = async () => {
      try {
        // Import mapbox-gl dynamically to avoid the accessToken setter issue
        const { default: mapboxgl } = await import("mapbox-gl")

        // Add the route source and layer
        if (!map.current.getSource("route")) {
          map.current.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: route.geometry,
            },
          })

          map.current.addLayer({
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

          // Fit the map to the route
          const bounds = new mapboxgl.LngLatBounds()
          route.geometry.coordinates.forEach((coord: [number, number]) => {
            bounds.extend(coord)
          })
          map.current.fitBounds(bounds, { padding: 50 })

          // Add origin marker
          new mapboxgl.Marker({ color: "#3b82f6" })
            .setLngLat(origin)
            .setPopup(new mapboxgl.Popup().setHTML("<p>Starting Point</p>"))
            .addTo(map.current)

          // Add destination marker
          new mapboxgl.Marker({ color: "#ef4444" })
            .setLngLat(destination)
            .setPopup(new mapboxgl.Popup().setHTML("<p>Destination</p>"))
            .addTo(map.current)

          // Set route information
          if (route.duration) {
            setEstimatedTime(formatDuration(route.duration))
          }
          if (route.distance) {
            setDistance(formatDistance(route.distance))
          }

          // Set navigation steps if available
          if (route.steps && route.steps.length > 0) {
            setCurrentStep(route.steps[0])
            setNextStep(route.steps.length > 1 ? route.steps[1] : null)
          }
        }
      } catch (error) {
        console.error("Error adding route to map:", error)
        toast({
          title: "Navigation Error",
          description: "Could not display the route on the map.",
          variant: "destructive",
        })
      }
    }

    addRouteToMap()
  }, [map, mapInitialized, route, origin, destination])

  // Simulate progress along the route
  useEffect(() => {
    if (!route || !mapInitialized) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 0.5
        if (newProgress >= 100) {
          clearInterval(interval)
          if (onArrival) onArrival()
          return 100
        }
        return newProgress
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [route, mapInitialized, onArrival])

  // Format duration in seconds to a readable string
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours} hr ${minutes} min`
    } else {
      return `${minutes} min`
    }
  }

  // Format distance in meters to a readable string
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`
    } else {
      return `${(meters / 1000).toFixed(1)} km`
    }
  }

  // Fallback street visualization when Mapbox fails
  const StreetVisualization = () => {
    if (!route || !route.steps[0]) return null

    const currentStepData = route.steps[0]
    const nextStep = route.steps.length > 1 ? route.steps[1] : null

    return (
      <div className={cn("h-full relative overflow-hidden", settings.isDayMode ? "bg-gray-100" : "bg-gray-800")}>
        {/* Street Background */}
        <div className="absolute inset-0">
          {/* Main road */}
          <div
            className={cn(
              "absolute left-1/2 transform -translate-x-1/2 w-32 h-full",
              settings.isDayMode ? "bg-gray-300" : "bg-gray-600",
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
          <div
            className={cn("absolute top-1/3 left-0 right-0 h-20", settings.isDayMode ? "bg-gray-300" : "bg-gray-600")}
          />
          <div
            className={cn("absolute top-2/3 left-0 right-0 h-20", settings.isDayMode ? "bg-gray-300" : "bg-gray-600")}
          />

          {/* Buildings */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute w-16 h-24 rounded-sm",
                settings.isDayMode ? "bg-gray-400" : "bg-gray-700",
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
        {route.steps.length === 1 && (
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

  if (mapboxError) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-6 max-w-md">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Navigation Unavailable</h3>
          <p className="text-gray-600 mb-4">{mapboxError}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (!mapboxToken || !mapboxLoaded) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-6">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Navigation...</h3>
          <p className="text-gray-600">Initializing navigation service</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full">
      <div ref={mapContainer} className="h-full w-full" />

      {/* Navigation Info Overlay */}
      <div className="absolute top-4 left-0 right-0 mx-auto w-full max-w-md px-4">
        <Card className="p-4 bg-white/90 backdrop-blur-sm shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <NavigationIcon className="w-5 h-5 text-blue-500" />
              <span className="font-semibold">Navigation Active</span>
            </div>
            <div className="text-sm text-gray-600">{progress.toFixed(0)}% complete</div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="bg-gray-100 p-2 rounded">
              <div className="text-xs text-gray-500">Estimated Time</div>
              <div className="font-medium">{estimatedTime || "Calculating..."}</div>
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <div className="text-xs text-gray-500">Distance</div>
              <div className="font-medium">{distance || "Calculating..."}</div>
            </div>
          </div>

          {currentStep && (
            <div className="bg-blue-50 p-3 rounded border border-blue-100 mb-2">
              <div className="text-xs text-blue-700 mb-1">Current Instruction</div>
              <div className="font-medium text-blue-900">{currentStep.maneuver.instruction}</div>
              {currentStep.distance && (
                <div className="text-xs text-blue-700 mt-1">{formatDistance(currentStep.distance)}</div>
              )}
            </div>
          )}

          {nextStep && (
            <div className="bg-gray-50 p-2 rounded border border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Next</div>
              <div className="text-sm">{nextStep.maneuver.instruction}</div>
            </div>
          )}
        </Card>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
        <div
          className="h-full bg-blue-500 transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Fallback street visualization */}
      {!mapInitialized && <StreetVisualization />}
    </div>
  )
}
