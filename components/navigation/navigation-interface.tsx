"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navigation, X, MapPin, Clock, Route } from "lucide-react"
import { useNavigationStore } from "@/lib/navigation-store"
import { NavigationService } from "@/lib/navigation-service"

interface NavigationInterfaceProps {
  onExit: () => void
}

export function NavigationInterface({ onExit }: NavigationInterfaceProps) {
  const { destination, route, currentStep, nextStep, previousStep } = useNavigationStore()
  const [elapsedTime, setElapsedTime] = useState(0)
  const navigationService = NavigationService.getInstance()

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (!destination || !route) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <Card className="p-6">
          <CardContent>
            <p>No active navigation</p>
            <Button onClick={onExit} className="mt-4">
              Return to Map
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentInstruction = route.instructions[currentStep] || "Continue to destination"
  const remainingDistance = Math.round(route.distance * (1 - currentStep / route.instructions.length))
  const remainingTime = Math.round(route.duration * (1 - currentStep / route.instructions.length))

  return (
    <div className="h-full bg-gray-900 text-white relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Navigation className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="font-semibold">{destination.name}</h2>
              <p className="text-sm text-gray-300">{destination.spotId}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onExit}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Navigation Display */}
      <div className="pt-20 pb-32 px-4 h-full flex flex-col justify-center">
        <div className="text-center space-y-6">
          {/* Current Instruction */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="text-2xl font-bold mb-2">{currentInstruction}</div>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <Route className="w-4 h-4" />
                  <span>{navigationService.formatDistance(remainingDistance)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{navigationService.formatDuration(remainingTime)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-300">
              <span>
                Step {currentStep + 1} of {route.instructions.length}
              </span>
              <span>
                Elapsed: {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, "0")}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / route.instructions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Route Info */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold">{navigationService.formatDistance(route.distance)}</div>
                <div className="text-sm text-gray-300">Total Distance</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-lg font-bold">{navigationService.formatDuration(route.duration)}</div>
                <div className="text-sm text-gray-300">Estimated Time</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-800 p-4">
        <div className="flex gap-2">
          <Button variant="outline" onClick={previousStep} disabled={currentStep === 0} className="flex-1">
            Previous
          </Button>
          <Button onClick={nextStep} disabled={currentStep >= route.instructions.length - 1} className="flex-1">
            Next Step
          </Button>
        </div>

        {currentStep >= route.instructions.length - 1 && (
          <div className="mt-4 text-center">
            <Badge className="bg-green-600">
              <MapPin className="w-4 h-4 mr-1" />
              Arrived at Destination
            </Badge>
          </div>
        )}
      </div>
    </div>
  )
}
