"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useNavigationStore } from "@/lib/navigation-store"
import { NavigationService } from "@/lib/navigation-service"
import { NavigationMap } from "./navigation-map"
import { NavigationSettings } from "./navigation-settings"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  Navigation,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  MapPin,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  Map,
  Settings,
  Eye,
  Mountain,
  Satellite,
  Zap,
  Route,
  Leaf,
  RouteIcon as Highway,
  FootprintsIcon as Walking,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface NavigationInterfaceProps {
  onExit: () => void
}

export function NavigationInterface({ onExit }: NavigationInterfaceProps) {
  const {
    currentRoute,
    currentStep,
    userLocation,
    destination,
    eta,
    remainingDistance,
    remainingTime,
    isOffRoute,
    isRecalculating,
    gpsSignalStrength,
    lastMileWalking,
    nextStep,
    settings,
    recalculateRoute,
    updateSettings,
    confirmArrival,
    updateUserLocation,
    updateGpsSignal,
  } = useNavigationStore()

  const [showSettings, setShowSettings] = useState(false)
  const [mapboxToken, setMapboxToken] = useState<string | null>(null)
  const navigationService = NavigationService.getInstance()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Add initialization effect
  useEffect(() => {
    const initializeNavigation = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Validate required data
        if (!currentRoute) {
          throw new Error("No route data available")
        }
        if (!destination) {
          throw new Error("No destination set")
        }

        // Initialize location if not available
        if (!userLocation) {
          // Try to get current location
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                updateUserLocation({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  heading: position.coords.heading || 0,
                  speed: position.coords.speed || 0,
                })
              },
              (error) => {
                console.warn("Could not get location:", error)
                // Use default location (San Francisco)
                updateUserLocation({
                  latitude: 37.7749,
                  longitude: -122.4194,
                  heading: 0,
                  speed: 0,
                })
              },
            )
          }
        }

        setIsLoading(false)
      } catch (err) {
        console.error("Navigation initialization error:", err)
        setError(err instanceof Error ? err.message : "Failed to initialize navigation")
        setIsLoading(false)
      }
    }

    initializeNavigation()
  }, [currentRoute, destination, userLocation, updateUserLocation])

  // Fetch Mapbox token
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const response = await fetch("/api/mapbox/token")
        if (response.ok) {
          const data = await response.json()
          setMapboxToken(data.token)
        }
      } catch (error) {
        console.error("Failed to fetch Mapbox token:", error)
      }
    }

    fetchMapboxToken()
  }, [])

  // Auto theme switching
  useEffect(() => {
    if (settings.theme === "auto") {
      const hour = new Date().getHours()
      const isDayTime = hour >= 6 && hour < 20
      // Auto theme logic would go here
    }
  }, [settings.theme])

  // Location tracking
  useEffect(() => {
    navigationService.startLocationTracking(
      (location) => {
        updateUserLocation(location)
        updateGpsSignal("strong")
      },
      (error) => {
        console.error("Location error:", error)
        updateGpsSignal("lost")
      },
    )

    return () => {
      navigationService.stopLocationTracking()
    }
  }, [updateUserLocation, updateGpsSignal])

  // Voice instructions
  useEffect(() => {
    if (currentRoute && currentStep < currentRoute.steps.length && settings.voiceGuidance) {
      const step = currentRoute.steps[currentStep]
      const instruction = `In ${navigationService.formatDistance(step.distance)}, ${step.instruction}`
      navigationService.speakInstruction(instruction, settings.voiceGuidance)
    }
  }, [currentStep, currentRoute, settings.voiceGuidance])

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <Navigation className="w-12 h-12 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-bold mb-2">Starting Navigation...</h2>
          <p className="text-gray-400">Initializing route and location services</p>
        </div>
      </div>
    )
  }

  // Error state with recovery options
  if (error || !currentRoute || !destination) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center max-w-md p-6">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-4">Navigation Error</h2>
          <p className="mb-6 text-gray-400">{error || "Unable to load navigation data. Please try again."}</p>
          <div className="space-y-3">
            <Button
              onClick={() => {
                setError(null)
                setIsLoading(true)
                // Retry initialization
                setTimeout(() => setIsLoading(false), 1000)
              }}
              className="w-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry Navigation
            </Button>
            <Button onClick={onExit} variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const currentStepData = currentRoute.steps[currentStep]
  const isLastStep = currentStep === currentRoute.steps.length - 1
  const progressPercentage = (currentStep / currentRoute.steps.length) * 100

  const isDayMode =
    settings.theme === "day" || (settings.theme === "auto" && new Date().getHours() >= 6 && new Date().getHours() < 20)

  const getViewModeIcon = () => {
    switch (settings.viewMode) {
      case "3d":
        return Mountain
      case "bird-eye":
        return Eye
      case "follow":
        return Navigation
      default:
        return Map
    }
  }

  const getMapStyleIcon = () => {
    switch (settings.mapStyle) {
      case "satellite":
        return Satellite
      case "terrain":
        return Mountain
      case "hybrid":
        return Eye
      case "street":
        return Map
      default:
        return Navigation
    }
  }

  const getRoutePreferenceIcon = () => {
    switch (settings.routePreference) {
      case "shortest":
        return Route
      case "eco":
        return Leaf
      case "avoid-highways":
        return Highway
      default:
        return Zap
    }
  }

  const ViewModeIcon = getViewModeIcon()
  const MapStyleIcon = getMapStyleIcon()
  const RoutePreferenceIcon = getRoutePreferenceIcon()

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col",
        isDayMode ? "bg-white text-gray-900" : "bg-gray-900 text-white",
      )}
    >
      {/* TomTom-style Header */}
      <div
        className={cn(
          "flex items-center justify-between p-3 border-b",
          isDayMode ? "bg-blue-600 border-blue-700 text-white" : "bg-blue-900 border-blue-950 text-white",
        )}
      >
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onExit} className="rounded-full text-white hover:bg-blue-700">
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-white" />
            <span className="font-medium truncate max-w-48">{destination.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* GPS Signal Indicator */}
          <div className="flex items-center gap-1">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                gpsSignalStrength === "strong"
                  ? "bg-green-400"
                  : gpsSignalStrength === "weak"
                    ? "bg-yellow-400"
                    : "bg-red-400",
              )}
            />
            <span className="text-xs text-white">GPS</span>
          </div>

          {/* Voice Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              updateSettings({ voiceGuidance: !settings.voiceGuidance })
              toast({
                title: settings.voiceGuidance ? "Voice guidance off" : "Voice guidance on",
                duration: 2000,
              })
            }}
            className="rounded-full text-white hover:bg-blue-700"
          >
            {settings.voiceGuidance ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(true)}
            className="rounded-full text-white hover:bg-blue-700"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Navigation Options Bar - TomTom style */}
      <div
        className={cn(
          "flex items-center justify-between px-2 py-1 border-b",
          isDayMode ? "bg-blue-500 border-blue-600 text-white" : "bg-blue-800 border-blue-900 text-white",
        )}
      >
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7 px-2 text-white hover:bg-blue-600"
            onClick={() => {
              const viewModes = ["3d", "bird-eye", "2d", "follow"] as const
              const currentIndex = viewModes.indexOf(settings.viewMode)
              const nextViewMode = viewModes[(currentIndex + 1) % viewModes.length]
              updateSettings({ viewMode: nextViewMode })
              toast({
                title: "View Mode Changed",
                description: `Switched to ${nextViewMode.toUpperCase()} view`,
                duration: 2000,
              })
            }}
          >
            <ViewModeIcon className="w-3 h-3 mr-1" />
            {settings.viewMode.toUpperCase()}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7 px-2 text-white hover:bg-blue-600"
            onClick={() => {
              const styles = ["navigation", "satellite", "terrain", "street", "hybrid"] as const
              const currentIndex = styles.indexOf(settings.mapStyle)
              const nextStyle = styles[(currentIndex + 1) % styles.length]
              updateSettings({ mapStyle: nextStyle })
              toast({
                title: "Map Style Changed",
                description: `Switched to ${nextStyle} view`,
                duration: 2000,
              })
            }}
          >
            <MapStyleIcon className="w-3 h-3 mr-1" />
            {settings.mapStyle}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7 px-2 text-white hover:bg-blue-600"
            onClick={() => {
              const preferences = ["fastest", "shortest", "eco", "avoid-highways"] as const
              const currentIndex = preferences.indexOf(settings.routePreference)
              const nextPreference = preferences[(currentIndex + 1) % preferences.length]
              updateSettings({ routePreference: nextPreference })
              toast({
                title: "Route Preference Changed",
                description: `Switched to ${nextPreference} route`,
                duration: 2000,
              })
            }}
          >
            <RoutePreferenceIcon className="w-3 h-3 mr-1" />
            {settings.routePreference}
          </Button>
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => updateSettings({ theme: isDayMode ? "night" : "day" })}
          className="text-xs h-7 px-2 text-white hover:bg-blue-600"
        >
          {isDayMode ? <Moon className="w-3 h-3 mr-1" /> : <Sun className="w-3 h-3 mr-1" />}
          {isDayMode ? "Night" : "Day"}
        </Button>
      </div>

      {/* Status Alerts */}
      {(isOffRoute || isRecalculating || gpsSignalStrength === "lost" || lastMileWalking) && (
        <div className="p-2">
          {isRecalculating && (
            <Card className="mb-2 bg-blue-50 border-blue-200">
              <CardContent className="p-3 flex items-center gap-3">
                <RotateCcw className="w-5 h-5 animate-spin text-blue-500" />
                <span>Recalculating route...</span>
              </CardContent>
            </Card>
          )}

          {isOffRoute && !isRecalculating && (
            <Card className="mb-2 bg-yellow-50 border-yellow-200">
              <CardContent className="p-3 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <span>Off route - calculating new path</span>
              </CardContent>
            </Card>
          )}

          {gpsSignalStrength === "lost" && (
            <Card className="mb-2 bg-red-50 border-red-200">
              <CardContent className="p-3 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span>GPS signal lost - trying to reconnect</span>
              </CardContent>
            </Card>
          )}

          {lastMileWalking && (
            <Card className="mb-2 bg-green-50 border-green-200">
              <CardContent className="p-3 flex items-center gap-3">
                <Walking className="w-5 h-5 text-green-500" />
                <span>Switch to walking directions - you're almost there!</span>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Navigation Map - Main Content */}
      <div className="flex-1 relative">
        <NavigationMap mapboxToken={mapboxToken} />
      </div>

      {/* Bottom Info Bar - TomTom style */}
      <div
        className={cn(
          "p-3 border-t",
          isDayMode ? "bg-blue-600 border-blue-700 text-white" : "bg-blue-900 border-blue-950 text-white",
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-lg font-bold">{navigationService.formatDistance(remainingDistance)}</div>
              <div className="text-xs opacity-75">Distance</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{navigationService.formatDuration(remainingTime)}</div>
              <div className="text-xs opacity-75">Time</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">
                {eta ? eta.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}
              </div>
              <div className="text-xs opacity-75">ETA</div>
            </div>
          </div>

          {/* Arrival Confirmation */}
          {isLastStep && remainingDistance < 50 && (
            <Button onClick={confirmArrival} className="bg-green-600 hover:bg-green-700 text-white">
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm Arrival
            </Button>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <NavigationSettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  )
}
