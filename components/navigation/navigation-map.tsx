"use client"

import { useEffect, useRef, useState } from "react"
import { useNavigationStore } from "@/lib/navigation-store"
import { NavigationService } from "@/lib/navigation-service"
import { cn } from "@/lib/utils"
import { Navigation, Plus, Minus, MoreVertical, ParkingSquare, User, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NavigationMapProps {
  mapboxToken?: string | null
}

export function NavigationMap({ mapboxToken }: NavigationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState("Initializing...")

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
          console.log("⏳ Waiting for Mapbox token...")
          setLoadingProgress("Waiting for map token...")
          return
        }

        console.log("🗺️ Loading Mapbox for navigation with token...")
        setLoadingProgress("Loading map service...")

        // Dynamic import of mapbox-gl
        const mapboxgl = await import("mapbox-gl")
        await import("mapbox-gl/dist/mapbox-gl.css")

        if (!mounted || !mapContainer.current) return

        console.log("🔑 Setting Mapbox access token...")
        mapboxgl.accessToken = mapboxToken
        setLoadingProgress("Configuring navigation map...")

        // Get appropriate map style for navigation
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

        console.log("🎨 Creating navigation map with style:", getMapStyle())
        setLoadingProgress("Creating navigation view...")

        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: getMapStyle(),
          center: userLocation ? [userLocation.longitude, userLocation.latitude] : [-122.4194, 37.7749],
          zoom: 17,
          pitch: 60, // Always use 60 degree pitch for 3D view like TomTom
          bearing: userLocation?.heading || 0,
          attributionControl: false,
        })

        mapRef.current = map
        setLoadingProgress("Loading map tiles...")

        map.on("load", () => {
          if (!mounted) return

          console.log("✅ Navigation Mapbox loaded successfully!")
          setMapLoaded(true)
          setMapError(false)
          setLoadingProgress("Map ready!")

          // Add navigation route
          if (currentRoute) {
            console.log("🛣️ Adding navigation route to map...")

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

            // Add blue route line (TomTom style)
            map.addLayer({
              id: "route",
              type: "line",
              source: "route",
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                "line-color": "#00b3fd", // TomTom blue
                "line-width": 8,
                "line-opacity": 0.9,
              },
            })

            // Add route glow (TomTom style)
            map.addLayer({
              id: "route-glow",
              type: "line",
              source: "route",
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                "line-color": "#00b3fd",
                "line-width": 14,
                "line-opacity": 0.3,
              },
            })

            // Add destination marker
            if (destination) {
              console.log("📍 Adding destination marker...")
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
            console.log("👤 Adding user location marker...")
            const userMarker = new mapboxgl.Marker({
              color: "#00b3fd", // TomTom blue
              scale: 1.5,
            })
              .setLngLat([userLocation.longitude, userLocation.latitude])
              .addTo(map)

            // Add direction indicator
            const directionEl = document.createElement("div")
            directionEl.className = "w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg"
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
            setLoadingProgress("Map loading failed")
          }
        })

        map.on("styledata", () => {
          setLoadingProgress("Loading map style...")
        })

        map.on("sourcedata", () => {
          setLoadingProgress("Loading map data...")
        })

        return () => {
          if (map) {
            console.log("🧹 Cleaning up navigation map...")
            map.remove()
          }
        }
      } catch (error) {
        console.error("❌ Failed to load Navigation Mapbox:", error)
        if (mounted) {
          setMapError(true)
          setLoadingProgress("Failed to initialize map")
        }
      }
    }

    loadMapbox()

    return () => {
      mounted = false
    }
  }, [mapboxToken, isDayMode, userLocation, destination, currentRoute])

  // TomTom-style 3D navigation overlay
  const TomTomStyleOverlay = () => {
    if (!currentRoute || !currentRoute.steps[currentStep]) return null

    const currentStepData = currentRoute.steps[currentStep]
    const nextStep = currentRoute.steps[currentStep + 1]

    // Calculate ETA
    const eta = new Date()
    if (currentRoute.duration) {
      eta.setSeconds(eta.getSeconds() + currentRoute.duration)
    }

    // Get current speed (simulated)
    const currentSpeed = userLocation?.speed ? Math.round(userLocation.speed * 2.237) : 63 // mph

    // Get next maneuver distance
    const nextManeuverDistance = nextStep ? nextStep.distance : 0
    const formattedDistance =
      nextManeuverDistance < 1000
        ? `${Math.round(nextManeuverDistance)} ft`
        : `${(nextManeuverDistance / 1609).toFixed(1)} mi`

    // Get remaining distance
    const remainingDistance = (currentRoute.distance / 1609).toFixed(1) // miles

    // Get remaining time
    const remainingMinutes = Math.ceil(currentRoute.duration / 60)

    return (
      <>
        {/* Top navigation bar with next maneuver */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-2 py-1 bg-gray-800/90 text-white z-20">
          <div className="flex items-center gap-2 bg-gray-800 rounded-full px-3 py-1">
            <span className="font-bold">{formattedDistance}</span>
            <div className="flex">
              {nextStep?.maneuver.type === "straight" && (
                <>
                  <div className="w-6 h-6 flex items-center justify-center">
                    <div className="w-3 h-4 bg-gray-300 flex items-center justify-center">↑</div>
                  </div>
                  <div className="w-6 h-6 flex items-center justify-center">
                    <div className="w-3 h-4 bg-gray-300 flex items-center justify-center">↑</div>
                  </div>
                </>
              )}
              {nextStep?.maneuver.type === "turn-right" && (
                <>
                  <div className="w-6 h-6 flex items-center justify-center">
                    <div className="w-3 h-4 bg-gray-300 flex items-center justify-center">↑</div>
                  </div>
                  <div className="w-6 h-6 flex items-center justify-center">
                    <div className="w-3 h-4 bg-cyan-400 flex items-center justify-center">→</div>
                  </div>
                  <div className="w-6 h-6 flex items-center justify-center">
                    <div className="w-3 h-4 bg-cyan-400 flex items-center justify-center">→</div>
                  </div>
                </>
              )}
              {nextStep?.maneuver.type === "turn-left" && (
                <>
                  <div className="w-6 h-6 flex items-center justify-center">
                    <div className="w-3 h-4 bg-cyan-400 flex items-center justify-center">←</div>
                  </div>
                  <div className="w-6 h-6 flex items-center justify-center">
                    <div className="w-3 h-4 bg-cyan-400 flex items-center justify-center">←</div>
                  </div>
                  <div className="w-6 h-6 flex items-center justify-center">
                    <div className="w-3 h-4 bg-gray-300 flex items-center justify-center">↑</div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-bold">
              {eta.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="text-xs">{remainingMinutes} min</div>
          </div>
        </div>

        {/* Left side controls */}
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800/80 rounded-full flex flex-col z-20">
          <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700 rounded-full">
            <ChevronUp className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700 rounded-full">
            <Plus className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700 rounded-full">
            <Minus className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700 rounded-full">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>

        {/* Right side controls */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-20">
          <Button variant="ghost" size="icon" className="bg-white/90 hover:bg-white rounded-full">
            <ParkingSquare className="h-5 w-5 text-blue-600" />
          </Button>
          <Button variant="ghost" size="icon" className="bg-white/90 hover:bg-white rounded-full">
            <User className="h-5 w-5 text-gray-700" />
          </Button>
        </div>

        {/* Speed and distance indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-20">
          {/* Speed limit */}
          <div className="bg-white rounded-full border-4 border-red-600 w-14 h-14 flex items-center justify-center">
            <div className="text-center">
              <div className="font-bold text-lg">{currentStepData.speedLimit || 65}</div>
              <div className="text-xs -mt-1">mph</div>
            </div>
          </div>

          {/* Current speed */}
          <div className="text-center">
            <div className="font-bold text-3xl text-white">{currentSpeed}</div>
            <div className="text-sm text-white">mph</div>
          </div>
        </div>

        {/* Distance remaining */}
        <div className="absolute bottom-4 right-4 bg-white/80 px-2 py-1 rounded text-sm font-bold z-20">
          {remainingDistance} mi
        </div>

        {/* Lane guidance overlay - only show when needed */}
        {nextManeuverDistance < 500 && nextStep?.maneuver.type !== "straight" && (
          <div className="absolute bottom-24 left-0 right-0 flex justify-center z-20">
            <div className="bg-black/70 rounded-lg p-3">
              <div className="flex gap-1">
                {/* Simulate lane guidance with blue arrows for recommended lanes */}
                <div className="w-12 h-20 flex flex-col items-center">
                  <div className="flex-1 w-2 bg-gray-500"></div>
                  <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-cyan-400"></div>
                </div>
                <div className="w-12 h-20 flex flex-col items-center">
                  <div className="flex-1 w-2 bg-gray-500"></div>
                  <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-cyan-400"></div>
                </div>
                <div className="w-12 h-20 flex flex-col items-center">
                  <div className="flex-1 w-2 bg-gray-500"></div>
                  <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-gray-500"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  // TomTom-style fallback when Mapbox is not available
  const TomTomStyleFallback = () => {
    if (!currentRoute || !currentRoute.steps[currentStep]) return null

    return (
      <div className="h-full relative bg-gray-100">
        {/* Sky */}
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-blue-300 to-blue-200">
          <div className="absolute left-10 top-10 w-12 h-6 bg-white rounded-full opacity-70"></div>
          <div className="absolute left-40 top-20 w-16 h-8 bg-white rounded-full opacity-60"></div>
        </div>

        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-b from-green-200 to-green-300"></div>

        {/* Road */}
        <div className="absolute bottom-0 left-0 right-0 h-full flex items-center justify-center perspective">
          <div className="w-full h-3/4 bg-gray-800 transform rotate-x-60 origin-bottom relative">
            {/* Lane markings */}
            <div className="absolute top-0 bottom-0 left-1/4 w-0.5 bg-white dashed-line"></div>
            <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-white"></div>
            <div className="absolute top-0 bottom-0 left-3/4 w-0.5 bg-white dashed-line"></div>

            {/* Route guidance */}
            <div className="absolute top-1/4 bottom-0 left-5/8 w-1/8 bg-cyan-400 opacity-70"></div>

            {/* Direction arrows */}
            <div className="absolute bottom-1/4 left-5/8 w-1/8 flex justify-center">
              <div className="w-0 h-0 border-l-8 border-r-8 border-b-16 border-l-transparent border-r-transparent border-b-cyan-400"></div>
            </div>
            <div className="absolute bottom-2/5 left-5/8 w-1/8 flex justify-center">
              <div className="w-0 h-0 border-l-8 border-r-8 border-b-16 border-l-transparent border-r-transparent border-b-cyan-400"></div>
            </div>
          </div>
        </div>

        {/* TomTom UI overlays */}
        <TomTomStyleOverlay />
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      {/* Mapbox container - show when loaded and no error */}
      <div ref={mapContainer} className={cn("w-full h-full", mapError || !mapLoaded ? "hidden" : "block")} />

      {/* Loading state - only show when not loaded and no error */}
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center text-white">
            <Navigation className="w-12 h-12 mx-auto mb-4 text-blue-400 animate-pulse" />
            <h3 className="text-lg font-semibold mb-2">Loading Navigation</h3>
            <p className="text-gray-300 mb-4">{loadingProgress}</p>
            <div className="w-48 bg-gray-700 rounded-full h-2 mx-auto">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: "60%" }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Fallback when Mapbox fails - ONLY show on actual error */}
      {mapError && <TomTomStyleFallback />}

      {/* TomTom style UI overlays - show on top of Mapbox when loaded */}
      {mapLoaded && !mapError && <TomTomStyleOverlay />}
    </div>
  )
}
