"use client"

import { useEffect, useState, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/lib/navigation-redux-store"
import {
  updateUserLocation,
  setOffRoute,
  setRecalculating,
  updateRoute,
  toggleVoice,
  setMapMode,
  confirmArrival,
  setError,
} from "@/lib/navigation-redux-store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  ArrowLeft,
  Navigation,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  MapPin,
  Clock,
  Gauge,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  Compass,
} from "lucide-react"

interface TomTomNavigationProps {
  onExit: () => void
}

export function TomTomNavigation({ onExit }: TomTomNavigationProps) {
  const dispatch = useDispatch()
  const navigation = useSelector((state: RootState) => state.navigation)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showMiniMap, setShowMiniMap] = useState(true)
  const speechSynthesis = useRef<SpeechSynthesis | null>(null)
  const lastSpokenInstruction = useRef<string>("")

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== "undefined") {
      speechSynthesis.current = window.speechSynthesis
    }
  }, [])

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto day/night mode
  useEffect(() => {
    if (navigation.mapMode === "auto") {
      const hour = new Date().getHours()
      const isDark = hour < 6 || hour > 20
      dispatch(setMapMode(isDark ? "night" : "day"))
    }
  }, [navigation.mapMode, dispatch])

  // Simulate GPS tracking
  useEffect(() => {
    if (!navigation.isNavigating) return

    const interval = setInterval(() => {
      // Simulate location updates
      const mockLocation = {
        latitude: 37.7749 + (Math.random() - 0.5) * 0.001,
        longitude: -122.4194 + (Math.random() - 0.5) * 0.001,
        heading: Math.random() * 360,
        speed: 25 + Math.random() * 20, // 25-45 mph
        accuracy: 5 + Math.random() * 10,
      }

      dispatch(updateUserLocation(mockLocation))

      // Simulate position updates
      if (navigation.currentRoute) {
        updatePosition(mockLocation)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [navigation.isNavigating, navigation.currentRoute, dispatch])

  const updatePosition = async (location: any) => {
    try {
      const response = await fetch("/api/navigation/update-position", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...location,
          routeId: navigation.currentRoute?.id,
          currentStepId: navigation.currentRoute?.steps[navigation.currentStep]?.id,
        }),
      })

      const data = await response.json()

      if (data.isOffRoute && !navigation.isOffRoute) {
        dispatch(setOffRoute(true))
        speakInstruction("Recalculating route")
        recalculateRoute()
      }

      if (data.voiceInstruction && navigation.voiceEnabled) {
        speakInstruction(data.voiceInstruction)
      }

      if (data.approachingDestination && !navigation.arrivalConfirmed) {
        // Show arrival confirmation
      }
    } catch (error) {
      console.error("Position update failed:", error)
      dispatch(setError("GPS signal lost"))
    }
  }

  const recalculateRoute = async () => {
    if (!navigation.userLocation || !navigation.destination) return

    dispatch(setRecalculating(true))

    try {
      const response = await fetch("/api/navigation/start-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: navigation.userLocation,
          destination: navigation.destination,
          preferences: {
            avoidTraffic: true,
            routeType: "fastest",
            avoidTolls: false,
          },
        }),
      })

      const data = await response.json()
      dispatch(updateRoute(data.route))
      speakInstruction("Route updated")
    } catch (error) {
      dispatch(setError("Failed to recalculate route"))
    }
  }

  const speakInstruction = (instruction: string) => {
    if (!navigation.voiceEnabled || !speechSynthesis.current || instruction === lastSpokenInstruction.current) {
      return
    }

    lastSpokenInstruction.current = instruction
    speechSynthesis.current.cancel()

    const utterance = new SpeechSynthesisUtterance(instruction)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 0.8
    utterance.lang = "en-US"

    speechSynthesis.current.speak(utterance)
  }

  const handleConfirmArrival = async () => {
    if (!navigation.destination || !navigation.userLocation) return

    try {
      const response = await fetch("/api/parking/confirm-arrival", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spotId: navigation.destination.id,
          userId: "user_123",
          arrivalTime: new Date().toISOString(),
          reservationId: navigation.parkingReservation?.confirmationCode,
          vehicleLocation: navigation.userLocation,
        }),
      })

      const data = await response.json()
      dispatch(confirmArrival())
      speakInstruction("Arrival confirmed. Enjoy your parking!")
    } catch (error) {
      dispatch(setError("Failed to confirm arrival"))
    }
  }

  const currentStep = navigation.currentRoute?.steps[navigation.currentStep]
  const nextStep = navigation.currentRoute?.steps[navigation.currentStep + 1]
  const isDarkMode = navigation.mapMode === "night"

  if (!navigation.currentRoute || !navigation.destination) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <h2 className="text-xl font-bold mb-4">Navigation Error</h2>
          <p className="mb-4">Unable to load navigation data</p>
          <Button onClick={onExit} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`fixed inset-0 z-50 ${isDarkMode ? "bg-gray-900" : "bg-blue-50"} transition-colors duration-300`}>
      {/* Header */}
      <div
        className={`${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-b px-4 py-3 flex items-center justify-between`}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onExit}
            className={isDarkMode ? "text-white hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div>
            <h1 className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              {navigation.destination.name}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{(navigation.remainingDistance / 1000).toFixed(1)} km</span>
              <span>•</span>
              <span>{Math.ceil(navigation.remainingTime / 60)} min</span>
              <span>•</span>
              <span>{navigation.eta?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* GPS Signal */}
          <div className="flex items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full ${
                navigation.gpsSignalStrength === "strong"
                  ? "bg-green-500"
                  : navigation.gpsSignalStrength === "weak"
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
            />
            <span className={`text-xs ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              {navigation.gpsSignalStrength.toUpperCase()}
            </span>
          </div>

          {/* Voice Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(toggleVoice())}
            className={isDarkMode ? "text-white hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}
          >
            {navigation.voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>

          {/* Day/Night Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(setMapMode(isDarkMode ? "day" : "night"))}
            className={isDarkMode ? "text-white hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Main Navigation View */}
      <div className="flex-1 relative">
        {/* Map Area */}
        <div className={`h-full ${isDarkMode ? "bg-gray-800" : "bg-blue-100"} relative overflow-hidden`}>
          {/* Simulated Map with Route */}
          <svg className="w-full h-full" viewBox="0 0 400 600">
            {/* Background Grid */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke={isDarkMode ? "#374151" : "#E5E7EB"} strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Buildings */}
            {Array.from({ length: 12 }, (_, i) => (
              <rect
                key={i}
                x={50 + (i % 3) * 120}
                y={100 + Math.floor(i / 3) * 120}
                width={80}
                height={60}
                fill={isDarkMode ? "#4B5563" : "#D1D5DB"}
                rx="4"
              />
            ))}

            {/* Route Line */}
            <path
              d="M 50 500 Q 200 400 350 100"
              stroke="#3B82F6"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              className="route-line"
            />

            {/* Route Direction Arrows */}
            <polygon points="340,110 350,100 340,90" fill="#3B82F6" />

            {/* User Location */}
            <circle cx="50" cy="500" r="15" fill="#10B981" className="user-pulse" />
            <circle cx="50" cy="500" r="8" fill="white" />

            {/* Destination */}
            <circle cx="350" cy="100" r="12" fill="#EF4444" />
            <circle cx="350" cy="100" r="6" fill="white" />
          </svg>

          {/* Speed Limit */}
          {currentStep?.speedLimit && (
            <div className="absolute top-4 right-4">
              <div
                className={`w-16 h-16 rounded-full border-4 ${isDarkMode ? "border-white bg-gray-800" : "border-red-500 bg-white"} flex items-center justify-center`}
              >
                <div className="text-center">
                  <div className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-red-500"}`}>
                    {currentStep.speedLimit}
                  </div>
                  <div className={`text-xs ${isDarkMode ? "text-gray-300" : "text-red-500"}`}>MPH</div>
                </div>
              </div>
            </div>
          )}

          {/* Compass */}
          <div className="absolute top-20 right-4">
            <div
              className={`w-12 h-12 rounded-full ${isDarkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-300"} border-2 flex items-center justify-center`}
            >
              <Compass
                className={`w-6 h-6 ${isDarkMode ? "text-white" : "text-gray-700"}`}
                style={{ transform: `rotate(${navigation.compassHeading}deg)` }}
              />
            </div>
          </div>

          {/* Current Speed */}
          {navigation.userLocation?.speed && (
            <div className="absolute bottom-32 left-4">
              <Card className={`p-3 ${isDarkMode ? "bg-gray-800 border-gray-600" : "bg-white"}`}>
                <div className="flex items-center gap-2">
                  <Gauge className={`w-4 h-4 ${isDarkMode ? "text-white" : "text-gray-700"}`} />
                  <span className={`font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {Math.round(navigation.userLocation.speed)} mph
                  </span>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Mini Map */}
        {showMiniMap && (
          <div className="absolute bottom-4 right-4 w-32 h-24 rounded-lg overflow-hidden border-2 border-white shadow-lg">
            <div className={`w-full h-full ${isDarkMode ? "bg-gray-700" : "bg-blue-200"} relative`}>
              <div className="absolute inset-2 border border-blue-500 rounded">
                <div className="w-full h-full bg-blue-500 opacity-20" />
                <div className="absolute bottom-1 left-1 w-2 h-2 bg-green-500 rounded-full" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </div>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {navigation.isRecalculating && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Card className={`p-4 ${isDarkMode ? "bg-gray-800 border-gray-600" : "bg-white"}`}>
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 animate-spin text-blue-500" />
                <span className={isDarkMode ? "text-white" : "text-gray-900"}>Recalculating route...</span>
              </div>
            </Card>
          </div>
        )}

        {navigation.error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <Card className="p-3 bg-red-500 border-red-600">
              <div className="flex items-center gap-2 text-white">
                <AlertTriangle className="w-4 h-4" />
                <span>{navigation.error}</span>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Bottom Instruction Panel */}
      <div className={`${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-t p-4`}>
        {currentStep && (
          <div className="space-y-3">
            {/* Current Instruction */}
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-full ${isDarkMode ? "bg-blue-600" : "bg-blue-500"} flex items-center justify-center`}
              >
                {currentStep.maneuver.type === "turn-right" && <Navigation className="w-6 h-6 text-white rotate-90" />}
                {currentStep.maneuver.type === "turn-left" && <Navigation className="w-6 h-6 text-white -rotate-90" />}
                {currentStep.maneuver.type === "straight" && <Navigation className="w-6 h-6 text-white" />}
                {currentStep.maneuver.type === "arrive" && <MapPin className="w-6 h-6 text-white" />}
                {currentStep.maneuver.type === "roundabout" && <RotateCcw className="w-6 h-6 text-white" />}
              </div>

              <div className="flex-1">
                <div className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {currentStep.instruction}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{currentStep.distance}m</span>
                  {currentStep.streetName && (
                    <>
                      <span>•</span>
                      <span>{currentStep.streetName}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {currentStep.distance}m
                </div>
                <div className="text-sm text-gray-500">{Math.ceil(currentStep.duration / 60)} min</div>
              </div>
            </div>

            {/* Lane Guidance */}
            {currentStep.laneGuidance && (
              <div className="flex items-center gap-2">
                <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>Lanes:</span>
                <div className="flex gap-1">
                  {currentStep.laneGuidance.lanes.map((lane, index) => (
                    <div
                      key={index}
                      className={`w-8 h-6 rounded border-2 flex items-center justify-center ${
                        lane.valid ? "border-green-500 bg-green-100" : "border-gray-400 bg-gray-100"
                      }`}
                    >
                      {lane.indications.includes("straight") && <Navigation className="w-3 h-3 text-gray-700" />}
                      {lane.indications.includes("right") && <Navigation className="w-3 h-3 text-gray-700 rotate-90" />}
                      {lane.indications.includes("left") && <Navigation className="w-3 h-3 text-gray-700 -rotate-90" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Instruction Preview */}
            {nextStep && (
              <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full ${isDarkMode ? "bg-gray-600" : "bg-gray-300"} flex items-center justify-center`}
                  >
                    {nextStep.maneuver.type === "turn-right" && (
                      <Navigation className="w-4 h-4 text-gray-600 rotate-90" />
                    )}
                    {nextStep.maneuver.type === "turn-left" && (
                      <Navigation className="w-4 h-4 text-gray-600 -rotate-90" />
                    )}
                    {nextStep.maneuver.type === "straight" && <Navigation className="w-4 h-4 text-gray-600" />}
                    {nextStep.maneuver.type === "arrive" && <MapPin className="w-4 h-4 text-gray-600" />}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                      Then: {nextStep.instruction}
                    </div>
                  </div>
                  <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {nextStep.distance}m
                  </div>
                </div>
              </div>
            )}

            {/* Arrival Confirmation */}
            {currentStep.maneuver.type === "arrive" && !navigation.arrivalConfirmed && (
              <Button onClick={handleConfirmArrival} className="w-full bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm Arrival at Parking Spot
              </Button>
            )}

            {/* Parking Reservation Timer */}
            {navigation.parkingReservation && (
              <div
                className={`p-3 rounded-lg border ${isDarkMode ? "bg-yellow-900 border-yellow-700" : "bg-yellow-50 border-yellow-200"}`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className={`text-sm ${isDarkMode ? "text-yellow-200" : "text-yellow-800"}`}>
                    Reservation expires at {new Date(navigation.parkingReservation.expiresAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
