"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Plus, Navigation, DollarSign, Car, Brain, Zap, TrendingUp, Route } from "lucide-react"
import { ParkingDataService, type RealParkingSpot } from "@/lib/parking-data-service"
import { AISpotPredictor, type SpotPrediction } from "@/lib/ai-spot-predictor"
import { useNavigationStore } from "@/lib/navigation-store"
import { NavigationService } from "@/lib/navigation-service"
import { NavigationInterface } from "@/components/navigation/navigation-interface"
import { SpotReportDialog } from "./spot-report-dialog"
import { toast } from "@/components/ui/use-toast"
import { useGeolocation } from "@/hooks/use-geolocation"

interface AreaAnalysis {
  clickLocation: { lat: number; lng: number }
  nearbySpots: RealParkingSpot[]
  aiPredictions: SpotPrediction[]
  bestRecommendation: {
    spot: RealParkingSpot
    prediction: SpotPrediction
    reason: string
  } | null
  areaInsights: {
    averagePrice: number
    availabilityTrend: "increasing" | "decreasing" | "stable"
    demandLevel: "low" | "medium" | "high"
    bestTimeToArrive: string
  }
}

interface EnhancedParkingMapProps {
  onSpotSelect?: (spot: RealParkingSpot) => void
  onStatsUpdate?: (spotsCount: number, providersCount: number) => void
  onLocationClick?: (location: { lat: number; lng: number }) => void
  onAreaAnalysis?: (analysis: any) => void
  onLoadingChange?: (loading: boolean) => void
}

export function EnhancedParkingMap({
  onSpotSelect,
  onStatsUpdate,
  onLocationClick,
  onAreaAnalysis,
  onLoadingChange,
}: EnhancedParkingMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [reportLocation, setReportLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [mapboxError, setMapboxError] = useState<string | null>(null)
  const [mapboxToken, setMapboxToken] = useState<string | null>(null)
  const [realSpots, setRealSpots] = useState<RealParkingSpot[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSpot, setSelectedSpot] = useState<RealParkingSpot | null>(null)
  const [areaAnalysis, setAreaAnalysis] = useState<AreaAnalysis | null>(null)
  const [analyzingArea, setAnalyzingArea] = useState(false)
  const [clickedLocation, setClickedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [mapInitialized, setMapInitialized] = useState(false)
  const [mapboxLoaded, setMapboxLoaded] = useState(false)

  const { latitude, longitude, error: locationError } = useGeolocation()
  const parkingService = ParkingDataService.getInstance()
  const aiPredictor = AISpotPredictor.getInstance()
  const navigationService = NavigationService.getInstance()

  // Navigation store
  const { isNavigating, startNavigation, stopNavigation } = useNavigationStore()

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

    fetchMapboxToken()
  }, [])

  // Handle map click - defined outside the initialization to avoid recreation
  const handleMapClick = useCallback(
    async (e: any) => {
      console.log("Map clicked at:", e.lngLat)

      const clickLocation = {
        lat: e.lngLat.lat,
        lng: e.lngLat.lng,
      }

      // Show loading indicator
      setAnalyzingArea(true)
      setAreaAnalysis(null)
      onLocationClick?.(clickLocation)
      onLoadingChange?.(true)

      toast({
        title: "Analyzing area...",
        description: `Coordinates: ${clickLocation.lat.toFixed(4)}, ${clickLocation.lng.toFixed(4)}`,
      })

      try {
        // Analyze the clicked area with AI
        await analyzeAreaWithAI(clickLocation)
      } catch (error) {
        console.error("Error analyzing area:", error)
        toast({
          title: "Analysis failed",
          description: "Could not analyze this area. Please try again.",
          variant: "destructive",
        })
      } finally {
        setAnalyzingArea(false)
      }
    },
    [onLocationClick, onLoadingChange],
  )

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
            style: "mapbox://styles/mapbox/streets-v12",
            center: [longitude || -122.4194, latitude || 37.7749],
            zoom: 15,
          })

          map.current.addControl(
            new mapboxgl.GeolocateControl({
              positionOptions: { enableHighAccuracy: true },
              trackUserLocation: true,
              showUserHeading: true,
            }),
          )

          map.current.addControl(new mapboxgl.NavigationControl())

          // Wait for map to load before adding click handler
          map.current.on("load", () => {
            console.log("Map loaded successfully")
            setMapInitialized(true)

            // Add click handler
            map.current.on("click", handleMapClick)
          })

          map.current.on("error", (e: any) => {
            console.error("Mapbox error:", e)
            setMapboxError("Failed to load map. Please check your internet connection.")
          })
        }
      } catch (error) {
        console.error("Failed to initialize Mapbox:", error)
        setMapboxError("Failed to initialize map.")
      }
    }

    loadMapbox()

    return () => {
      if (map.current) {
        map.current.off("click", handleMapClick)
        map.current.remove()
        map.current = null
      }
    }
  }, [mapboxToken, handleMapClick, latitude, longitude, mapboxLoaded])

  // Update map center when user location is available
  useEffect(() => {
    if (map.current && mapInitialized && latitude && longitude) {
      map.current.setCenter([longitude, latitude])

      // Import mapbox-gl dynamically to avoid the accessToken setter issue
      import("mapbox-gl")
        .then(({ default: mapboxgl }) => {
          new mapboxgl.Marker({ color: "#3B82F6" })
            .setLngLat([longitude, latitude])
            .setPopup(new mapboxgl.Popup().setHTML("<p>Your Location</p>"))
            .addTo(map.current)

          // Fetch real parking data for this location
          fetchRealParkingData(latitude, longitude)
        })
        .catch((err) => {
          console.error("Error importing mapbox-gl for marker:", err)
        })
    }
  }, [latitude, longitude, mapInitialized])

  const startNavigationToSpot = async (spot: RealParkingSpot) => {
    if (!latitude || !longitude) {
      toast({
        title: "Location unavailable",
        description: "Please enable location services to use navigation.",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("🚗 Starting navigation to spot:", spot.name)
      setLoading(true)

      toast({
        title: "Calculating route...",
        description: `Finding the best route to ${spot.name}`,
      })

      // Calculate route to the parking spot
      const route = await navigationService.calculateRoute([longitude, latitude], [spot.longitude, spot.latitude], {
        avoidTraffic: true,
        routeType: "fastest",
      })

      console.log("📍 Route calculated, starting navigation...")

      // Start navigation
      startNavigation(
        {
          latitude: spot.latitude,
          longitude: spot.longitude,
          name: spot.name,
          spotId: spot.id.toString(),
        },
        route,
      )

      console.log("✅ Navigation started successfully!")
      toast({
        title: "Navigation started",
        description: `Navigating to ${spot.name} - ${navigationService.formatDistance(route.distance)} away`,
      })
    } catch (error) {
      console.error("❌ Failed to start navigation:", error)

      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

      toast({
        title: "Navigation failed",
        description: `Could not calculate route: ${errorMessage}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const analyzeAreaWithAI = async (clickLocation: { lat: number; lng: number }) => {
    try {
      console.log("Analyzing area at:", clickLocation)

      // Find all parking spots within 500m of clicked location
      const nearbySpots = await parkingService.getRealParkingSpots(
        clickLocation.lat,
        clickLocation.lng,
        500, // 500m radius
        {
          requireAvailability: false, // Include all spots for analysis
        },
      )

      console.log(`Found ${nearbySpots.length} nearby spots`)

      // Update the displayed spots and map markers for the clicked area
      setRealSpots(nearbySpots)

      // Update the loading state briefly to show we're fetching
      setLoading(true)
      setTimeout(() => setLoading(false), 500)

      if (nearbySpots.length === 0) {
        console.log("No spots found in this area")
        setAreaAnalysis({
          clickLocation,
          nearbySpots: [],
          aiPredictions: [],
          bestRecommendation: null,
          areaInsights: {
            averagePrice: 0,
            availabilityTrend: "stable",
            demandLevel: "low",
            bestTimeToArrive: "Now",
          },
        })

        toast({
          title: "No parking spots found",
          description: "We couldn't find any parking spots in this area.",
        })
        return
      }

      // Get AI predictions for each spot
      const predictions: SpotPrediction[] = []
      for (const spot of nearbySpots) {
        try {
          const prediction = await aiPredictor.predictSpotAvailability(
            spot.id.toString(),
            new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
            "30min",
          )
          predictions.push(prediction)
        } catch (error) {
          console.error(`Error predicting spot ${spot.id}:`, error)
        }
      }

      console.log(`Generated ${predictions.length} predictions`)

      // Analyze the area and find best recommendation
      const analysis = await performAreaAnalysis(clickLocation, nearbySpots, predictions)
      setAreaAnalysis(analysis)
      onAreaAnalysis?.(analysis)
      onLoadingChange?.(false)

      toast({
        title: "Area analyzed",
        description: `Found ${nearbySpots.length} parking spots in this area.`,
      })

      // Add click marker to map
      if (map.current && mapInitialized) {
        // Import mapbox-gl dynamically to avoid the accessToken setter issue
        import("mapbox-gl")
          .then(({ default: mapboxgl }) => {
            // Remove existing click marker
            const existingMarker = document.querySelector(".click-marker")
            if (existingMarker) {
              existingMarker.remove()
            }

            // Add new click marker
            const el = document.createElement("div")
            el.className = "click-marker"
            el.innerHTML = `
            <div class="w-8 h-8 bg-purple-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-pulse">
              <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          `

            new mapboxgl.Marker(el).setLngLat([clickLocation.lng, clickLocation.lat]).addTo(map.current)
          })
          .catch((err) => {
            console.error("Error importing mapbox-gl for click marker:", err)
          })
      }

      setClickedLocation(clickLocation)
    } catch (error) {
      console.error("Error in AI area analysis:", error)
      toast({
        title: "Analysis error",
        description: "An error occurred while analyzing this area.",
        variant: "destructive",
      })
    }
  }

  const performAreaAnalysis = async (
    clickLocation: { lat: number; lng: number },
    spots: RealParkingSpot[],
    predictions: SpotPrediction[],
  ): Promise<AreaAnalysis> => {
    // Calculate area insights
    const prices = spots.filter((s) => s.price_per_hour).map((s) => s.price_per_hour!)
    const averagePrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0

    // Find best recommendation based on AI predictions
    let bestRecommendation: AreaAnalysis["bestRecommendation"] = null
    let bestScore = -1

    for (let i = 0; i < spots.length; i++) {
      const spot = spots[i]
      const prediction = predictions[i]

      if (!prediction) continue

      // Calculate recommendation score
      const availabilityScore = prediction.predictedAvailability
      const confidenceScore = prediction.confidence
      const distanceScore = Math.max(0, 100 - calculateDistance(clickLocation, spot) * 10) // Closer = better

      const totalScore = (availabilityScore * 0.4 + confidenceScore * 0.3 + distanceScore * 0.3) / 100

      if (totalScore > bestScore) {
        bestScore = totalScore
        bestRecommendation = {
          spot,
          prediction,
          reason: generateRecommendationReason(spot, prediction, clickLocation),
        }
      }
    }

    // Analyze availability trend
    const availabilityTrend = analyzeAvailabilityTrend(predictions)

    // Determine demand level
    const demandLevel = calculateDemandLevel(predictions)

    // Calculate best time to arrive
    const bestTimeToArrive = calculateBestArrivalTime(predictions)

    return {
      clickLocation,
      nearbySpots: spots,
      aiPredictions: predictions,
      bestRecommendation,
      areaInsights: {
        averagePrice,
        availabilityTrend,
        demandLevel,
        bestTimeToArrive,
      },
    }
  }

  const calculateDistance = (point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number => {
    const R = 6371 // Earth's radius in km
    const dLat = ((point2.latitude - point1.lat) * Math.PI) / 180
    const dLng = ((point2.longitude - point1.lng) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((point1.lat * Math.PI) / 180) *
        Math.cos((point2.latitude * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c * 1000 // Return distance in meters
  }

  const generateRecommendationReason = (
    spot: RealParkingSpot,
    prediction: SpotPrediction,
    clickLocation: { lat: number; lng: number },
  ): string => {
    const distance = Math.round(calculateDistance(clickLocation, spot))
    const reasons = []

    if (prediction.predictedAvailability > 80) {
      reasons.push("high availability")
    }
    if (prediction.confidence > 85) {
      reasons.push("reliable prediction")
    }
    if (distance < 100) {
      reasons.push("very close to your target")
    }
    if (spot.price_per_hour && spot.price_per_hour < 10) {
      reasons.push("affordable pricing")
    }

    return `Best choice due to ${reasons.join(", ")} (${distance}m away)`
  }

  const analyzeAvailabilityTrend = (predictions: SpotPrediction[]): "increasing" | "decreasing" | "stable" => {
    const availabilities = predictions.map((p) => p.predictedAvailability)
    const average = availabilities.reduce((a, b) => a + b, 0) / availabilities.length

    if (average > 70) return "increasing"
    if (average < 40) return "decreasing"
    return "stable"
  }

  const calculateDemandLevel = (predictions: SpotPrediction[]): "low" | "medium" | "high" => {
    const averageAvailability = predictions.reduce((sum, p) => sum + p.predictedAvailability, 0) / predictions.length

    if (averageAvailability > 70) return "low"
    if (averageAvailability > 40) return "medium"
    return "high"
  }

  const calculateBestArrivalTime = (predictions: SpotPrediction[]): string => {
    const highAvailabilitySpots = predictions.filter((p) => p.predictedAvailability > 70)

    if (highAvailabilitySpots.length > predictions.length * 0.6) {
      return "Now - good availability"
    } else {
      return "In 15-30 minutes - availability improving"
    }
  }

  const fetchRealParkingData = async (lat: number, lng: number) => {
    setLoading(true)
    try {
      // Add retry logic for Supabase 503 errors
      const MAX_RETRIES = 3
      let retries = 0
      let spots: RealParkingSpot[] = []

      while (retries < MAX_RETRIES) {
        try {
          spots = await parkingService.getRealParkingSpots(lat, lng, 2000, {
            requireAvailability: true,
          })
          break // Success, exit retry loop
        } catch (error) {
          retries++
          console.log(`Attempt ${retries}/${MAX_RETRIES} failed. Retrying...`)
          if (retries >= MAX_RETRIES) throw error
          // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retries)))
        }
      }

      setRealSpots(spots)

      toast({
        title: "Parking data loaded",
        description: `Found ${spots.length} parking spots nearby.`,
      })
    } catch (error) {
      console.error("Error fetching real parking data:", error)
      toast({
        title: "Data loading error",
        description: "Could not load parking data. Using cached data if available.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Update parking spot markers
  useEffect(() => {
    if (!map.current || !mapInitialized || realSpots.length === 0) return

    // Import mapbox-gl dynamically to avoid the accessToken setter issue
    import("mapbox-gl")
      .then(({ default: mapboxgl }) => {
        // Clear existing markers
        const existingMarkers = document.querySelectorAll(".parking-spot-marker")
        existingMarkers.forEach((marker) => marker.remove())

        realSpots.forEach((spot) => {
          const el = document.createElement("div")
          el.className = "parking-spot-marker"

          const markerColor = getMarkerColor(spot)
          const markerIcon = getMarkerIcon(spot)

          el.innerHTML = `
          <div class="w-10 h-10 ${markerColor} rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
            ${markerIcon}
          </div>
        `

          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="p-3 max-w-sm">
            <h3 class="font-semibold text-lg mb-2">${spot.name}</h3>
            <div class="space-y-1 text-sm">
              <p class="text-gray-600">${spot.address}</p>
              <div class="flex items-center gap-2">
                <span class="px-2 py-1 bg-gray-100 rounded text-xs">${spot.spot_type}</span>
                <span class="px-2 py-1 bg-blue-100 rounded text-xs">${spot.provider}</span>
                ${spot.real_time_data ? '<span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Live</span>' : ""}
              </div>
              ${spot.price_per_hour ? `<p class="text-green-600 font-medium">$${spot.price_per_hour}/hour</p>` : '<p class="text-blue-600">Free</p>'}
              ${spot.total_spaces ? `<p class="text-gray-500">${spot.available_spaces || "?"}/${spot.total_spaces} spaces</p>` : ""}
            </div>
          </div>
        `)

          const marker = new mapboxgl.Marker(el)
            .setLngLat([spot.longitude, spot.latitude])
            .setPopup(popup)
            .addTo(map.current)

          el.addEventListener("click", () => {
            setSelectedSpot(spot)
            onSpotSelect?.(spot)
          })
        })

        onStatsUpdate?.(realSpots.length, new Set(realSpots.map((s) => s.provider)).size)
      })
      .catch((err) => {
        console.error("Error importing mapbox-gl for markers:", err)
      })
  }, [realSpots, onSpotSelect, onStatsUpdate, mapInitialized])

  const getMarkerColor = (spot: RealParkingSpot): string => {
    if (!spot.is_available) return "bg-red-500"
    if (spot.real_time_data) return "bg-green-500"
    if (spot.price_per_hour === 0) return "bg-blue-500"
    return "bg-yellow-500"
  }

  const getMarkerIcon = (spot: RealParkingSpot): string => {
    const iconClass = "w-5 h-5 text-white"
    switch (spot.spot_type) {
      case "garage":
        return `<svg class="${iconClass}" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/></svg>`
      case "meter":
        return `<svg class="${iconClass}" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1a2 2 0 002 2V4zM4 13v3a2 2 0 002 2h8a2 2 0 002-2v-3a2 2 0 002-2V9a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z"/></svg>`
      default:
        return `<svg class="${iconClass}" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>`
    }
  }

  // Add a manual click handler for testing
  const handleManualClick = () => {
    if (!latitude || !longitude) return

    const clickLocation = {
      lat: latitude,
      lng: longitude,
    }

    toast({
      title: "Manual analysis triggered",
      description: "Analyzing your current location",
    })

    analyzeAreaWithAI(clickLocation)
  }

  // Show navigation interface if navigating
  if (isNavigating) {
    return <NavigationInterface onExit={stopNavigation} />
  }

  if (mapboxError) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-6 max-w-md">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Map Unavailable</h3>
          <p className="text-gray-600 mb-4">{mapboxError}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (locationError) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-6">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Location Access Required</h3>
          <p className="text-gray-600 mb-4">Please enable location access to find nearby parking spots.</p>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Map...</h3>
          <p className="text-gray-600">Initializing map service</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full">
      <div ref={mapContainer} className="h-full w-full" />

      {/* Map Controls */}
      <div className="absolute top-4 left-4 space-y-2">
        <Card className="p-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Live Data</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Free</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Paid</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Unavailable</span>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="text-sm font-medium">{loading ? "Loading..." : `${realSpots.length} spots found`}</div>
          <div className="text-xs text-gray-500 mt-1">
            From {new Set(realSpots.map((s) => s.provider)).size} providers
            {clickedLocation && (
              <div className="text-purple-600 mt-1">
                📍 Clicked area: {clickedLocation.lat.toFixed(4)}, {clickedLocation.lng.toFixed(4)}
              </div>
            )}
          </div>
        </Card>

        {/* AI Instructions */}
        <Card className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">AI Assistant</span>
          </div>
          <p className="text-xs text-purple-700 mb-2">
            Click anywhere on the map to get AI-powered parking analysis for that area
          </p>
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            onClick={handleManualClick}
            disabled={loading || analyzingArea}
          >
            {loading || analyzingArea ? "Analyzing..." : "Analyze Current Location"}
          </Button>
        </Card>

        {/* Map Status */}
        <Card className="p-3 bg-blue-50">
          <div className="text-xs text-blue-800">
            <div className="font-medium mb-1">Map Status</div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${mapInitialized ? "bg-green-500" : "bg-yellow-500"}`}></div>
              <span>{mapInitialized ? "Ready" : "Initializing..."}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Analysis Panel */}
      {(analyzingArea || areaAnalysis) && (
        <Card className="absolute top-4 right-4 w-80 max-h-96 overflow-y-auto">
          <CardContent className="space-y-4 pt-6">
            {analyzingArea ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : areaAnalysis ? (
              <>
                {/* Area Insights */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Area Insights</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-gray-600">Avg Price</div>
                      <div className="font-medium">${areaAnalysis.areaInsights.averagePrice.toFixed(2)}/hr</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-gray-600">Demand</div>
                      <div className="font-medium capitalize">{areaAnalysis.areaInsights.demandLevel}</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-gray-600">Trend</div>
                      <div className="font-medium flex items-center gap-1">
                        {areaAnalysis.areaInsights.availabilityTrend === "increasing" && (
                          <TrendingUp className="w-3 h-3 text-green-500" />
                        )}
                        {areaAnalysis.areaInsights.availabilityTrend === "decreasing" && (
                          <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />
                        )}
                        <span className="capitalize">{areaAnalysis.areaInsights.availabilityTrend}</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-gray-600">Best Time</div>
                      <div className="font-medium">{areaAnalysis.areaInsights.bestTimeToArrive}</div>
                    </div>
                  </div>
                </div>

                {/* Best Recommendation */}
                {areaAnalysis.bestRecommendation && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm flex items-center gap-1">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      AI Recommendation
                    </h4>
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded border border-green-200">
                      <div className="font-medium text-sm">{areaAnalysis.bestRecommendation.spot.name}</div>
                      <div className="text-xs text-gray-600 mb-2">{areaAnalysis.bestRecommendation.spot.address}</div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {areaAnalysis.bestRecommendation.prediction.predictedAvailability}% available
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {areaAnalysis.bestRecommendation.prediction.confidence}% confident
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-700 mb-2">{areaAnalysis.bestRecommendation.reason}</div>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          console.log("🎯 AI Recommendation Navigate clicked")
                          startNavigationToSpot(areaAnalysis.bestRecommendation!.spot)
                        }}
                        disabled={loading}
                      >
                        <Route className="w-3 h-3 mr-1" />
                        {loading ? "Calculating..." : "Navigate Here"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Nearby Spots Summary */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Found {areaAnalysis.nearbySpots.length} spots nearby</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {areaAnalysis.nearbySpots.slice(0, 3).map((spot, index) => {
                      const prediction = areaAnalysis.aiPredictions[index]
                      return (
                        <div key={spot.id} className="text-xs bg-gray-50 p-2 rounded">
                          <div className="font-medium">{spot.name}</div>
                          <div className="flex items-center gap-2">
                            <span>${spot.price_per_hour || 0}/hr</span>
                            {prediction && (
                              <Badge variant="outline" className="text-xs">
                                {prediction.predictedAvailability}% available
                              </Badge>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Add Spot Button */}
      <Button
        className="absolute bottom-6 right-6 rounded-full w-14 h-14 shadow-lg"
        onClick={() => {
          if (latitude && longitude) {
            setReportLocation({ lat: latitude, lng: longitude })
            setShowReportDialog(true)
          }
        }}
        disabled={!latitude || !longitude}
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Refresh Button */}
      <Button
        variant="outline"
        className="absolute bottom-6 right-24 rounded-full w-14 h-14 shadow-lg"
        onClick={() => {
          if (latitude && longitude) {
            fetchRealParkingData(latitude, longitude)
          }
        }}
        disabled={!latitude || !longitude || loading}
      >
        <Navigation className="w-6 h-6" />
      </Button>

      <SpotReportDialog open={showReportDialog} onOpenChange={setShowReportDialog} location={reportLocation} />

      {/* Selected Spot Details */}
      {selectedSpot && (
        <Card className="absolute bottom-6 left-6 max-w-sm">
          <CardContent className="space-y-3 pt-6">
            <h3 className="text-lg font-bold">{selectedSpot.name}</h3>
            <p className="text-sm text-gray-600">{selectedSpot.address}</p>

            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline">{selectedSpot.spot_type}</Badge>
              <Badge variant="outline">{selectedSpot.provider}</Badge>
              {selectedSpot.real_time_data && <Badge className="bg-green-100 text-green-800">Live</Badge>}
            </div>

            {selectedSpot.price_per_hour !== undefined && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span className="font-medium">
                  {selectedSpot.price_per_hour === 0 ? "Free" : `$${selectedSpot.price_per_hour}/hour`}
                </span>
              </div>
            )}

            {selectedSpot.total_spaces && (
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4" />
                <span>
                  {selectedSpot.available_spaces || "?"}/{selectedSpot.total_spaces} spaces
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => {
                  console.log("📍 Selected Spot Navigate clicked")
                  startNavigationToSpot(selectedSpot)
                }}
                disabled={loading}
              >
                <Route className="w-4 h-4 mr-2" />
                {loading ? "Starting..." : "Navigate"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedSpot(null)}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default EnhancedParkingMap
