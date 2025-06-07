"use client"

import { useEffect, useState, useRef } from "react"
import mapboxgl, { type LngLatLike } from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { Button } from "@/components/ui/button"
import { Phone, ArrowLeft, Navigation, AlertTriangle, Clock, Loader2, WifiOff } from "lucide-react" // Added WifiOff
import type { NavigationRoute, NavigationStep } from "@/lib/navigation-store"

interface NaviCoreProInterfaceProps {
  onExit: () => void
  destination: { latitude: number; longitude: number; name?: string } | null
}

export const NaviCoreProInterface = ({ onExit, destination }: NaviCoreProInterfaceProps) => {
  const [mapboxToken, setMapboxToken] = useState<string | null>(null)
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapStatus, setMapStatus] = useState<
    "idle" | "loading_token" | "loading_config" | "loading_route" | "loading_map" | "loaded" | "error"
  >("loading_token")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)

  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [routeData, setRouteData] = useState<NavigationRoute | null>(null)
  const [currentStep, setCurrentStep] = useState<NavigationStep | null>(null)

  const [currentTime, setCurrentTime] = useState(new Date())
  const [currentSpeed, setCurrentSpeed] = useState(0)

  // 1. Fetch Mapbox token
  useEffect(() => {
    setMapStatus("loading_token")
    setErrorMessage(null)
    setErrorDetails(null)
    async function fetchMapboxToken() {
      try {
        const response = await fetch("/api/mapbox-token")
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Token API Error: ${response.statusText} (${response.status}). Server said: ${errorText}`)
        }
        const data = await response.json()
        if (data.token) {
          setMapboxToken(data.token)
          setMapStatus("loading_config")
        } else {
          throw new Error("Mapbox token not found in API response")
        }
      } catch (error) {
        console.error("Error fetching Mapbox token:", error)
        setErrorMessage("Map Service Unavailable")
        setErrorDetails(
          (error as Error).message ||
            "Could not load map configuration. Please check your connection or contact support.",
        )
        setMapStatus("error")
      }
    }
    fetchMapboxToken()
  }, [])

  // 2. Get User's Current Location
  useEffect(() => {
    if (mapStatus !== "loading_config") return

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
          setMapStatus("loading_route") // Ready to load route
        },
        (geoError) => {
          console.error("Error getting user location:", geoError)
          setErrorMessage("Location Access Denied")
          setErrorDetails(geoError.message || "Could not get current location. Please enable location services.")
          // Fallback or stop? For now, let's stop and show error.
          // setUserLocation({ latitude: 40.7128, longitude: -74.006 })
          setMapStatus("error")
        },
        { timeout: 10000, enableHighAccuracy: true }, // Added timeout and high accuracy
      )
    } else {
      console.error("Geolocation is not supported by this browser.")
      setErrorMessage("Geolocation Not Supported")
      setErrorDetails(
        "Your browser does not support geolocation. Please use a different browser or enable the feature.",
      )
      setMapStatus("error")
    }
  }, [mapStatus])

  // 3. Calculate Route
  useEffect(() => {
    if (mapStatus !== "loading_route" || !userLocation || !destination || !mapboxToken) return

    setRouteData(null)
    setCurrentStep(null)
    setErrorMessage(null)
    setErrorDetails(null)

    const calculate = async () => {
      try {
        const response = await fetch("/api/navigation/calculate-route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            from: [userLocation.longitude, userLocation.latitude],
            to: [destination.longitude, destination.latitude],
            options: { routeType: "fastest" },
          }),
        })
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown route calculation error" }))
          throw new Error(errorData.error || `Route calculation failed: ${response.statusText}`)
        }
        const newRoute: NavigationRoute = await response.json()
        if (!newRoute || !newRoute.steps || newRoute.steps.length === 0) {
          throw new Error("Invalid route data received from server.")
        }
        setRouteData(newRoute)
        setCurrentStep(newRoute.steps[0] || null)
        setMapStatus("loading_map")
      } catch (error) {
        console.error("Error calculating route:", error)
        setErrorMessage("Route Calculation Failed")
        setErrorDetails((error as Error).message || "Could not calculate route to destination.")
        setMapStatus("error")
      }
    }
    calculate()
  }, [mapStatus, userLocation, destination, mapboxToken])

  // 4. Initialize Mapbox Map
  useEffect(() => {
    if (
      mapStatus !== "loading_map" ||
      map.current ||
      !mapContainer.current ||
      !mapboxToken ||
      !userLocation ||
      !routeData
    ) {
      return
    }

    mapboxgl.accessToken = mapboxToken
    const initialCenter: LngLatLike =
      routeData.geometry.length > 0
        ? (routeData.geometry[0] as LngLatLike)
        : [userLocation.longitude, userLocation.latitude]

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/navigation-night-v1",
        center: initialCenter,
        zoom: 14,
        pitch: 60,
        bearing: -20,
        interactive: false,
      })
    } catch (mapInitError) {
      console.error("Mapbox GL Init Error:", mapInitError)
      setErrorMessage("Map Initialization Failed")
      setErrorDetails((mapInitError as Error).message || "Could not initialize the map display.")
      setMapStatus("error")
      return
    }

    map.current.on("load", () => {
      console.log("NaviCore Pro: Map style loaded.")
      setMapStatus("loaded")

      new mapboxgl.Marker({ color: "#007AFF" })
        .setLngLat([userLocation.longitude, userLocation.latitude])
        .addTo(map.current!)

      if (destination) {
        new mapboxgl.Marker({ color: "#34C759" })
          .setLngLat([destination.longitude, destination.latitude])
          .addTo(map.current!)
      }

      const mapInstance = map.current!
      const sourceId = "route"
      if (mapInstance.getSource(sourceId)) mapInstance.removeSource(sourceId) // Ensure clean state
      if (mapInstance.getLayer(sourceId)) mapInstance.removeLayer(sourceId)

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

      if (routeData.geometry.length > 1) {
        const bounds = routeData.geometry.reduce(
          (bounds, coord) => {
            return bounds.extend(coord as LngLatLike)
          },
          new mapboxgl.LngLatBounds(routeData.geometry[0] as LngLatLike, routeData.geometry[0] as LngLatLike),
        )

        mapInstance.fitBounds(bounds, {
          padding: { top: 200, bottom: 280, left: 80, right: 80 },
          pitch: 60,
          bearing: mapInstance.getBearing(),
          duration: 1000,
        })
      } else if (routeData.geometry.length === 1) {
        mapInstance.flyTo({
          center: routeData.geometry[0] as LngLatLike,
          zoom: 15,
          pitch: 60,
          bearing: mapInstance.getBearing(),
        })
      }
    })

    map.current.on("error", (e) => {
      console.error("Mapbox GL Runtime Error:", e.error)
      setErrorMessage("Map Display Error")
      setErrorDetails(`Map Error: ${e.error?.message || "An unexpected error occurred with the map."}`)
      setMapStatus("error")
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [mapStatus, mapboxToken, userLocation, routeData, destination])

  // Update time and simulate speed
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    const speedTimer = setInterval(() => {
      if (routeData) {
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

  const displayInstruction =
    currentStep?.instruction ||
    (mapStatus !== "loaded" && mapStatus !== "error" ? "Calculating..." : "Route information unavailable")
  const displayDistanceToNextStep = currentStep ? formatDistance(currentStep.distance) : "..."
  const displayTimeRemaining = routeData
    ? formatDuration(routeData.duration)
    : mapStatus !== "loaded" && mapStatus !== "error"
      ? "..."
      : "N/A"
  const displayETA = routeData ? calculateETA(routeData.duration) : "--:--"

  let displayProgress = 0
  if (routeData && routeData.distance > 0 && currentStep) {
    const currentStepIndex = routeData.steps.findIndex((step) => step.id === currentStep.id)
    if (currentStepIndex !== -1) {
      const distanceCoveredInCurrentStep = 0 // This would need real-time tracking
      const distanceOfPreviousSteps = routeData.steps
        .slice(0, currentStepIndex)
        .reduce((sum, step) => sum + step.distance, 0)
      const totalDistanceCovered = distanceOfPreviousSteps + distanceCoveredInCurrentStep
      displayProgress = (totalDistanceCovered / routeData.distance) * 100
    } else {
      // Fallback if current step not found (e.g. at start)
      displayProgress = 0
    }
    if (isNaN(displayProgress) || displayProgress < 0) displayProgress = 0
    if (displayProgress > 100) displayProgress = 100
  }

  let loadingMessage = "Loading Professional Navigation..."
  if (mapStatus === "loading_token") loadingMessage = "Initializing secure connection..."
  else if (mapStatus === "loading_config") loadingMessage = "Acquiring satellite signal..."
  else if (mapStatus === "loading_route") loadingMessage = "Calculating optimal route..."
  else if (mapStatus === "loading_map") loadingMessage = "Rendering 3D map view..."

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
            <div className="font-semibold text-base truncate max-w-[calc(100vw-200px)]">
              {destination?.name || "Destination"}
            </div>
            <div className="text-sm text-gray-400">
              via{" "}
              {currentStep?.streetName ||
                (mapStatus !== "loaded" && mapStatus !== "error" ? "Calculating..." : "Route details")}
            </div>
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
        {mapStatus !== "loaded" && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-10 p-4 text-center">
            {mapStatus !== "error" && <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-400" />}
            {mapStatus === "error" && <WifiOff className="w-16 h-16 mx-auto mb-4 text-red-500" />}
            <p className={`text-lg mb-2 ${mapStatus === "error" ? "text-red-400" : ""}`}>
              {mapStatus === "error" ? errorMessage : loadingMessage}
            </p>
            {mapStatus === "error" && errorDetails && (
              <div className="mt-2 text-sm text-gray-400 bg-gray-800 bg-opacity-70 p-3 rounded-md max-w-md">
                <p className="font-semibold mb-1">Details:</p>
                <p>{errorDetails}</p>
              </div>
            )}
            {mapStatus === "error" && (
              <Button
                onClick={() => {
                  /* Implement retry logic: e.g., reset mapStatus to loading_token */
                  setMapStatus("loading_token")
                  setErrorMessage(null)
                  setErrorDetails(null)
                }}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                Retry
              </Button>
            )}
          </div>
        )}

        {/* Top Instruction Card */}
        {mapStatus === "loaded" && currentStep && (
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
                  <div style={{ fontWeight: 700, fontSize: "24px" }}>{displayInstruction}</div>
                  <div className="mt-1" style={{ fontWeight: 600, fontSize: "20px", color: "#007AFF" }}>
                    {displayDistanceToNextStep}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right Side Info Panel */}
        {mapStatus === "loaded" && (
          <div className="absolute top-36 right-4 z-20 flex flex-col gap-3 items-center">
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
                <div className="font-bold text-lg">
                  {currentStep?.speedLimit || routeData?.steps[0]?.speedLimit || 35}
                </div>
                <div className="text-xs text-gray-400">LIMIT</div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Info Bar */}
        {mapStatus === "loaded" && routeData && (
          <div className="absolute bottom-20 left-4 right-4 z-20">
            <div
              className="rounded-lg p-3 flex items-center justify-between"
              style={{ backgroundColor: "rgba(28, 28, 30, 0.9)", border: "1px solid rgba(255, 255, 255, 0.1)" }}
            >
              <div className="flex items-center gap-4">
                <Clock className="w-5 h-5 text-gray-400" />
                <div style={{ fontWeight: 400, fontSize: "16px" }}>{displayTimeRemaining}</div>
              </div>
              {routeData.trafficDelays > 0 && (
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
                style={{
                  width: `${displayProgress}%`,
                  backgroundColor: "#007AFF",
                  height: "4px",
                  transition: "width 0.5s ease-in-out",
                }}
              ></div>
            </div>
          </div>
        )}
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
