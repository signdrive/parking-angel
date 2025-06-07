"use client"

import { useEffect, useState, useRef } from "react"
import mapboxgl, { type LngLatLike } from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { Button } from "@/components/ui/button"
import { Phone, ArrowLeft, Navigation, AlertTriangle, Clock, Loader2 } from "lucide-react"
import type { NavigationRoute } from "@/lib/navigation-store" // Assuming types are here

interface NaviCoreProInterfaceProps {
  onExit: () => void
  destination: { latitude: number; longitude: number; name?: string } | null
}

export const NaviCoreProInterface = ({ onExit, destination }: NaviCoreProInterfaceProps) => {
  const [mapboxToken, setMapboxToken] = useState<string | null>(null)
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [routeData, setRouteData] = useState<NavigationRoute | null>(null)
  const [currentStepInstruction, setCurrentStepInstruction] = useState<string>("Calculating route...")
  const [isLoadingRoute, setIsLoadingRoute] = useState(true)

  const [currentTime, setCurrentTime] = useState(new Date())
  const [currentSpeed, setCurrentSpeed] = useState(0) // Start at 0, simulate movement later

  // Fetch Mapbox token
  useEffect(() => {
    async function fetchMapboxToken() {
      try {
        const response = await fetch("/api/mapbox-token")
        if (!response.ok) throw new Error(`Failed to fetch Mapbox token: ${response.statusText}`)
        const data = await response.json()
        if (data.token) setMapboxToken(data.token)
        else throw new Error("Mapbox token not found in API response")
      } catch (error) {
        console.error("Error fetching Mapbox token:", error)
        setCurrentStepInstruction("Error: Could not load map configuration.")
        setIsLoadingRoute(false)
      }
    }
    fetchMapboxToken()
  }, [])

  // Get User's Current Location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error getting user location:", error)
          // Fallback to a default location if geolocation fails or is denied
          setUserLocation({ latitude: 40.7128, longitude: -74.006 }) // Default: NYC
          setCurrentStepInstruction("Error: Could not get current location. Using default.")
        },
      )
    } else {
      console.error("Geolocation is not supported by this browser.")
      setUserLocation({ latitude: 40.7128, longitude: -74.006 }) // Default: NYC
      setCurrentStepInstruction("Error: Geolocation not supported. Using default.")
    }
  }, [])

  // Calculate Route when userLocation and destination are available
  useEffect(() => {
    if (userLocation && destination && mapboxToken) {
      // Ensure token is also available
      setIsLoadingRoute(true)
      setCurrentStepInstruction("Calculating route...")
      setRouteData(null) // Clear previous route

      const calculate = async () => {
        try {
          const response = await fetch("/api/navigation/calculate-route", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              from: [userLocation.longitude, userLocation.latitude],
              to: [destination.longitude, destination.latitude],
              options: { routeType: "fastest" }, // Example option
            }),
          })
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `Route calculation failed: ${response.statusText}`)
          }
          const newRoute: NavigationRoute = await response.json()
          setRouteData(newRoute)
          setCurrentStepInstruction(newRoute.steps[0]?.instruction || "Route calculated.")
          setIsLoadingRoute(false)
        } catch (error) {
          console.error("Error calculating route:", error)
          setCurrentStepInstruction(`Error: ${(error as Error).message || "Could not calculate route."}`)
          setIsLoadingRoute(false)
        }
      }
      calculate()
    }
  }, [userLocation, destination, mapboxToken])

  // Initialize Mapbox Map
  useEffect(() => {
    if (map.current || !mapContainer.current || !mapboxToken || !userLocation) return

    mapboxgl.accessToken = mapboxToken
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/navigation-night-v1",
      center: [userLocation.longitude, userLocation.latitude],
      zoom: 14,
      pitch: 60,
      bearing: -20,
      interactive: false,
    })

    map.current.on("load", () => {
      setMapLoaded(true)
      // Add user location marker
      new mapboxgl.Marker({ color: "#007AFF" })
        .setLngLat([userLocation.longitude, userLocation.latitude])
        .addTo(map.current!)
    })

    return () => {
      map.current?.remove()
      map.current = null
      setMapLoaded(false)
    }
  }, [mapboxToken, userLocation]) // Re-init if userLocation changes significantly (or just on first load)

  // Update map with route geometry
  useEffect(() => {
    if (map.current && mapLoaded && routeData?.geometry) {
      const mapInstance = map.current
      const sourceId = "route"

      if (mapInstance.getSource(sourceId)) {
        ;(mapInstance.getSource(sourceId) as mapboxgl.GeoJSONSource).setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: routeData.geometry,
          },
        })
      } else {
        mapInstance.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: routeData.geometry,
            },
          },
        })
        mapInstance.addLayer({
          id: sourceId,
          type: "line",
          source: sourceId,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": "#007AFF", "line-width": 8, "line-opacity": 0.9 },
        })
      }

      // Fit map to route bounds
      if (routeData.geometry.length > 0) {
        const bounds = new mapboxgl.LngLatBounds(
          routeData.geometry[0] as LngLatLike,
          routeData.geometry[0] as LngLatLike,
        )
        for (const coord of routeData.geometry) {
          bounds.extend(coord as LngLatLike)
        }
        mapInstance.fitBounds(bounds, {
          padding: { top: 150, bottom: 250, left: 50, right: 50 }, // Adjust padding to not overlap UI
          pitch: 60, // Maintain pitch
          bearing: mapInstance.getBearing(), // Maintain bearing
        })
      }
    }
  }, [mapLoaded, routeData])

  // Update time and simulate speed
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    const speedTimer = setInterval(() => {
      if (routeData) {
        // Only simulate speed if navigating
        setCurrentSpeed((prev) => Math.max(20, Math.min(75, prev + (Math.random() - 0.5) * 5)))
      } else {
        setCurrentSpeed(0)
      }
    }, 2000)
    return () => {
      clearInterval(timer)
      clearInterval(speedTimer)
    }
  }, [routeData])

  const formatDistance = (meters: number): string => {
    if (meters < 1000) return `${Math.round(meters)} m`
    return `${(meters / 1000).toFixed(1)} km`
  }

  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h > 0) return `${h}h ${m}m remaining`
    return `${m}m remaining`
  }

  const calculateETA = (durationSeconds: number): string => {
    const etaDate = new Date(Date.now() + durationSeconds * 1000)
    return etaDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const displayDistance = routeData ? formatDistance(routeData.distance) : isLoadingRoute ? "..." : "N/A"
  const displayTimeRemaining = routeData ? formatDuration(routeData.duration) : isLoadingRoute ? "..." : "N/A"
  const displayETA = routeData ? calculateETA(routeData.duration) : "--:--"
  const displayProgress = routeData
    ? ((routeData.distance - routeData.steps.slice(1).reduce((sum, step) => sum + step.distance, 0)) /
        routeData.distance) *
      100
    : 0

  return (
    <div className="h-screen flex flex-col font-sans text-white overflow-hidden" style={{ backgroundColor: "#1C1C1E" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 border-b"
        style={{ height: "80px", borderColor: "rgba(255, 255, 255, 0.1)" }}
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onExit} className="rounded-full hover:bg-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="font-semibold text-base">{destination?.name || "Destination"}</div>
            <div className="text-sm text-gray-400">via {routeData?.steps[0]?.streetName || "Calculating..."}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-medium text-base">
            {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div className="text-sm text-gray-400">ETA {displayETA}</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="absolute inset-0" />
        {(!mapboxToken || !mapLoaded || (isLoadingRoute && !routeData)) && (
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-10">
            <div className="text-center">
              <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" />
              <p>
                {!mapboxToken
                  ? "Fetching map configuration..."
                  : isLoadingRoute
                    ? "Calculating route..."
                    : "Loading Professional Navigation..."}
              </p>
            </div>
          </div>
        )}

        {/* Top Instruction Card */}
        <div className="absolute top-4 left-4 right-4 z-20">
          <div
            className="rounded-lg shadow-2xl p-4 border"
            style={{ backgroundColor: "rgba(28, 28, 30, 0.9)", borderColor: "rgba(255, 255, 255, 0.1)" }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#007AFF" }}
              >
                <Navigation className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <div style={{ fontWeight: 700, fontSize: "24px" }}>
                  {isLoadingRoute && !routeData ? "Calculating..." : currentStepInstruction}
                </div>
                <div className="mt-1" style={{ fontWeight: 600, fontSize: "20px", color: "#007AFF" }}>
                  {displayDistance}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Info Panel */}
        <div className="absolute top-24 right-4 z-20 flex flex-col gap-3 items-center">
          <div
            className="p-3 rounded-lg text-center"
            style={{ backgroundColor: "rgba(28, 28, 30, 0.9)", border: "1px solid rgba(255, 255, 255, 0.1)" }}
          >
            <div className="font-bold text-2xl">{Math.round(currentSpeed)}</div>
            <div className="text-xs text-gray-400">mph</div>
          </div>
          <div
            className="w-14 h-14 rounded-full border-4 flex items-center justify-center"
            style={{ backgroundColor: "#1C1C1E", borderColor: "#FFFFFF" }}
          >
            <div className="text-center">
              <div className="font-bold text-lg">{routeData?.steps[0]?.speedLimit || 70}</div>
              <div className="text-xs text-gray-400">LIMIT</div>
            </div>
          </div>
        </div>

        {/* Bottom Info Bar */}
        <div className="absolute bottom-20 left-4 right-4 z-20">
          <div
            className="rounded-lg p-3 flex items-center justify-between"
            style={{ backgroundColor: "rgba(28, 28, 30, 0.9)", border: "1px solid rgba(255, 255, 255, 0.1)" }}
          >
            <div className="flex items-center gap-4">
              <Clock className="w-5 h-5 text-gray-400" />
              <div style={{ fontWeight: 400, fontSize: "16px" }}>{displayTimeRemaining}</div>
            </div>
            {routeData && routeData.trafficDelays > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ backgroundColor: "#FF3B30" }}>
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {formatDuration(routeData.trafficDelays).replace(" remaining", " delay")}
                </span>
              </div>
            )}
          </div>
          <div className="mt-2 w-full bg-gray-700 rounded-full h-1" style={{ height: "4px" }}>
            <div
              className="h-1 rounded-full"
              style={{ width: `${displayProgress}%`, backgroundColor: "#007AFF", height: "4px" }}
            ></div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div
        className="flex items-center justify-center gap-4 p-3 border-t"
        style={{ height: "72px", borderColor: "rgba(255, 255, 255, 0.1)" }}
      >
        <Button className="rounded-full w-14 h-14 shadow-lg" style={{ backgroundColor: "#34C759", color: "#FFFFFF" }}>
          <Phone className="w-6 h-6" />
        </Button>
        <Button
          variant="outline"
          className="h-14 flex-1 rounded-lg text-base font-semibold border-gray-600 hover:bg-gray-700"
        >
          Routes
        </Button>
        <Button
          variant="outline"
          className="h-14 flex-1 rounded-lg text-base font-semibold border-gray-600 hover:bg-gray-700"
        >
          Options
        </Button>
      </div>
    </div>
  )
}
