"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navigation, X, MapPin, ArrowUp, ArrowRight, ArrowLeft, RotateCcw, AlertTriangle } from "lucide-react"
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
  const navigationService = NavigationService.getInstance()

  // If not actually navigating, exit immediately
  useEffect(() => {
    if (!isNavigating) {
      console.log("Navigation interface mounted but not navigating, exiting...")
      onExit()
    }
  }, [isNavigating, onExit])

  useEffect(() => {
    if (!isNavigating) return

    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
      // Simulate speed changes
      setCurrentSpeed(30 + Math.random() * 20)
    }, 1000)

    return () => clearInterval(timer)
  }, [isNavigating])

  // Don't render anything if not navigating
  if (!isNavigating || !destination || !currentRoute) {
    console.log("NavigationInterface: No active navigation, calling onExit")
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

  // TomTom-style 3D Road Visualization
  const TomTomRoadView = () => {
    const isDayMode =
      settings.theme === "day" ||
      (settings.theme === "auto" && new Date().getHours() >= 6 && new Date().getHours() < 20)

    return (
      <div
        className={cn(
          "relative h-full overflow-hidden",
          isDayMode ? "bg-gradient-to-b from-blue-200 to-gray-100" : "bg-gradient-to-b from-gray-900 to-gray-800",
        )}
      >
        {/* Sky and Horizon */}
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-1/3",
            isDayMode ? "bg-gradient-to-b from-blue-300 to-blue-100" : "bg-gradient-to-b from-gray-900 to-gray-700",
          )}
        />

        {/* 3D Road with Perspective */}
        <div className="absolute top-1/3 left-0 right-0 bottom-0 flex justify-center perspective-1000">
          <div
            className={cn("relative w-full max-w-lg h-full", isDayMode ? "bg-gray-400" : "bg-gray-600")}
            style={{
              clipPath: "polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)",
              transform: "rotateX(75deg) translateZ(-50px)",
            }}
          >
            {/* Road Surface */}
            <div
              className={cn("absolute inset-[3px]", isDayMode ? "bg-gray-300" : "bg-gray-500")}
              style={{
                clipPath: "polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)",
              }}
            >
              {/* Center Line - Animated */}
              <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-yellow-400 transform -translate-x-1/2 overflow-hidden">
                <div className="h-full animate-pulse">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-8 mb-4 bg-yellow-400 opacity-80"
                      style={{
                        animationDelay: `${i * 0.1}s`,
                        animation: "slideDown 2s infinite linear",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Side Lines */}
              <div className="absolute left-[20%] top-0 bottom-0 w-[2px] bg-white opacity-80" />
              <div className="absolute right-[20%] top-0 bottom-0 w-[2px] bg-white opacity-80" />
            </div>
          </div>
        </div>

        {/* 3D Buildings */}
        <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
          {/* Left Buildings */}
          {Array.from({ length: 8 }).map((_, i) => {
            const height = 60 + Math.random() * 100
            const width = 40 + Math.random() * 30
            const distance = 5 + i * 12
            const opacity = Math.max(0.3, 1 - i * 0.12)

            return (
              <div
                key={`left-${i}`}
                className={cn("absolute", isDayMode ? "bg-blue-200 border-blue-300" : "bg-gray-700 border-gray-600")}
                style={{
                  height: `${height}px`,
                  width: `${width}px`,
                  bottom: `${33 + i * 1.5}%`,
                  left: `${distance}%`,
                  opacity,
                  transform: `perspective(500px) rotateY(15deg) translateZ(${i * 5}px)`,
                  borderWidth: "1px",
                }}
              >
                {/* Windows */}
                <div className="absolute inset-1 grid grid-cols-2 grid-rows-4 gap-[2px]">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <div
                      key={j}
                      className={cn(
                        "rounded-[1px]",
                        isDayMode
                          ? j % 3 === 0
                            ? "bg-blue-300"
                            : "bg-blue-100"
                          : j % 3 === 0
                            ? "bg-yellow-500/30"
                            : "bg-gray-800",
                      )}
                    />
                  ))}
                </div>
              </div>
            )
          })}

          {/* Right Buildings */}
          {Array.from({ length: 8 }).map((_, i) => {
            const height = 60 + Math.random() * 100
            const width = 40 + Math.random() * 30
            const distance = 5 + i * 12
            const opacity = Math.max(0.3, 1 - i * 0.12)

            return (
              <div
                key={`right-${i}`}
                className={cn("absolute", isDayMode ? "bg-blue-200 border-blue-300" : "bg-gray-700 border-gray-600")}
                style={{
                  height: `${height}px`,
                  width: `${width}px`,
                  bottom: `${33 + i * 1.5}%`,
                  right: `${distance}%`,
                  opacity,
                  transform: `perspective(500px) rotateY(-15deg) translateZ(${i * 5}px)`,
                  borderWidth: "1px",
                }}
              >
                {/* Windows */}
                <div className="absolute inset-1 grid grid-cols-2 grid-rows-4 gap-[2px]">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <div
                      key={j}
                      className={cn(
                        "rounded-[1px]",
                        isDayMode
                          ? j % 3 === 0
                            ? "bg-blue-300"
                            : "bg-blue-100"
                          : j % 3 === 0
                            ? "bg-yellow-500/30"
                            : "bg-gray-800",
                      )}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Turn Visualization */}
        {nextManeuver !== "straight" && (
          <div
            className={cn("absolute top-[25%] left-0 right-0 h-16", isDayMode ? "bg-gray-300/80" : "bg-gray-600/80")}
          >
            {nextManeuver === "turn-left" && (
              <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-blue-500/60 rounded-r-lg" />
            )}
            {nextManeuver === "turn-right" && (
              <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-blue-500/60 rounded-l-lg" />
            )}
            {nextManeuver === "roundabout" && (
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-4 border-blue-500 rounded-full" />
            )}
          </div>
        )}

        {/* Current Position Indicator */}
        <div className="absolute left-1/2 bottom-[20%] transform -translate-x-1/2 z-20">
          <div className="relative">
            <div className="w-8 h-8 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <ArrowUp className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-blue-600" />
          </div>
        </div>

        {/* Route Line */}
        <div className="absolute left-1/2 top-[25%] bottom-[20%] w-2 bg-blue-500/80 z-10 transform -translate-x-1/2 rounded-full" />
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
      {/* TomTom-style 3D Road View */}
      <div className="absolute inset-0">
        <TomTomRoadView />
      </div>

      {/* Header with Destination */}
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

      {/* Large Direction Arrow - TomTom Style */}
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 z-30">{getLargeDirectionArrow()}</div>

      {/* Distance to Next Turn - Large Display */}
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

      {/* Speed and Speed Limit - TomTom Style */}
      <div className="absolute top-20 right-4 z-30 flex flex-col gap-2">
        {/* Current Speed */}
        <div className="bg-black/70 text-white rounded-lg p-3 text-center min-w-[80px]">
          <div className="text-3xl font-bold">{Math.round(currentSpeed)}</div>
          <div className="text-xs opacity-75">{settings.units === "metric" ? "km/h" : "mph"}</div>
        </div>

        {/* Speed Limit */}
        <div className="bg-white border-4 border-red-600 rounded-full p-3 text-center w-16 h-16 flex flex-col items-center justify-center">
          <div className="text-lg font-bold text-black">{speedLimit}</div>
          <div className="text-[8px] text-gray-600">{settings.units === "metric" ? "km/h" : "mph"}</div>
        </div>
      </div>

      {/* ETA and Distance - Top Right */}
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

      {/* Traffic Alert */}
      <div className="absolute bottom-32 right-4 z-30">
        <Badge variant="destructive" className="flex items-center gap-2 px-3 py-2 text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>Traffic ahead</span>
        </Badge>
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

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes slideDown {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  )
}
