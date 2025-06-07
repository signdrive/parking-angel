"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useNavigationStore } from "@/lib/navigation-store"
import { NavigationService } from "@/lib/navigation-service"
import { NavigationMap } from "./navigation-map"
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
  Compass,
  Map,
  FootprintsIcon as Walking,
} from "lucide-react"

interface NavigationInterfaceProps {
  onExit: () => void
}

export function NavigationInterface({ onExit }: NavigationInterfaceProps) {
  console.log("🧭 NavigationInterface rendered")

  const {
    currentRoute,
    currentStep,
    userLocation,
    destination,
    eta,
    remainingDistance,
    remainingTime,
    isOffRoute,
    isDayMode,
    voiceEnabled,
    isRecalculating,
    gpsSignalStrength,
    lastMileWalking,
    nextStep,
    recalculateRoute,
    toggleVoice,
    setDayMode,
    confirmArrival,
    updateUserLocation,
    updateGpsSignal,
  } = useNavigationStore()

  const [showMiniMap, setShowMiniMap] = useState(false)
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

  // Auto day/night mode switching
  useEffect(() => {
    const hour = new Date().getHours()
    const shouldBeDayMode = hour >= 6 && hour < 20
    setDayMode(shouldBeDayMode)
  }, [setDayMode])

  // Location tracking
  useEffect(() => {
    navigationService.startLocationTracking(
      (location) => {
        updateUserLocation(location)

        // Check GPS signal strength based on accuracy
        if (location.latitude && location.longitude) {
          updateGpsSignal("strong")
        } else {
          updateGpsSignal("weak")
        }
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
    if (currentRoute && currentStep < currentRoute.steps.length) {
      const step = currentRoute.steps[currentStep]
      const instruction = `In ${navigationService.formatDistance(step.distance)}, ${step.instruction}`

      if (voiceEnabled) {
        navigationService.speakInstruction(instruction, voiceEnabled)
      }
    }
  }, [currentStep, currentRoute, voiceEnabled])

  // Off-route detection
  useEffect(() => {
    if (userLocation && currentRoute) {
      const offRouteDistance = navigationService.calculateOffRouteDistance(
        [userLocation.longitude, userLocation.latitude],
        currentRoute.geometry,
      )

      if (offRouteDistance > 50) {
        // 50 meters threshold
        recalculateRoute()
      }
    }
  }, [userLocation, currentRoute, recalculateRoute])

  if (!currentRoute || !destination) {
    console.log("❌ Navigation interface: Missing route or destination")
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
            onClick={toggleVoice}
            className={cn("rounded-full", isDayMode ? "hover:bg-gray-100" : "hover:bg-gray-700")}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>

          {/* Day/Night Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDayMode(!isDayMode)}
            className={cn("rounded-full", isDayMode ? "hover:bg-gray-100" : "hover:bg-gray-700")}
          >
            {isDayMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Main Navigation Content */}
      <div className="flex-1 flex flex-col">
        {/* Current Instruction */}
        <div
          className={cn("p-6 border-b", isDayMode ? "bg-blue-50 border-gray-200" : "bg-blue-900/20 border-gray-700")}
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">{navigationService.getManeuverIcon(currentStepData.maneuver)}</div>
            <div className="flex-1">
              <div className="text-lg font-medium mb-1">{currentStepData.instruction}</div>
              <div className="text-sm opacity-75">{currentStepData.streetName}</div>
              {currentStepData.speedLimit && (
                <Badge variant="outline" className="mt-2">
                  <Gauge className="w-3 h-3 mr-1" />
                  {currentStepData.speedLimit} mph
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
        {currentStepData.laneGuidance && (
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

          {/* Mini Map Toggle */}
          <Button
            variant="secondary"
            size="sm"
            className="absolute bottom-4 right-4"
            onClick={() => setShowMiniMap(!showMiniMap)}
          >
            <Map className="w-4 h-4 mr-2" />
            {showMiniMap ? "Hide" : "Show"} Overview
          </Button>

          {/* Mini Map */}
          {showMiniMap && (
            <Card className="absolute bottom-16 right-4 w-48 h-32">
              <CardContent className="p-2 h-full flex items-center justify-center">
                <div className="text-center">
                  <Compass className="w-8 h-8 mx-auto mb-1 opacity-50" />
                  <p className="text-xs opacity-75">Route Overview</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
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
    </div>
  )
}
