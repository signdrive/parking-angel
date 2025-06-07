"use client"

import { useState, useEffect } from "react"
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
import { useToast } from "@/hooks/use-toast"

interface CleanNavigationProps {
  onExit: () => void
}

export function CleanNavigation({ onExit }: CleanNavigationProps) {
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
  const { toast } = useToast()

  // Simple speed simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSpeed(Math.floor(Math.random() * 15) + 20)
      setShowSpeedCamera(Math.random() > 0.95)
    }, 3000)

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
  const isLastStep = currentStep === currentRoute.steps.length - 1

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button variant="ghost" size="icon" onClick={onExit} className="rounded-full hover:bg-gray-100 w-10 h-10">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Button>

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="font-normal text-gray-900 truncate">{destination.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
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

          <div className="flex items-center gap-1">
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
              className="rounded-full hover:bg-gray-100 w-10 h-10"
            >
              {settings.voiceGuidance ? (
                <Volume2 className="w-5 h-5 text-blue-600" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-600" />
              )}
            </Button>

            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 w-10 h-10">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* Status alerts */}
      {isRecalculating && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
          <div className="flex items-center gap-3 text-blue-800">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Rerouting...</span>
          </div>
        </div>
      )}

      {isOffRoute && !isRecalculating && (
        <div className="bg-orange-50 border-b border-orange-200 px-4 py-3">
          <div className="flex items-center gap-3 text-orange-800">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Off route • Rerouting</span>
          </div>
        </div>
      )}

      {/* Main Map Area */}
      <div className="flex-1 relative bg-gray-100">
        {/* Simple, clean map visualization */}
        <div className="w-full h-full relative overflow-hidden">
          {/* Map background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
            {/* Street grid */}
            <svg className="w-full h-full" viewBox="0 0 400 300">
              {/* Background */}
              <rect width="400" height="300" fill="#f8f9fa" />

              {/* Streets */}
              <g stroke="#ffffff" strokeWidth="8" fill="none">
                <line x1="0" y1="150" x2="400" y2="150" />
                <line x1="200" y1="0" x2="200" y2="300" />
                <line x1="0" y1="75" x2="400" y2="75" />
                <line x1="0" y1="225" x2="400" y2="225" />
                <line x1="100" y1="0" x2="100" y2="300" />
                <line x1="300" y1="0" x2="300" y2="300" />
              </g>

              {/* Buildings */}
              <g fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1">
                <rect x="20" y="20" width="60" height="40" />
                <rect x="120" y="20" width="60" height="40" />
                <rect x="220" y="20" width="60" height="40" />
                <rect x="320" y="20" width="60" height="40" />
                <rect x="20" y="90" width="60" height="40" />
                <rect x="120" y="90" width="60" height="40" />
                <rect x="220" y="90" width="60" height="40" />
                <rect x="320" y="90" width="60" height="40" />
                <rect x="20" y="170" width="60" height="40" />
                <rect x="120" y="170" width="60" height="40" />
                <rect x="220" y="170" width="60" height="40" />
                <rect x="320" y="170" width="60" height="40" />
                <rect x="20" y="240" width="60" height="40" />
                <rect x="120" y="240" width="60" height="40" />
                <rect x="220" y="240" width="60" height="40" />
                <rect x="320" y="240" width="60" height="40" />
              </g>

              {/* Route */}
              <path
                d="M 50 250 L 100 200 L 200 150 L 300 100 L 350 50"
                stroke="#4285f4"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
              />

              {/* User location */}
              <circle cx="50" cy="250" r="20" fill="#4285f4" opacity="0.2">
                <animate attributeName="r" values="20;30;20" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="50" cy="250" r="8" fill="white" stroke="#4285f4" strokeWidth="3" />
              <circle cx="50" cy="250" r="4" fill="#4285f4" />

              {/* Destination */}
              <g transform="translate(350, 50)">
                <path
                  d="M 0,-15 C -6,-15 -12,-9 -12,-3 C -12,3 0,15 0,15 C 0,15 12,3 12,-3 C 12,-9 6,-15 0,-15 Z"
                  fill="#ea4335"
                />
                <circle cx="0" cy="-3" r="4" fill="white" />
              </g>

              {/* Street labels */}
              <text x="200" y="145" textAnchor="middle" fill="#5f6368" fontSize="10" fontFamily="system-ui">
                Main Route
              </text>
              <text x="60" y="265" fill="#5f6368" fontSize="8" fontFamily="system-ui">
                Current St
              </text>
            </svg>
          </div>
        </div>

        {/* Speed limit */}
        <div className="absolute top-4 right-4 bg-white rounded-full shadow-lg border border-gray-200 p-2">
          <div className="w-12 h-12 border-2 border-red-600 rounded-full flex flex-col items-center justify-center bg-white">
            <span className="text-sm font-bold text-black">35</span>
            <span className="text-xs text-gray-600">mph</span>
          </div>
        </div>

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
            <div className="text-2xl font-normal text-gray-900">{currentSpeed}</div>
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
      </div>

      {/* Bottom Sheet */}
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg font-normal">
              ↑
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-lg font-normal text-gray-900 truncate">
                {currentStepData?.instruction || "Continue straight on main route"}
              </div>
              <div className="text-sm text-gray-600 mt-1 truncate">
                on {currentStepData?.streetName || "Main Route"}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xl font-normal text-gray-900">
                {navigationService.formatDistance(remainingDistance)}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 h-9 px-3">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 h-9 px-3">
                <Star className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 h-9 px-3">
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>

              {isLastStep && remainingDistance < 100 && (
                <Button
                  onClick={confirmArrival}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full h-9"
                >
                  I'm here
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Typical traffic for this time</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-green-600 font-medium">Light traffic</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
