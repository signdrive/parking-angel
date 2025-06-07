"use client"

import { useEffect, useState } from "react"
import { useNavigationStore } from "@/lib/navigation-store"
import { NavigationService } from "@/lib/navigation-service"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  MoreVertical,
  Navigation,
  Phone,
  Share,
  Star,
  Clock,
  AlertTriangle,
  Camera,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface SimpleNavigationMapProps {
  onExit: () => void
}

export function SimpleNavigationMap({ onExit }: SimpleNavigationMapProps) {
  const [currentSpeed, setCurrentSpeed] = useState(28)
  const [showSpeedCamera, setShowSpeedCamera] = useState(false)

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
    settings,
    updateSettings,
    confirmArrival,
  } = useNavigationStore()

  const navigationService = NavigationService.getInstance()

  // Simulate realistic updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSpeed(Math.floor(Math.random() * 15) + 20)
      setShowSpeedCamera(Math.random() > 0.9)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  if (!currentRoute || !destination) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <div className="text-center">
          <Navigation className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-pulse" />
          <p className="text-gray-600">Loading navigation...</p>
        </div>
      </div>
    )
  }

  const currentStepData = currentRoute.steps[currentStep]
  const nextStep = currentRoute.steps[currentStep + 1]
  const isLastStep = currentStep === currentRoute.steps.length - 1

  const getNextInstruction = () => {
    if (!nextStep) return "Continue to destination"
    return nextStep.instruction
  }

  const getNextDistance = () => {
    if (!nextStep) return remainingDistance
    return nextStep.distance
  }

  const getTurnIcon = () => {
    if (!nextStep) return "🏁"
    switch (nextStep.maneuver.type) {
      case "turn-left":
        return "↰"
      case "turn-right":
        return "↱"
      case "straight":
        return "↑"
      case "roundabout":
        return "↻"
      case "arrive":
        return "🏁"
      default:
        return "↑"
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Google Maps Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={onExit}
              className="rounded-full hover:bg-gray-100 flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                <span className="font-medium text-gray-900 truncate text-sm">{destination.name}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>{navigationService.formatDistance(remainingDistance)}</span>
                <span>•</span>
                <span>{navigationService.formatDuration(remainingTime)}</span>
                <span>•</span>
                <span className="text-green-600 font-medium">
                  {eta ? eta.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => updateSettings({ voiceGuidance: !settings.voiceGuidance })}
              className="rounded-full hover:bg-gray-100 w-8 h-8"
            >
              {settings.voiceGuidance ? (
                <Volume2 className="w-4 h-4 text-blue-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-600" />
              )}
            </Button>

            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 w-8 h-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Status alerts */}
      {isRecalculating && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 relative z-10">
          <div className="flex items-center gap-2 text-blue-800">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Rerouting...</span>
          </div>
        </div>
      )}

      {isOffRoute && !isRecalculating && (
        <div className="bg-orange-50 border-b border-orange-200 px-4 py-2 relative z-10">
          <div className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Off route • Rerouting</span>
          </div>
        </div>
      )}

      {/* Beautiful Map Area */}
      <div className="flex-1 relative bg-gradient-to-br from-blue-50 to-green-50">
        {/* Street Map Background */}
        <div className="absolute inset-0">
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              {/* Street pattern */}
              <pattern id="streets" width="120" height="120" patternUnits="userSpaceOnUse">
                <rect width="120" height="120" fill="#f8fafc" />
                {/* Horizontal streets */}
                <rect x="0" y="50" width="120" height="20" fill="#e2e8f0" />
                {/* Vertical streets */}
                <rect x="50" y="0" width="20" height="120" fill="#e2e8f0" />
                {/* Street lines */}
                <line x1="0" y1="60" x2="120" y2="60" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="10,5" />
                <line x1="60" y1="0" x2="60" y2="120" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="10,5" />
              </pattern>

              {/* Building pattern */}
              <pattern id="buildings" width="60" height="60" patternUnits="userSpaceOnUse">
                <rect x="5" y="5" width="20" height="25" fill="#94a3b8" opacity="0.3" />
                <rect x="35" y="10" width="15" height="20" fill="#94a3b8" opacity="0.3" />
                <rect x="10" y="35" width="25" height="15" fill="#94a3b8" opacity="0.3" />
              </pattern>
            </defs>

            {/* Base map */}
            <rect width="100%" height="100%" fill="url(#streets)" />
            <rect width="100%" height="100%" fill="url(#buildings)" />

            {/* Main route - Google Maps style */}
            <path
              d="M 10% 90% Q 25% 70% 40% 60% Q 55% 50% 70% 40% Q 85% 30% 90% 20%"
              stroke="#1a73e8"
              strokeWidth="16"
              fill="none"
              strokeLinecap="round"
              opacity="0.4"
            />
            <path
              d="M 10% 90% Q 25% 70% 40% 60% Q 55% 50% 70% 40% Q 85% 30% 90% 20%"
              stroke="#4285f4"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
            />

            {/* Direction arrows along route */}
            <g transform="translate(25%, 70%) rotate(-30)">
              <polygon points="-6,-10 6,0 -6,10" fill="#4285f4" />
            </g>
            <g transform="translate(55%, 50%) rotate(-15)">
              <polygon points="-6,-10 6,0 -6,10" fill="#4285f4" />
            </g>
            <g transform="translate(85%, 30%) rotate(15)">
              <polygon points="-6,-10 6,0 -6,10" fill="#4285f4" />
            </g>

            {/* User location (animated) */}
            <g>
              <circle cx="10%" cy="90%" r="20" fill="#4285f4" opacity="0.2">
                <animate attributeName="r" values="15;25;15" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="10%" cy="90%" r="12" fill="white" stroke="#4285f4" strokeWidth="3" />
              <circle cx="10%" cy="90%" r="6" fill="#4285f4" />
            </g>

            {/* Destination marker */}
            <g>
              <circle cx="90%" cy="20%" r="20" fill="#ea4335" opacity="0.2" />
              <circle cx="90%" cy="20%" r="16" fill="white" stroke="#ea4335" strokeWidth="3" />
              <circle cx="90%" cy="20%" r="10" fill="#ea4335" />
              <circle cx="90%" cy="20%" r="4" fill="white" />
            </g>

            {/* Street labels */}
            <text x="15%" y="95%" fill="#374151" fontSize="12" fontWeight="500">
              Current St
            </text>
            <text x="85%" y="15%" fill="#374151" fontSize="12" fontWeight="500">
              Destination Ave
            </text>
          </svg>
        </div>

        {/* Speed limit */}
        {currentStepData?.speedLimit && (
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
            <div className="w-12 h-12 border-2 border-red-600 rounded-full flex flex-col items-center justify-center">
              <span className="text-sm font-bold text-black">{currentStepData.speedLimit}</span>
              <span className="text-xs text-gray-600 -mt-1">mph</span>
            </div>
          </div>
        )}

        {/* Speed camera alert */}
        {showSpeedCamera && (
          <div className="absolute top-20 right-4 bg-red-600 text-white rounded-lg shadow-lg p-3 flex items-center gap-2 animate-pulse">
            <Camera className="w-4 h-4" />
            <span className="text-sm font-medium">Speed camera ahead</span>
          </div>
        )}

        {/* Current speed */}
        <div className="absolute bottom-40 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">{currentSpeed}</div>
            <div className="text-xs text-gray-600">mph</div>
          </div>
        </div>

        {/* Lane guidance */}
        {currentStepData?.laneGuidance && (
          <div className="absolute bottom-48 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
            <div className="flex gap-1">
              {currentStepData.laneGuidance.lanes.map((lane, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-6 h-10 border-2 rounded flex items-end justify-center pb-1",
                    lane.valid ? "border-blue-600 bg-blue-50" : "border-gray-300 bg-gray-50",
                  )}
                >
                  {lane.indications.includes("straight") && (
                    <div className={cn("text-sm", lane.valid ? "text-blue-600" : "text-gray-400")}>↑</div>
                  )}
                  {lane.indications.includes("right") && (
                    <div className={cn("text-sm", lane.valid ? "text-blue-600" : "text-gray-400")}>↗</div>
                  )}
                  {lane.indications.includes("left") && (
                    <div className={cn("text-sm", lane.valid ? "text-blue-600" : "text-gray-400")}>↖</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next turn preview */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {getTurnIcon()}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {navigationService.formatDistance(getNextDistance())}
              </div>
              <div className="text-xs text-gray-600">Next turn</div>
            </div>
          </div>
        </div>
      </div>

      {/* Google Maps Bottom Sheet */}
      <div className="bg-white border-t border-gray-200 shadow-lg relative z-10">
        {/* Main instruction */}
        <div className="px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Turn icon */}
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
              {getTurnIcon()}
            </div>

            {/* Instruction text */}
            <div className="flex-1 min-w-0">
              <div className="text-base font-medium text-gray-900 truncate">{getNextInstruction()}</div>
              {nextStep && <div className="text-sm text-gray-600 mt-1 truncate">on {nextStep.streetName}</div>}
            </div>

            {/* Distance */}
            <div className="text-right flex-shrink-0">
              <div className="text-xl font-bold text-gray-900">
                {navigationService.formatDistance(getNextDistance())}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="border-t border-gray-100 px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left actions */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 h-8 px-3 text-sm">
                <Share className="w-3 h-3 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 h-8 px-3 text-sm">
                <Star className="w-3 h-3 mr-2" />
                Save
              </Button>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 h-8 px-3 text-sm">
                <Phone className="w-3 h-3 mr-2" />
                Call
              </Button>

              {/* Arrival button */}
              {isLastStep && remainingDistance < 100 && (
                <Button
                  onClick={confirmArrival}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full h-8 text-sm"
                >
                  I'm here
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Traffic info */}
        <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-3 h-3" />
              <span>Typical traffic for this time</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-green-600 font-medium text-xs">Light traffic</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
