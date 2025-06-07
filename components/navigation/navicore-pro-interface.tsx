"use client"

import { useEffect, useState, useRef } from "react"
import mapboxgl, { type LngLatLike, type LngLatBoundsLike } from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Navigation, Loader2, WifiOff, Volume2, MoreHorizontal } from "lucide-react"
import type { NavigationRoute, NavigationStep } from "@/lib/navigation-store"
import { formatDistance, formatDuration } from "@/lib/utils" // Corrected import

// --- Helper Functions (validateCoordinates, calculateSafeBounds, validateRouteData) ---
function validateCoordinates(coords: any): coords is [number, number] {
  if (!Array.isArray(coords) || coords.length !== 2) return false
  const [lng, lat] = coords
  return (
    typeof lng === "number" &&
    typeof lat === "number" &&
    !isNaN(lng) &&
    !isNaN(lat) &&
    lng >= -180 &&
    lng <= 180 &&
    lat >= -90 &&
    lat <= 90
  )
}

function calculateSafeBounds(geometry: [number, number][]): LngLatBoundsLike | null {
  // console.log("NaviCoreProInterface: Calculating safe bounds for geometry:", geometry) // Keep for debugging if needed
  const validCoords = geometry.filter(validateCoordinates)

  if (validCoords.length === 0) {
    console.error("NaviCoreProInterface: No valid coordinates found in geometry for calculateSafeBounds")
    return null
  }

  const lngs = validCoords.map((coord) => coord[0])
  const lats = validCoords.map((coord) => coord[1])

  const sw: [number, number] = [Math.min(...lngs), Math.min(...lats)]
  const ne: [number, number] = [Math.max(...lngs), Math.max(...lats)]

  if (!validateCoordinates(sw) || !validateCoordinates(ne)) {
    console.error("NaviCoreProInterface: Calculated SW or NE bounds points are invalid. SW:", sw, "NE:", ne)
    return null
  }
  // console.log("NaviCoreProInterface: Calculated safe SW, NE:", sw, ne) // Keep for debugging
  return [sw, ne]
}

function validateRouteData(routeData: NavigationRoute | null): boolean {
  // console.log("NaviCoreProInterface: 🔍 Validating route data:", routeData) // Keep for debugging
  if (!routeData || !routeData.geometry) {
    console.error("NaviCoreProInterface: ❌ Route data or geometry is missing")
    return false
  }
  if (!Array.isArray(routeData.geometry)) {
    console.error("NaviCoreProInterface: ❌ Geometry is not an array")
    return false
  }
  const validCoords = routeData.geometry.filter(validateCoordinates)
  // console.log(
  //   `NaviCoreProInterface: ✅ Found ${validCoords.length}/${routeData.geometry.length} valid coordinates in routeData`,
  // ) // Keep for debugging
  return validCoords.length > 0
}
// --- End of Helper Functions ---

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
  // Removed navigationData state as it was not fully utilized and speedLimit/distance can be derived

  let loadingMessage = "Loading Professional Navigation..."
  if (mapStatus === "loading_token") loadingMessage = "Initializing secure connection..."
  else if (mapStatus === "loading_config") loadingMessage = "Acquiring satellite signal..."
  else if (mapStatus === "loading_route") loadingMessage = "Calculating optimal route..."
  else if (mapStatus === "loading_map") loadingMessage = "Rendering 3D map view..."

  // 1. Fetch Mapbox token
  useEffect(() => {
    setMapStatus("loading_token")
    setErrorMessage(null)
    setErrorDetails(null)
    async function fetchMapboxToken() {
      try {
        const response = await fetch("/api/mapbox/token") // Ensure this API route exists and is correct
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
          const { latitude, longitude } = position.coords
          if (!validateCoordinates([longitude, latitude])) {
            console.error("Invalid user location coordinates from Geolocation API:", position.coords)
            setErrorMessage("Invalid Location Data")
            setErrorDetails(
              "Received invalid coordinates for your current location. Please try again or check location settings.",
            )
            setMapStatus("error")
            return
          }
          setUserLocation({ latitude, longitude })
          setMapStatus("loading_route")
        },
        (geoError) => {
          console.error("Error getting user location:", geoError)
          setErrorMessage("Location Access Denied")
          setErrorDetails(geoError.message || "Could not get current location. Please enable location services.")
          setMapStatus("error")
        },
        { timeout: 10000, enableHighAccuracy: true },
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

    if (
      !validateCoordinates([userLocation.longitude, userLocation.latitude]) ||
      !validateCoordinates([destination.longitude, destination.latitude])
    ) {
      console.error("NaviCoreProInterface: Invalid coordinates for route calculation (client-side pre-check):", {
        userLocation,
        destination,
      })
      setErrorMessage("Invalid Route Coordinates")
      setErrorDetails("Cannot calculate route due to invalid start or end point coordinates.")
      setMapStatus("error")
      return
    }

    const calculate = async () => {
      try {
        // console.log(
        //   `NaviCoreProInterface: Fetching route from [${userLocation.longitude}, ${userLocation.latitude}] to [${destination.longitude}, ${destination.latitude}]`,
        // )
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
          const errorData = await response.json().catch(() => ({
            error: "Unknown route calculation error",
            details: `Server responded with ${response.status}`,
          }))
          console.error("NaviCoreProInterface: API error response:", errorData)
          throw new Error(errorData.details || errorData.error || `Route calculation failed: ${response.statusText}`)
        }
        const newRoute: NavigationRoute = await response.json()

        if (!validateRouteData(newRoute)) {
          throw new Error("Received invalid route data structure or content from API.")
        }
        if (newRoute.geometry.some((coord) => !validateCoordinates(coord))) {
          // console.error(
          //   "NaviCoreProInterface: Route geometry from API contains invalid/NaN or out-of-bounds values after validateRouteData:",
          //   JSON.stringify(newRoute.geometry),
          // )
          throw new Error("Route calculation resulted in invalid geometry points. Please check API response.")
        }

        setRouteData(newRoute)
        setCurrentStep(newRoute.steps[0] || null)
        setMapStatus("loading_map")
      } catch (error) {
        console.error("NaviCoreProInterface: Error in calculate function:", error)
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

    // console.log("NaviCoreProInterface: 🗺️ Pre-fitBounds validation:")
    // console.log("NaviCoreProInterface: Route geometry:", routeData.geometry)

    routeData.geometry.forEach((coord, index) => {
      if (!validateCoordinates(coord)) {
        console.error(`NaviCoreProInterface: ❌ Invalid coordinate at index ${index} in routeData.geometry:`, coord)
      }
    })

    mapboxgl.accessToken = mapboxToken
    const initialCenter: LngLatLike = routeData.geometry[0]

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/navigation-night-v1",
        center: initialCenter,
        zoom: 14,
        pitch: 60,
        bearing: -20,
        interactive: false, // Set to true if you want map interaction
      })
    } catch (mapInitError) {
      console.error("Mapbox GL Init Error:", mapInitError)
      setErrorMessage("Map Initialization Failed")
      setErrorDetails((mapInitError as Error).message || "Could not initialize the map display.")
      setMapStatus("error")
      return
    }

    map.current.on("load", () => {
      // console.log("NaviCore Pro: Map style loaded.")
      const mapInstance = map.current!
      // console.log("NaviCoreProInterface: Map ready state:", mapInstance.loaded())
      // console.log("NaviCoreProInterface: Map style loaded:", mapInstance.isStyleLoaded())
      mapInstance.resize()

      if (validateCoordinates([userLocation.longitude, userLocation.latitude])) {
        new mapboxgl.Marker({ color: "#007AFF" })
          .setLngLat([userLocation.longitude, userLocation.latitude])
          .addTo(mapInstance)
      }

      if (destination && validateCoordinates([destination.longitude, destination.latitude])) {
        new mapboxgl.Marker({ color: "#34C759" }) // Green for destination
          .setLngLat([destination.longitude, destination.latitude])
          .addTo(mapInstance)
      }

      const sourceId = "route"
      if (mapInstance.getSource(sourceId)) mapInstance.removeSource(sourceId)
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

      setMapStatus("loaded")

      const geometryForBounds = routeData.geometry
      let boundsToFit: LngLatBoundsLike | null = null

      if (Array.isArray(geometryForBounds) && geometryForBounds.length > 0) {
        boundsToFit = calculateSafeBounds(geometryForBounds)
        // console.log("NaviCoreProInterface: Calculated bounds via calculateSafeBounds:", boundsToFit)
      } else {
        console.warn("NaviCoreProInterface: ❌ Geometry for bounds is invalid or empty.")
      }

      const isValidBoundsArray =
        boundsToFit &&
        Array.isArray(boundsToFit) &&
        boundsToFit.length === 2 &&
        validateCoordinates(boundsToFit[0] as [number, number]) &&
        validateCoordinates(boundsToFit[1] as [number, number])

      if (isValidBoundsArray && boundsToFit) {
        // console.log("NaviCoreProInterface: ✅ Bounds array is valid, attempting fitBounds:", boundsToFit)
        try {
          mapInstance.fitBounds(boundsToFit, {
            padding: 50,
            maxZoom: 15,
            duration: 1000,
            essential: true,
          })
          // console.log("NaviCoreProInterface: ✅ Map bounds set successfully using validated bounds:", boundsToFit)
        } catch (error) {
          console.error(
            "NaviCoreProInterface: ❌ fitBounds failed even with validated bounds, using flyTo fallback:",
            error,
            "Bounds were:",
            boundsToFit,
          )
          const centerLng = (boundsToFit[0][0] + boundsToFit[1][0]) / 2
          const centerLat = (boundsToFit[0][1] + boundsToFit[1][1]) / 2
          if (validateCoordinates([centerLng, centerLat])) {
            mapInstance.flyTo({ center: [centerLng, centerLat], zoom: 13, duration: 1000 })
          } else {
            const firstValidGeoPoint = geometryForBounds.find(validateCoordinates)
            if (firstValidGeoPoint) {
              mapInstance.flyTo({ center: firstValidGeoPoint, zoom: 13, duration: 1000 })
            } else if (userLocation && validateCoordinates([userLocation.longitude, userLocation.latitude])) {
              mapInstance.flyTo({ center: [userLocation.longitude, userLocation.latitude], zoom: 12 })
            }
          }
        }
      } else {
        // console.warn("NaviCoreProInterface: ❌ Invalid bounds calculated or geometry empty. Using fallback flyTo.")
        const firstValidGeoPoint =
          geometryForBounds && geometryForBounds.length > 0 ? geometryForBounds.find(validateCoordinates) : null
        if (firstValidGeoPoint) {
          // console.log("NaviCoreProInterface: Flying to first valid geometry point:", firstValidGeoPoint)
          mapInstance.flyTo({ center: firstValidGeoPoint, zoom: 13, duration: 1000 })
        } else if (userLocation && validateCoordinates([userLocation.longitude, userLocation.latitude])) {
          // console.log("NaviCoreProInterface: Flying to user location as fallback:", userLocation)
          mapInstance.flyTo({ center: [userLocation.longitude, userLocation.latitude], zoom: 12 })
        } else {
          console.error("NaviCoreProInterface: ❌ No valid coordinates available for map positioning.")
        }
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
        // Only simulate speed if there's a route
        setCurrentSpeed((prev) => Math.max(0, Math.min(75, prev + (Math.random() - 0.5) * 10))) // Adjusted simulation
      } else {
        setCurrentSpeed(0)
      }
    }, 2000)
    return () => {
      clearInterval(timer)
      clearInterval(speedTimer)
    }
  }, [routeData])

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
      const distanceOfPreviousSteps = routeData.steps
        .slice(0, currentStepIndex)
        .reduce((sum, step) => sum + step.distance, 0)
      displayProgress = (distanceOfPreviousSteps / routeData.distance) * 100
    }
    if (isNaN(displayProgress) || displayProgress < 0) displayProgress = 0
    if (displayProgress > 100) displayProgress = 100
  }

  return (
    <div className="h-full w-full flex flex-col font-sans text-white overflow-hidden bg-[#1C1C1E]">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 border-b shrink-0"
        style={{ height: "60px", borderColor: "rgba(255, 255, 255, 0.1)" }}
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onExit} className="rounded-full hover:bg-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="font-semibold text-base truncate max-w-[calc(100vw-280px)]">
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
              <Button onClick={() => setMapStatus("loading_token")} className="mt-4 bg-blue-600 hover:bg-blue-700">
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
                  <Navigation className="w-7 h-7 text-white" /> {/* Or use a dynamic icon based on maneuver */}
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
          <div className="absolute top-[124px] right-4 z-20 flex flex-col gap-3 items-center">
            <div
              className="p-3 rounded-lg text-center"
              style={{ backgroundColor: "rgba(28, 28, 30, 0.9)", border: "1px solid rgba(255, 255, 255, 0.1)" }}
            >
              <div className="font-bold text-2xl">{Math.round(currentSpeed)}</div>
              <div className="text-xs text-gray-400">mph</div>
            </div>
            <div
              className="w-14 h-14 rounded-full border-4 flex items-center justify-center"
              style={{ backgroundColor: "#1C1C1E", borderColor: "#FFFFFF" }} // Example speed limit display
            >
              <div className="text-center">
                <div className="font-bold text-lg">
                  {currentStep?.speedLimit || routeData?.steps[0]?.speedLimit || "N/A"}
                </div>
                <div className="text-xs text-gray-400">LIMIT</div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Info Bar */}
        {mapStatus === "loaded" && routeData && (
          <div className="absolute bottom-16 left-4 right-4 z-20">
            {" "}
            {/* Adjusted bottom from 20 to 16 to make space for progress bar */}
            <div
              className="rounded-lg p-3 flex items-center justify-between"
              style={{ backgroundColor: "rgba(28, 28, 30, 0.9)", border: "1px solid rgba(255, 255, 255, 0.1)" }}
            >
              <div className="flex items-center gap-4">
                {/* <Clock className="w-5 h-5 text-gray-400" /> Replaced with Volume2 and MoreHorizontal */}
                <div style={{ fontWeight: 400, fontSize: "16px" }}>{displayTimeRemaining}</div>
              </div>
              {/* Example Traffic Delay Indicator - adapt based on your routeData structure */}
              {routeData.trafficDelays && routeData.trafficDelays > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ backgroundColor: "#FF3B30" }}>
                  {/* <AlertTriangle className="w-4 h-4" /> */}
                  <span className="text-sm font-medium">
                    {formatDuration(routeData.trafficDelays).replace(" remaining", " delay")}
                  </span>
                </div>
              )}
            </div>
            {/* Progress Bar */}
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
        className="flex items-center justify-around gap-4 p-3 border-t shrink-0" // Changed to justify-around
        style={{ height: "60px", borderColor: "rgba(255, 255, 255, 0.1)" }}
      >
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-700">
          <Volume2 className="w-5 h-5" />
        </Button>
        <Button
          variant="solid" // Changed to solid for emphasis
          className="h-12 flex-1 rounded-lg text-base font-semibold bg-red-600 hover:bg-red-700 text-white"
          onClick={onExit} // Assuming onExit ends navigation
        >
          End
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-700">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
