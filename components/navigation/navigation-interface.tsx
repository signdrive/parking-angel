"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navigation, X, MapPin, ArrowUp, ArrowRight, ArrowLeft, RotateCcw, AlertTriangle, Loader2 } from "lucide-react"
import { useNavigationStore } from "@/lib/navigation-store"
import { NavigationService } from "@/lib/navigation-service"
import { cn } from "@/lib/utils"

interface NavigationInterfaceProps {
  onExit: () => void
}

export function NavigationInterface({ onExit }: NavigationInterfaceProps) {
  const {
    destination,
    currentRoute,
    currentStep,
    isNavigating,
    stopNavigation,
    nextStepAction,
    previousStep: prevStep,
    settings,
  } = useNavigationStore()

  const [elapsedTime, setElapsedTime] = useState(0)
  const [currentSpeed, setCurrentSpeed] = useState(35)
  const [speedLimit, setSpeedLimit] = useState(40)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigationService = NavigationService.getInstance()

  // Debug logging
  useEffect(() => {
    console.log("NavigationInterface mounted with state:", {
      isNavigating,
      destination,
      currentRoute,
      currentStep,
    })
  }, [isNavigating, destination, currentRoute, currentStep])

  // Check navigation state and handle errors
  useEffect(() => {
    setIsLoading(true)

    if (!isNavigating) {
      console.log("Navigation interface: Not navigating, exiting...")
      onExit()
      return
    }

    if (!destination) {
      console.error("Navigation interface: No destination found")
      setError("No destination specified")
      return
    }

    if (!currentRoute) {
      console.error("Navigation interface: No route found")
      setError("No route calculated")
      return
    }

    // All good, stop loading
    setIsLoading(false)
    setError(null)
  }, [isNavigating, destination, currentRoute, onExit])

  useEffect(() => {
    if (!isNavigating || isLoading || error) return

    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
      // Simulate speed changes
      setCurrentSpeed(30 + Math.random() * 20)
    }, 1000)

    return () => clearInterval(timer)
  }, [isNavigating, isLoading, error])

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-full bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-semibold mb-2">Starting Navigation</h3>
          <p className="text-gray-300">Preparing your route...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="h-full bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center p-6">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Navigation Error</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <Button
            onClick={onExit}
            variant="outline"
            className="text-white border-white hover:bg-white hover:text-gray-900"
          >
            Return to Map
          </Button>
        </div>
      </div>
    )
  }

  // Don't render if missing required data
  if (!isNavigating || !destination || !currentRoute) {
    console.log("NavigationInterface: Missing required data, calling onExit")
    onExit()
    return null
  }

  const currentInstruction = currentRoute.instructions?.[currentStep] || "Continue straight"
  const remainingDistance = Math.round(
    currentRoute.distance * (1 - currentStep / (currentRoute.instructions?.length || 1)),
  )
  const remainingTime = Math.round(currentRoute.duration * (1 - currentStep / (currentRoute.instructions?.length || 1)))

  // Get next maneuver type for visualization
  const getNextManeuver = () => {
    const maneuvers = ["straight", "turn-left", "turn-right", "roundabout"]
    return maneuvers[currentStep % maneuvers.length]
  }

  const nextManeuver = getNextManeuver()
  const distanceToNextTurn = Math.max(50, 500 - currentStep * 80)

  // Simplified TomTom-style Road View for better compatibility
  const TomTomRoadView = () => {
    const isDayMode =
      settings?.theme === "day" ||
      (settings?.theme === "auto" && new Date().getHours() >= 6 && new Date().getHours() < 20)

    return (
      <div
        className={cn(
          "relative h-full overflow-hidden",
          isDayMode ? "bg-gradient-to-b from-blue-200 to-gray-100" : "bg-gradient-to-b from-gray-900 to-gray-800",
        )}
      >
        {/* Sky */}
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-1/3",
            isDayMode ? "bg-gradient-to-b from-blue-300 to-blue-100" : "bg-gradient-to-b from-gray-900 to-gray-700",
          )}
        />

        {/* Road */}
        <div className="absolute top-1/3 left-0 right-0 bottom-0 flex justify-center">
          <div
            className={cn("relative w-full max-w-lg h-full", isDayMode ? "bg-gray-400" : "bg-gray-600")}
            style={{ clipPath: "polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)" }}
          >
            {/* Road Surface */}
            <div className={cn("absolute inset-1", isDayMode ? "bg-gray-300" : "bg-gray-500")}>
              {/* Center Line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-yellow-400 transform -translate-x-1/2">
                <div className="h-full animate-pulse opacity-80" />
              </div>
            </div>
          </div>
        </div>

        {/* Current Position */}
        <div className="absolute left-1/2 bottom-[20%] transform -translate-x-1/2 z-20">
          <div className="w-8 h-8 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
            <ArrowUp className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    )
  }

  // Get large directional arrow
  const getLargeDirectionArrow = () => {
    switch (nextManeuver) {
      case "turn-left":
        return (
          <div className="flex items-center justify-center w-24 h-24 bg-yellow-500 rounded-full shadow-lg">
            <ArrowLeft className="w-12 h-12 text-white" />
          </div>
        )
      case "turn-right":
        return (
          <div className="flex items-center justify-center w-24 h-24 bg-yellow-500 rounded-full shadow-lg">
            <ArrowRight className="w-12 h-12 text-white" />
          </div>
        )
      case "roundabout":
        return (
          <div className="flex items-center justify-center w-24 h-24 bg-yellow-500 rounded-full shadow-lg">
            <RotateCcw className="w-12 h-12 text-white" />
          </div>
        )
      default:
        return (
          <div className="flex items-center justify-center w-24 h-24 bg-green-500 rounded-full shadow-lg">
            <ArrowUp className="w-12 h-12 text-white" />
          </div>
        )
    }
  }

  return (
    <div className="h-full bg-gray-900 text-white relative overflow-hidden">
      {/* Road View Background */}
      <div className="absolute inset-0">
        <TomTomRoadView />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Navigation className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="font-bold text-lg">{destination.name}</h2>
              <p className="text-sm text-gray-300">{destination.spotId}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              stopNavigation()
              onExit()
            }}
            className="text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Large Direction Arrow */}
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 z-30">{getLargeDirectionArrow()}</div>

      {/* Distance Display */}
      <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 z-30 text-center">
        <div className="bg-black/70 text-white px-8 py-4 rounded-xl shadow-lg">
          <div className="text-4xl font-bold">{distanceToNextTurn}m</div>
          <div className="text-sm opacity-80 mt-1">
            {nextManeuver === "straight" ? "Continue straight" : `Then ${nextManeuver.replace("-", " ")}`}
          </div>
        </div>
      </div>

      {/* Current Instruction */}
      <div className="absolute top-[65%] left-4 right-4 z-30">
        <Card className="bg-black/80 border-gray-600 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="text-xl font-semibold text-center text-white">{currentInstruction}</div>
          </CardContent>
        </Card>
      </div>

      {/* Speed Display */}
      <div className="absolute top-20 right-4 z-30 flex flex-col gap-2">
        <div className="bg-black/70 text-white rounded-lg p-3 text-center min-w-[80px]">
          <div className="text-3xl font-bold">{Math.round(currentSpeed)}</div>
          <div className="text-xs opacity-75">{settings?.units === "metric" ? "km/h" : "mph"}</div>
        </div>
        <div className="bg-white border-4 border-red-600 rounded-full p-3 text-center w-16 h-16 flex flex-col items-center justify-center">
          <div className="text-lg font-bold text-black">{speedLimit}</div>
        </div>
      </div>

      {/* ETA and Distance */}
      <div className="absolute top-20 left-4 z-30 flex flex-col gap-2">
        <div className="bg-black/70 text-white rounded-lg p-3 text-center">
          <div className="text-lg font-bold">{navigationService.formatDistance(remainingDistance)}</div>
          <div className="text-xs opacity-75">remaining</div>
        </div>
        <div className="bg-black/70 text-white rounded-lg p-3 text-center">
          <div className="text-lg font-bold">{navigationService.formatDuration(remainingTime)}</div>
          <div className="text-xs opacity-75">ETA</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-20 left-4 right-4 z-30">
        <div className="bg-black/70 rounded-lg p-3">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>
              Step {currentStep + 1} of {currentRoute.instructions?.length || 1}
            </span>
            <span>
              Elapsed: {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, "0")}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / (currentRoute.instructions?.length || 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex-1 bg-gray-800/80 border-gray-600 text-white hover:bg-gray-700"
          >
            Previous
          </Button>
          <Button
            onClick={nextStepAction}
            disabled={currentStep >= (currentRoute.instructions?.length || 1) - 1}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Next Step
          </Button>
        </div>

        {currentStep >= (currentRoute.instructions?.length || 1) - 1 && (
          <div className="mt-3 text-center">
            <Badge className="bg-green-600 text-white px-4 py-2">
              <MapPin className="w-4 h-4 mr-2" />
              Arrived at Destination
            </Badge>
          </div>
        )}
      </div>
    </div>
  )
}
