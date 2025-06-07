"use client"

import { useEffect, useState } from "react"
import { useNavigationStore } from "@/lib/navigation-store"
import { NavigationService } from "@/lib/navigation-service"
import { NavigationMap } from "./navigation-map"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  RotateCcw,
  Volume2,
  VolumeX,
  Settings,
  MapPin,
  Clock,
  Navigation,
  Zap,
} from "lucide-react"

interface NavigationInterfaceProps {
  onExit: () => void
}

export function NavigationInterface({ onExit }: NavigationInterfaceProps) {
  const [mapboxToken, setMapboxToken] = useState<string | null>(null)
  const [tokenError, setTokenError] = useState(false)

  const {
    currentRoute,
    currentStep,
    userLocation,
    destination,
    eta,
    remainingDistance,
    remainingTime,
    isRecalculating,
    gpsSignalStrength,
    settings,
    nextStepAction,
    updateSettings,
  } = useNavigationStore()

  const navigationService = NavigationService.getInstance()

  // Fetch Mapbox token for navigation
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        console.log("🗺️ Fetching Mapbox token for navigation...")
        const response = await fetch("/api/mapbox/token")
        if (response.ok) {
          const data = await response.json()
          console.log("✅ Mapbox token received for navigation")
          setMapboxToken(data.token)
          setTokenError(false)
        } else {
          console.error("❌ Failed to fetch Mapbox token:", response.status)
          setTokenError(true)
        }
      } catch (error) {
        console.error("❌ Error fetching Mapbox token:", error)
        setTokenError(true)
      }
    }

    fetchMapboxToken()
  }, [])

  // Voice guidance
  useEffect(() => {
    if (currentRoute && currentRoute.steps[currentStep + 1] && settings.voiceGuidance) {
      const nextStep = currentRoute.steps[currentStep + 1]
      navigationService.speakInstruction(nextStep.instruction, settings.voiceGuidance)
    }
  }, [currentStep, settings.voiceGuidance])

  if (!currentRoute || !destination) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Navigation className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Navigation</h3>
          <p className="text-gray-600 mb-4">Please start navigation to a destination.</p>
          <Button onClick={onExit}>Return to Map</Button>
        </div>
      </div>
    )
  }

  const currentStepData = currentRoute.steps[currentStep]
  const nextStepData = currentRoute.steps[currentStep + 1]

  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Navigation Header */}
      <div className="bg-black text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onExit} className="text-white hover:bg-gray-800">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-semibold text-lg">{destination.name}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {navigationService.formatDistance(remainingDistance)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {navigationService.formatDuration(remainingTime)}
              </span>
              {eta && <span>ETA: {eta.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* GPS Signal Indicator */}
          <div className="flex items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full ${
                gpsSignalStrength === "strong"
                  ? "bg-green-500"
                  : gpsSignalStrength === "weak"
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
            />
            <span className="text-xs text-gray-300 capitalize">{gpsSignalStrength} GPS</span>
          </div>

          {/* Voice Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateSettings({ voiceGuidance: !settings.voiceGuidance })}
            className="text-white hover:bg-gray-800"
          >
            {settings.voiceGuidance ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Navigation Map */}
      <div className="flex-1 relative">
        {tokenError ? (
          <div className="h-full flex items-center justify-center bg-gray-900 text-white">
            <div className="text-center">
              <Navigation className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Map Service Unavailable</h3>
              <p className="text-gray-400 mb-4">Unable to load navigation map</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <NavigationMap mapboxToken={mapboxToken} />
        )}

        {/* Recalculating Overlay */}
        {isRecalculating && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-lg z-20">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span className="font-medium">Recalculating route...</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Panel */}
      <div className="bg-white border-t border-gray-200">
        {/* Next Instruction */}
        {nextStepData && (
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white">
                {nextStepData.maneuver.type === "turn-left" && <ArrowLeft className="w-6 h-6" />}
                {nextStepData.maneuver.type === "turn-right" && <ArrowRight className="w-6 h-6" />}
                {nextStepData.maneuver.type === "straight" && <ArrowUp className="w-6 h-6" />}
                {nextStepData.maneuver.type === "roundabout" && <RotateCcw className="w-6 h-6" />}
                {nextStepData.maneuver.type === "arrive" && <MapPin className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-lg text-gray-900">{nextStepData.instruction}</div>
                <div className="text-gray-600">in {navigationService.formatDistance(nextStepData.distance)}</div>
                {nextStepData.streetName && <div className="text-sm text-gray-500">on {nextStepData.streetName}</div>}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {navigationService.formatDistance(nextStepData.distance)}
                </div>
                {nextStepData.speedLimit && (
                  <div className="text-sm text-gray-500">{nextStepData.speedLimit} mph limit</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Current Status */}
        <div className="p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <div className="font-medium">Current: {currentStepData.streetName}</div>
                <div>
                  Step {currentStep + 1} of {currentRoute.steps.length}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Traffic Info */}
              {currentRoute.trafficDelays > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />+{navigationService.formatDuration(currentRoute.trafficDelays)} traffic
                </Badge>
              )}

              {/* Next Step Button */}
              <Button onClick={nextStepAction} size="sm" variant="outline">
                Next Step
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
