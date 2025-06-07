"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
  Gauge,
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

  if (!currentRoute || !destination) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Navigation Error</h2>
          <p className="mb-4">Unable to load navigation data</p>
          <Button onClick={onExit}>Go Back</Button>
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
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between p-4 border-b",
          isDayMode ? "bg-white border-gray-200" : "bg-gray-800 border-gray-700",
        )}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onExit}
            className={cn("rounded-full", isDayMode ? "hover:bg-gray-100" : "hover:bg-gray-700")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            <span className="font-medium truncate max-w-48">{destination.name}</span>
          </div>

          {/* Active Settings Indicators */}
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs">
              <ViewModeIcon className="w-3 h-3 mr-1" />
              {settings.viewMode.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <MapStyleIcon className="w-3 h-3 mr-1" />
              {settings.mapStyle}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <RoutePreferenceIcon className="w-3 h-3 mr-1" />
              {settings.routePreference}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* GPS Signal Indicator */}
          <div className="flex items-center gap-1">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                gpsSignalStrength === "strong"
                  ? "bg-green-500"
                  : gpsSignalStrength === "weak"
                    ? "bg-yellow-500"
                    : "bg-red-500",
              )}
            />
            <span className="text-xs">GPS</span>
          </div>

          {/* Voice Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => updateSettings({ voiceGuidance: !settings.voiceGuidance })}
            className={cn("rounded-full", isDayMode ? "hover:bg-gray-100" : "hover:bg-gray-700")}
          >
            {settings.voiceGuidance ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => updateSettings({ theme: isDayMode ? "night" : "day" })}
            className={cn("rounded-full", isDayMode ? "hover:bg-gray-100" : "hover:bg-gray-700")}
          >
            {isDayMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(true)}
            className={cn("rounded-full", isDayMode ? "hover:bg-gray-100" : "hover:bg-gray-700")}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Current Instruction */}
      <div className={cn("p-6 border-b", isDayMode ? "bg-blue-50 border-gray-200" : "bg-blue-900/20 border-gray-700")}>
        <div className="flex items-center gap-4">
          <div className="text-4xl">{navigationService.getManeuverIcon(currentStepData.maneuver)}</div>
          <div className="flex-1">
            <div className="text-lg font-medium mb-1">{currentStepData.instruction}</div>
            <div className="text-sm opacity-75">{currentStepData.streetName}</div>
            {settings.showSpeedLimits && currentStepData.speedLimit && (
              <Badge variant="outline" className="mt-2">
                <Gauge className="w-3 h-3 mr-1" />
                {currentStepData.speedLimit} {settings.units === "metric" ? "km/h" : "mph"}
              </Badge>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{navigationService.formatDistance(currentStepData.distance)}</div>
            <div className="text-sm opacity-75">{navigationService.formatDuration(currentStepData.duration)}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={progressPercentage} className="mt-4" />
      </div>

      {/* Lane Guidance */}
      {settings.showLaneGuidance && currentStepData.laneGuidance && (
        <div className={cn("p-4 border-b", isDayMode ? "bg-gray-50 border-gray-200" : "bg-gray-800 border-gray-700")}>
          <div className="flex justify-center gap-2">
            {currentStepData.laneGuidance.lanes.map((lane, index) => (
              <div
                key={index}
                className={cn(
                  "w-8 h-12 border-2 rounded flex items-end justify-center pb-1",
                  lane.valid
                    ? "border-green-500 bg-green-100 text-green-700"
                    : "border-gray-300 bg-gray-100 text-gray-400",
                )}
              >
                ↑
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Alerts */}
      {(isOffRoute || isRecalculating || gpsSignalStrength === "lost" || lastMileWalking) && (
        <div className="p-4">
          {isRecalculating && (
            <Card className="mb-2">
              <CardContent className="p-3 flex items-center gap-3">
                <RotateCcw className="w-5 h-5 animate-spin text-blue-500" />
                <span>Recalculating route...</span>
              </CardContent>
            </Card>
          )}

          {isOffRoute && !isRecalculating && (
            <Card className="mb-2">
              <CardContent className="p-3 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <span>Off route - calculating new path</span>
              </CardContent>
            </Card>
          )}

          {gpsSignalStrength === "lost" && (
            <Card className="mb-2">
              <CardContent className="p-3 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span>GPS signal lost - trying to reconnect</span>
              </CardContent>
            </Card>
          )}

          {lastMileWalking && (
            <Card className="mb-2">
              <CardContent className="p-3 flex items-center gap-3">
                <Walking className="w-5 h-5 text-green-500" />
                <span>Switch to walking directions - you're almost there!</span>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Navigation Map */}
      <div className="flex-1 relative">
        {mapboxToken ? (
          <NavigationMap mapboxToken={mapboxToken} />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-200">
            <div className="text-center">
              <Navigation className="w-12 h-12 mx-auto mb-2 opacity-50 animate-pulse" />
              <p className="text-sm opacity-75">Loading Navigation Map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Info Bar */}
      <div className={cn("p-4 border-t", isDayMode ? "bg-white border-gray-200" : "bg-gray-800 border-gray-700")}>
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
