"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { useGeolocation } from "@/hooks/use-geolocation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Plus, Navigation, DollarSign, Car, Brain, Zap, TrendingUp, Route } from "lucide-react"
import { ParkingDataService, type RealParkingSpot } from "@/lib/parking-data-service"
import { AISpotPredictor, type SpotPrediction } from "@/lib/ai-spot-predictor"
import { useNavigationStore } from "@/lib/navigation-store"
import { NavigationService } from "@/lib/navigation-service"
import { NavigationInterface } from "@/components/navigation/navigation-interface"
import { SpotReportDialog } from "./spot-report-dialog"
import { toast } from "@/components/ui/use-toast"
import { NavigationErrorBoundary } from "@/components/navigation/navigation-error-boundary"

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
  const map = useRef<mapboxgl.Map | null>(null)
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

  // Add state for better error management
  const [isMapReady, setIsMapReady] = useState(false)
  const [initializationTimeout, setInitializationTimeout] = useState(false)

  const { latitude, longitude, error: locationError, requestGeolocation } = useGeolocation()
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
    async (e: mapboxgl.MapMouseEvent) => {
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

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current || !mapboxToken) return

    try {
      mapboxgl.accessToken = mapboxToken

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [-122.4194, 37.7749],
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

      // Update the map load handler
      map.current.on("load", () => {
        console.log("Map loaded successfully")
        setMapInitialized(true)
        setIsMapReady(true)
        setMapboxError(null)

        if (map.current) {
          // Add click handler
          map.current.on("click", handleMapClick)
        }
      })

      map.current.on("error", (e) => {
        console.error("Mapbox error:", e)
        setMapboxError("Map failed to load. Using fallback view.")
        setIsMapReady(true) // Still set ready to show fallback
      })
    } catch (error) {
      console.error("Failed to initialize Mapbox:", error)
      setMapboxError("Failed to initialize map.")
    }

    return () => {
      if (map.current) {
        // Clean up event listeners
        map.current.off("click", handleMapClick)
        map.current.remove()
        map.current = null
      }
    }
  }, [mapboxToken, handleMapClick])

  // Add timeout for map initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isMapReady) {
        console.warn("Map initialization timeout, showing fallback")
        setInitializationTimeout(true)
      }
    }, 10000) // 10 second timeout

    return () => clearTimeout(timer)
  }, [isMapReady])

  // Update map center when user location is available
  useEffect(() => {
    if (map.current && latitude && longitude) {
      map.current.setCenter([longitude, latitude])

      new mapboxgl.Marker({ color: "#3B82F6" })
        .setLngLat([longitude, latitude])
        .setPopup(new mapboxgl.Popup().setHTML("<p>Your Location</p>"))
        .addTo(map.current)

      // Fetch real parking data for this location
      fetchRealParkingData(latitude, longitude)
    }
  }, [latitude, longitude])

  const startNavigationToSpot = async (spot: RealParkingSpot) => {
    if (!latitude || !longitude) {
      console.error("❌ Location not available:", { latitude, longitude })
      toast({
        title: "Location unavailable",
        description: "Please enable location services to use navigation.",
        variant: "destructive",
      })
      return
    }

    // Validate spot coordinates
    if (!spot.latitude || !spot.longitude || isNaN(spot.latitude) || isNaN(spot.longitude)) {
      console.error("❌ Invalid spot coordinates:", { 
        lat: spot.latitude, 
        lng: spot.longitude,
        spot: spot 
      })
      toast({
        title: "Invalid destination",
        description: "This parking spot has invalid coordinates.",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("🚗 Starting navigation to spot:", {
        spotName: spot.name,
        spotCoords: [spot.longitude, spot.latitude],
        userCoords: [longitude, latitude]
      })
      console.log("📍 Navigation state before:", { 
        isNavigating, 
        currentRoute: !!useNavigationStore.getState().currentRoute 
      })
      setLoading(true)

      toast({
        title: "Calculating route...",
        description: `Finding the best route to ${spot.name}`,
      })

      console.log("🗺️ About to call calculateRoute with:", {
        from: [longitude, latitude],
        to: [spot.longitude, spot.latitude],
        options: { avoidTraffic: true, routeType: "fastest" }
      })

      // Calculate route to the parking spot
      let route
      try {
        route = await navigationService.calculateRoute([longitude, latitude], [spot.longitude, spot.latitude], {
          avoidTraffic: true,
          routeType: "fastest",
        })
        console.log("📍 Route calculated successfully:", {
          distance: route.distance,
          duration: route.duration,
          steps: route.steps.length,
          routeId: route.id
        })
      } catch (routeError) {
        console.error("❌ Route calculation failed:", routeError)
        throw new Error(`Failed to calculate route: ${routeError instanceof Error ? routeError.message : 'Unknown error'}`)
      }

      // Start navigation
      console.log("🚀 About to call startNavigation with:", {
        destination: {
          latitude: spot.latitude,
          longitude: spot.longitude,
          name: spot.name,
          spotId: spot.id.toString(),
        },
        routeDistance: route.distance
      })

      startNavigation(
        {
          latitude: spot.latitude,
          longitude: spot.longitude,
          name: spot.name,
          spotId: spot.id.toString(),
        },
        route,
      )

      console.log("✅ startNavigation called, checking state...")
      console.log("📍 Navigation state after:", { 
        isNavigating: useNavigationStore.getState().isNavigating,
        currentRoute: !!useNavigationStore.getState().currentRoute,
        destination: useNavigationStore.getState().destination?.name
      })

      console.log("✅ Navigation started successfully!")
      try {
        const distanceText = navigationService.formatDistance(route.distance)
        toast({
          title: "Navigation started",
          description: `Navigating to ${spot.name} - ${distanceText} away`,
        })
      } catch (formatError) {
        console.warn("⚠️ Distance formatting failed:", formatError)
        toast({
          title: "Navigation started",
          description: `Navigating to ${spot.name}`,
        })
      }
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
      if (map.current) {
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
      const distanceScore = Math.max(0, 100 - calculateDistance(clickLocation, { lat: spot.latitude, lng: spot.longitude }) * 10) // Closer = better

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
    const dLat = ((point2.lat - point1.lat) * Math.PI) / 180
    const dLng = ((point2.lng - point1.lng) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((point1.lat * Math.PI) / 180) *
        Math.cos((point2.lat * Math.PI) / 180) *
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
    const distance = Math.round(calculateDistance(clickLocation, { lat: spot.latitude, lng: spot.longitude }))
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
      const spots = await parkingService.getRealParkingSpots(lat, lng, 2000, {
        requireAvailability: true,
      })
      setRealSpots(spots)

      toast({
        title: "Parking data loaded",
        description: `Found ${spots.length} parking spots nearby.`,
      })
    } catch (error) {
      console.error("Error fetching real parking data:", error)
      toast({
        title: "Data loading error",
        description: "Could not load parking data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Update parking spot markers
  useEffect(() => {
    if (!map.current) return

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
        .addTo(map.current!)

      el.addEventListener("click", () => {
        setSelectedSpot(spot)
        onSpotSelect?.(spot)
      })
    })

    onStatsUpdate?.(realSpots.length, new Set(realSpots.map((s) => s.provider)).size)
  }, [realSpots, onSpotSelect, onStatsUpdate])

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

  // Helper function to normalize spot data for navigation
  const normalizeSpotForNavigation = (spot: any): RealParkingSpot | null => {
    console.log("🔧 Normalizing spot for navigation:", spot)
    
    if (!spot) {
      console.error("❌ No spot provided to normalize")
      return null
    }
    
    // Try to extract coordinates from various possible structures
    const lat = spot.latitude || spot.lat || spot.coordinates?.lat || spot.geometry?.coordinates?.[1]
    const lng = spot.longitude || spot.lng || spot.coordinates?.lng || spot.geometry?.coordinates?.[0]
    const name = spot.name || spot.title || spot.address || `Parking Area (${lat?.toFixed(4)}, ${lng?.toFixed(4)})`
    const id = spot.id || `spot_${lat}_${lng}`
    
    console.log("🔧 Extracted coordinates:", { lat, lng, name, id })
    
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      console.error("❌ Cannot extract valid coordinates from spot:", { 
        spot, 
        extractedLat: lat, 
        extractedLng: lng,
        latValid: !isNaN(lat),
        lngValid: !isNaN(lng)
      })
      return null
    }
    
    const normalized = {
      id: id.toString(),
      name,
      latitude: lat,
      longitude: lng,
      address: spot.address || "",
      spot_type: spot.spot_type || spot.type || "street",
      price_per_hour: spot.price_per_hour,
      max_duration_hours: spot.max_duration_hours,
      is_available: spot.is_available !== false, // Default to true if not specified
      total_spaces: spot.total_spaces,
      available_spaces: spot.available_spaces,
      restrictions: spot.restrictions || [],
      payment_methods: spot.payment_methods || [],
      accessibility: spot.accessibility || false,
      covered: spot.covered || false,
      security: spot.security || false,
      ev_charging: spot.ev_charging || false,
      provider: spot.provider || "Unknown",
      provider_id: spot.provider_id || spot.id?.toString() || "",
      real_time_data: spot.real_time_data || false,
      last_updated: spot.last_updated || new Date(),
      distance: spot.distance,
      opening_hours: spot.opening_hours,
      contact_info: spot.contact_info
    }
    
    console.log("✅ Spot normalized successfully:", normalized)
    return normalized
  }

  // Add a manual click handler for testing
  const handleManualClick = () => {
    if (!map.current || !latitude || !longitude) return

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

  // Add fallback map component
  const FallbackMapView = () => (
    <div className="h-full bg-gradient-to-b from-blue-100 to-green-100 relative overflow-hidden">
      {/* Simple map-like background */}
      <div className="absolute inset-0">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={`h-${i}`} className="absolute w-full h-px bg-gray-400" style={{ top: `${i * 5}%` }} />
          ))}
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={`v-${i}`} className="absolute h-full w-px bg-gray-400" style={{ left: `${i * 5}%` }} />
          ))}
        </div>

        {/* Mock streets */}
        <div className="absolute top-1/2 left-0 right-0 h-8 bg-gray-300 transform -translate-y-1/2" />
        <div className="absolute top-0 bottom-0 left-1/2 w-8 bg-gray-300 transform -translate-x-1/2" />

        {/* User location indicator */}
        {latitude && longitude && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
          </div>
        )}

        {/* Mock parking spots */}
        {realSpots.slice(0, 5).map((spot, index) => (
          <div
            key={spot.id}
            className="absolute w-4 h-4 bg-green-500 rounded-full border border-white shadow cursor-pointer hover:scale-110 transition-transform"
            style={{
              top: `${30 + index * 10}%`,
              left: `${20 + index * 15}%`,
            }}
            onClick={() => {
              setSelectedSpot(spot)
              onSpotSelect?.(spot)
            }}
          />
        ))}
      </div>

      {/* Fallback message */}
      <div className="absolute top-4 left-4 bg-white/90 p-3 rounded-lg shadow">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-blue-500" />
          <span>Simplified Map View</span>
        </div>
        <p className="text-xs text-gray-600 mt-1">Interactive map unavailable</p>
      </div>
    </div>
  )

  // Debug navigation state changes
  useEffect(() => {
    console.log("🧭 Navigation state changed:", { 
      isNavigating, 
      timestamp: new Date().toISOString(),
      currentRoute: !!useNavigationStore.getState().currentRoute,
      destination: useNavigationStore.getState().destination?.name 
    })
  }, [isNavigating])

  // Add direct state logging for debugging
  useEffect(() => {
    const interval = setInterval(() => {
      const state = useNavigationStore.getState()
      console.log("🔄 Navigation state check:", {
        isNavigating: state.isNavigating,
        hasRoute: !!state.currentRoute,
        destination: state.destination?.name,
        timestamp: new Date().toISOString()
      })
    }, 5000) // Log every 5 seconds

    return () => clearInterval(interval)
  }, [])

  // Debug test function to directly toggle navigation
  const testNavigationToggle = () => {
    console.log("🧪 Testing navigation toggle - current state:", { isNavigating })
    
    if (!isNavigating) {
      // Create a simple test route
      const testRoute = {
        id: "test_route",
        distance: 1000,
        duration: 300,
        trafficDelays: 0,
        geometry: [[longitude || 0, latitude || 0], [longitude! + 0.01, latitude! + 0.01]] as [number, number][],
        steps: [{
          id: "test_step",
          instruction: "Drive straight",
          distance: 1000,
          duration: 300,
          maneuver: { type: "straight" as const },
          streetName: "Test Street",
          coordinates: [longitude! + 0.01, latitude! + 0.01] as [number, number]
        }]
      }
      
      const testDestination = {
        latitude: latitude! + 0.01,
        longitude: longitude! + 0.01,
        name: "Test Destination",
        spotId: "test_spot"
      }
      
      console.log("🧪 Starting test navigation")
      startNavigation(testDestination, testRoute)
    } else {
      console.log("🧪 Stopping test navigation")
      stopNavigation()
    }
  }

  // Auto-fix map when returning from navigation
  useEffect(() => {
    // Only run this when we have a map and we're no longer navigating
    if (!isNavigating && map.current && isMapReady) {
      console.log("🔄 Detected return from navigation, refreshing map...")
      
      // Small delay to ensure navigation interface has fully unmounted
      const timer = setTimeout(() => {
        try {
          if (map.current) {
            // Force map to resize and refresh
            map.current.resize()
            
            // Trigger a repaint
            map.current.triggerRepaint()
            
            // Re-center if we have location
            if (latitude && longitude) {
              map.current.flyTo({ 
                center: [longitude, latitude], 
                zoom: 15, 
                essential: true 
              })
            }
            
            console.log("✅ Map refreshed after navigation")
          }
        } catch (error) {
          console.error("❌ Auto-refresh failed:", error)
        }
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [isNavigating, isMapReady, latitude, longitude])

  // Show navigation interface if navigating
  if (isNavigating) {
    console.log("🗺️ Rendering NavigationInterface - isNavigating:", isNavigating)
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

  if (!mapboxToken) {
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
    <NavigationErrorBoundary
      onReset={() => {
        setMapboxError(null)
        setInitializationTimeout(false)
        setIsMapReady(false)
        // Reinitialize map
        if (mapContainer.current && mapboxToken) {
          // Trigger map reinitialization
          window.location.reload()
        }
      }}
      onExit={() => {
        // Could add a callback prop for this
        console.log("User requested to exit from error state")
      }}
    >
      <div className="relative h-full">
        {/* Main map container */}
        {!mapboxError && !initializationTimeout ? (
          <div ref={mapContainer} className="h-full w-full" />
        ) : (
          <FallbackMapView />
        )}

        {/* Loading overlay */}
        {!isMapReady && !mapboxError && !initializationTimeout && (
          <div className="absolute inset-0 flex items-center justify-center z-50">
            <div className="backdrop-blur-lg bg-white/60 border border-blue-100 rounded-2xl shadow-2xl p-8 max-w-xs mx-auto flex flex-col items-center animate-fade-in">
              <MapPin className="w-14 h-14 mb-5 text-blue-500 animate-pulse drop-shadow-lg" />
              <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">Loading Map...</h3>
              <p className="text-gray-700 text-base">Initializing map service</p>
            </div>
          </div>
        )}

        {/* Geolocate Button (custom, bottom left) */}
        <Button
          className="absolute bottom-6 left-6 rounded-xl w-14 h-14 shadow-xl border-2 border-blue-200 bg-white/90 text-blue-600 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 focus:ring-4 focus:ring-blue-200 z-40"
          onClick={() => {
            if (latitude && longitude && map.current) {
              // If we have location, center the map
              map.current.flyTo({ center: [longitude, latitude], zoom: 16, essential: true })
            } else {
              // If we don't have location, request it
              console.log("📍 Requesting geolocation permission")
              requestGeolocation()
              toast({
                title: "Requesting location",
                description: "Please allow location access to find nearby parking spots",
              })
            }
          }}
          aria-label={latitude && longitude ? "Go to my location" : "Get my location"}
        >
          {/* Target/Geolocate icon (SVG or Lucide icon) */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-crosshair w-7 h-7"><circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/></svg>
        </Button>

        {/* Add Spot Button */}
        <Button
          className="absolute bottom-6 right-6 rounded-full w-16 h-16 shadow-2xl border-2 border-white bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 focus:ring-4 focus:ring-blue-300 z-40"
          onClick={() => {
            if (latitude && longitude) {
              setReportLocation({ lat: latitude, lng: longitude })
              setShowReportDialog(true)
            }
          }}
          disabled={!latitude || !longitude}
        >
          <Plus className="w-7 h-7" />
        </Button>

        {/* Refresh/Reload Map Button */}
        <Button
          variant="outline"
          className="absolute bottom-6 right-24 rounded-full w-14 h-14 shadow-xl border-2 border-green-200 bg-white/80 text-green-600 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 focus:ring-4 focus:ring-green-200 z-40"
          onClick={() => {
            console.log("🔄 Refresh button clicked")
            
            toast({
              title: "Refreshing map...",
              description: "Reloading map and parking data",
            })
            
            // Force complete map recreation
            try {
              // Step 1: Clean up existing map
              if (map.current) {
                console.log("🗑️ Cleaning up existing map")
                map.current.remove()
                map.current = null
              }
              
              // Step 2: Reset states
              setIsMapReady(false)
              setMapInitialized(false)
              setRealSpots([])
              setSelectedSpot(null)
              
              // Step 3: Recreate map after a short delay
              setTimeout(() => {
                if (mapContainer.current && mapboxToken) {
                  console.log("🆕 Recreating map")
                  
                  try {
                    mapboxgl.accessToken = mapboxToken

                    map.current = new mapboxgl.Map({
                      container: mapContainer.current,
                      style: "mapbox://styles/mapbox/streets-v12",
                      center: latitude && longitude ? [longitude, latitude] : [-122.4194, 37.7749],
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

                    map.current.on("load", () => {
                      console.log("✅ Map recreated successfully")
                      setMapInitialized(true)
                      setIsMapReady(true)
                      
                      if (map.current) {
                        map.current.on("click", handleMapClick)
                      }
                      
                      // Add user location marker if available
                      if (latitude && longitude) {
                        new mapboxgl.Marker({ color: "#3B82F6" })
                          .setLngLat([longitude, latitude])
                          .setPopup(new mapboxgl.Popup().setHTML("<p>Your Location</p>"))
                          .addTo(map.current!)
                        
                        // Fetch parking data
                        fetchRealParkingData(latitude, longitude)
                      }
                      
                      toast({
                        title: "Map refreshed",
                        description: "Map has been successfully recreated",
                      })
                    })

                    map.current.on("error", (e) => {
                      console.error("Map recreation error:", e)
                      toast({
                        title: "Map recreation failed",
                        description: "Reloading page...",
                        variant: "destructive"
                      })
                      setTimeout(() => window.location.reload(), 2000)
                    })
                    
                  } catch (error) {
                    console.error("Failed to recreate map:", error)
                    toast({
                      title: "Map creation failed", 
                      description: "Reloading page to fix issues...",
                      variant: "destructive"
                    })
                    setTimeout(() => window.location.reload(), 2000)
                  }
                } else {
                  console.error("Missing map container or token")
                  window.location.reload()
                }
              }, 100)
              
            } catch (error) {
              console.error("Refresh failed:", error)
              toast({
                title: "Refresh failed", 
                description: "Reloading page...",
                variant: "destructive"
              })
              setTimeout(() => window.location.reload(), 2000)
            }
          }}
          disabled={loading}
          title="Refresh map and reload parking data"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </Button>

        <SpotReportDialog open={showReportDialog} onOpenChange={setShowReportDialog} location={reportLocation} />

        {/* Selected Spot Details */}
        {selectedSpot && (
          <Card className="absolute bottom-6 left-6 max-w-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{selectedSpot.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
                    console.log("📍 Selected Spot Navigate clicked", selectedSpot)
                    if (!selectedSpot) {
                      console.error("❌ No selected spot available")
                      toast({
                        title: "No spot selected",
                        description: "Please select a parking spot first",
                        variant: "destructive"
                      })
                      return
                    }
                    
                    if (!latitude || !longitude) {
                      console.error("❌ No user location available", { latitude, longitude, locationError })
                      toast({
                        title: "Location required",
                        description: locationError 
                          ? `Location error: ${locationError}. Please enable location services.`
                          : "Please enable location services to use navigation.",
                        variant: "destructive"
                      })
                      return
                    }
                    
                    // Normalize the spot data
                    const normalizedSpot = normalizeSpotForNavigation(selectedSpot)
                    if (!normalizedSpot) {
                      console.error("❌ Invalid spot data:", selectedSpot)
                      toast({
                        title: "Invalid parking spot",
                        description: "This parking spot data is incomplete",
                        variant: "destructive"
                      })
                      return
                    }
                    
                    console.log("🚗 Calling startNavigationToSpot with:", {
                      originalSpot: selectedSpot,
                      normalizedSpot: normalizedSpot,
                      userLocation: { latitude, longitude }
                    })
                    
                    startNavigationToSpot(normalizedSpot).catch(error => {
                      console.error("❌ Navigation failed:", error)
                      toast({
                        title: "Navigation error",
                        description: error.message || "Failed to start navigation",
                        variant: "destructive"
                      })
                    })
                  }}
                  disabled={loading || !selectedSpot}
                >
                  <Route className="w-4 h-4 mr-2" />
                  {loading ? "Starting..." : "Navigate"}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={testNavigationToggle}
                  className="text-xs"
                >
                  🧪 Test Nav
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedSpot(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </NavigationErrorBoundary>
  )
}

export default EnhancedParkingMap