"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useNavigationStore } from "@/lib/navigation-store"
import { NavigationService } from "@/lib/navigation-service"
import { NavigationMap } from "./navigation-map"
import { NavigationSettings } from "./navigation-settings"
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  Phone,
  MoreHorizontal,
  Zap,
  Clock,
  Route,
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

  const isDayMode =
    settings.theme === "day" || (settings.theme === "auto" && new Date().getHours() >= 6 && new Date().getHours() < 20)

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Google Maps style header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onExit} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <div className="flex flex-col">
              <span className="font-medium text-sm truncate max-w-48">{destination.name}</span>
              <span className="text-xs text-gray-500">
                {navigationService.formatDistance(remainingDistance)} •{" "}
                {navigationService.formatDuration(remainingTime)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Voice toggle */}
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
            className="rounded-full"
          >
            {settings.voiceGuidance ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>

          {/* More options */}
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)} className="rounded-full">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Status alerts */}
      {(isOffRoute || isRecalculating || gpsSignalStrength === "lost") && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          {isRecalculating && (
            <div className="flex items-center gap-2 text-yellow-800">
              <RotateCcw className="w-4 h-4 animate-spin" />
              <span className="text-sm">Recalculating route...</span>
            </div>
          )}

          {isOffRoute && !isRecalculating && (
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">Off route - calculating new path</span>
            </div>
          )}

          {gpsSignalStrength === "lost" && (
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">GPS signal lost</span>
            </div>
          )}
        </div>
      )}

      {/* Main navigation map */}
      <div className="flex-1 relative">
        <NavigationMap mapboxToken={mapboxToken} />
      </div>

      {/* Bottom navigation info - Google Maps style */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">
                {eta ? eta.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Route className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{navigationService.formatDistance(remainingDistance)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{navigationService.formatDuration(remainingTime)}</span>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8">
              <Phone className="w-3 h-3 mr-1" />
              Call
            </Button>

            {isLastStep && remainingDistance < 50 && (
              <Button onClick={confirmArrival} size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle className="w-3 h-3 mr-1" />
                Arrived
              </Button>
            )}
          </div>
        </div>

        {/* Current instruction */}
        {nextStep && (
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{navigationService.getManeuverIcon(nextStep.maneuver)}</div>
              <div className="flex-1">
                <div className="font-medium text-sm">{nextStep.instruction}</div>
                <div className="text-xs text-gray-600">
                  in {navigationService.formatDistance(nextStep.distance)} on {nextStep.streetName}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{navigationService.formatDistance(nextStep.distance)}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Settings modal */}
      <NavigationSettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  )
}
