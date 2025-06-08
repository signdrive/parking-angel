"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { NavigationMap } from "./navigation-map"
import { useNavigationStore } from "@/lib/navigation-store"
import { X, ChevronUp, ChevronDown, MapPin, Clock, RotateCcw } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface NavigationInterfaceProps {
  onExit: () => void
}

export function NavigationInterface({ onExit }: NavigationInterfaceProps) {
  const { destination, route, origin } = useNavigationStore()
  const [showDetails, setShowDetails] = useState(false)
  const [arrivalStatus, setArrivalStatus] = useState<"navigating" | "arriving" | "arrived">("navigating")
  const [confirmingExit, setConfirmingExit] = useState(false)

  // Handle arrival
  const handleArrival = () => {
    setArrivalStatus("arriving")

    toast({
      title: "Approaching destination",
      description: "You are almost at your destination.",
    })

    // Simulate arrival after 5 seconds
    setTimeout(() => {
      setArrivalStatus("arrived")
      toast({
        title: "You have arrived!",
        description: `You have reached ${destination?.name}`,
      })
    }, 5000)
  }

  // Handle exit confirmation
  const handleExitClick = () => {
    if (arrivalStatus !== "arrived" && !confirmingExit) {
      setConfirmingExit(true)
      setTimeout(() => setConfirmingExit(false), 3000)
      return
    }

    onExit()
  }

  // Reset confirmation on arrival
  useEffect(() => {
    if (arrivalStatus === "arrived") {
      setConfirmingExit(false)
    }
  }, [arrivalStatus])

  if (!destination || !route || !origin) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Navigation Error</h3>
              <p className="text-gray-600 mb-4">Could not load navigation data.</p>
              <Button onClick={onExit}>Return to Map</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full relative">
      <NavigationMap
        origin={origin}
        destination={[destination.longitude, destination.latitude]}
        route={route}
        onArrival={handleArrival}
      />

      {/* Exit Button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute top-4 right-4 bg-white rounded-full shadow-md z-10"
        onClick={handleExitClick}
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Bottom Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-lg transition-transform duration-300">
        <div className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">{destination.name}</h3>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                <span>{route.duration ? formatDuration(route.duration) : "Calculating..."}</span>
                <span className="mx-2">•</span>
                <span>{route.distance ? formatDistance(route.distance) : "Calculating..."}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="p-1" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
            </Button>
          </div>

          {/* Status Indicator */}
          <div className="mt-3">
            {arrivalStatus === "navigating" && (
              <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-md text-sm flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Navigating to destination...
              </div>
            )}

            {arrivalStatus === "arriving" && (
              <div className="bg-yellow-50 text-yellow-700 px-3 py-2 rounded-md text-sm flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Approaching destination...
              </div>
            )}

            {arrivalStatus === "arrived" && (
              <div className="bg-green-50 text-green-700 px-3 py-2 rounded-md text-sm flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                You have arrived at your destination!
              </div>
            )}
          </div>

          {/* Confirmation Message */}
          {confirmingExit && arrivalStatus !== "arrived" && (
            <div className="mt-3 bg-red-50 text-red-700 px-3 py-2 rounded-md text-sm">Tap again to exit navigation</div>
          )}

          {/* Action Buttons */}
          <div className="mt-3 flex gap-2">
            {arrivalStatus === "arrived" ? (
              <Button className="w-full" onClick={onExit}>
                Done
              </Button>
            ) : (
              <>
                <Button variant="outline" className="flex-1" onClick={() => window.location.reload()}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Recalculate
                </Button>
                <Button
                  variant={confirmingExit ? "destructive" : "default"}
                  className="flex-1"
                  onClick={handleExitClick}
                >
                  {confirmingExit ? "Confirm Exit" : "Exit Navigation"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Expanded Details */}
        {showDetails && (
          <div className="p-4 pt-0 border-t mt-4">
            <h4 className="font-medium text-sm mb-2">Turn-by-Turn Directions</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {route.steps?.map((step: any, index: number) => (
                <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                  <div className="font-medium">{step.maneuver.instruction}</div>
                  {step.distance && <div className="text-xs text-gray-600 mt-1">{formatDistance(step.distance)}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Format duration in seconds to a readable string
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours} hr ${minutes} min`
  } else {
    return `${minutes} min`
  }
}

// Format distance in meters to a readable string
function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  } else {
    return `${(meters / 1000).toFixed(1)} km`
  }
}
