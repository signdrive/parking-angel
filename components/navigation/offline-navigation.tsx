"use client"

import { useState, useEffect } from "react"
import { useNavigationStore } from "@/lib/navigation-store"
import { NavigationService } from "@/lib/navigation-service"
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

interface OfflineNavigationProps {
  onExit: () => void
}

export function OfflineNavigation({ onExit }: OfflineNavigationProps) {
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

  // Simulate realistic updates
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
      {/* Google Maps Header */}
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

      {/* Offline Navigation Map */}
      <div className="flex-1 relative offline-navigation">
        <div className="w-full h-full relative overflow-hidden navigation-grid">
          {/* Beautiful SVG Map */}
          <svg className="w-full h-full" viewBox="0 0 800 600">
            {/* Background */}
            <defs>
              <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </linearGradient>
              <pattern id="streetPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <rect width="100" height="100" fill="#f1f5f9" />
                <rect x="45" y="0" width="10" height="100" fill="white" />
                <rect x="0" y="45" width="100" height="10" fill="white" />
              </pattern>
            </defs>

            <rect width="800" height="600" fill="url(#streetPattern)" />

            {/* Buildings */}
            <g fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1">
              <rect x="50" y="50" width="80" height="60" rx="4" />
              <rect x="200" y="80" width="100" height="80" rx="4" />
              <rect x="400" y="40" width="90" height="70" rx="4" />
              <rect x="600" y="60" width="120" height="90" rx="4" />
              <rect x="80" y="200" width="70" height="50" rx="4" />
              <rect x="250" y="220" width="110" height="70" rx="4" />
              <rect x="450" y="180" width="80" height="60" rx="4" />
              <rect x="620" y="200" width="100" height="80" rx="4" />
              <rect x="100" y="350" width="90" height="70" rx="4" />
              <rect x="300" y="380" width="80" height="60" rx="4" />
              <rect x="500" y="360" width="100" height="80" rx="4" />
              <rect x="650" y="340" width="90" height="70" rx="4" />
              <rect x="60" y="480" width="100" height="80" rx="4" />
              <rect x="220" y="500" width="80" height="60" rx="4" />
              <rect x="420" y="480" width="90" height="70" rx="4" />
              <rect x="580" y="460" width="110" height="90" rx="4" />
            </g>

            {/* Parks */}
            <g fill="#10b981" opacity="0.6">
              <circle cx="150" cy="150" r="25" />
              <circle cx="550" cy="300" r="30" />
              <circle cx="350" cy="450" r="20" />
            </g>

            {/* Main Route */}
            <path
              d="M 100 500 Q 200 450 300 400 Q 450 350 600 250 Q 650 200 700 150"
              stroke="#4285f4"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              className="route-line"
            />

            {/* Route Direction Arrows */}
            <g fill="#4285f4">
              <polygon points="250,425 260,420 250,415" transform="rotate(45 255 420)" />
              <polygon points="450,375 460,370 450,365" transform="rotate(30 455 370)" />
              <polygon points="600,275 610,270 600,265" transform="rotate(15 605 270)" />
            </g>

            {/* User Location */}
            <g className="user-pulse">
              <circle cx="100" cy="500" r="25" fill="#4285f4" opacity="0.3" />
              <circle cx="100" cy="500" r="15" fill="white" stroke="#4285f4" strokeWidth="3" />
              <circle cx="100" cy="500" r="8" fill="#4285f4" />
              <polygon points="100,492 105,500 100,508 95,500" fill="white" />
            </g>

            {/* Destination */}
            <g transform="translate(700, 150)">
              <path
                d="M 0,-20 C -8,-20 -15,-13 -15,-5 C -15,3 0,20 0,20 C 0,20 15,3 15,-5 C 15,-13 8,-20 0,-20 Z"
                fill="#ea4335"
              />
              <circle cx="0" cy="-5" r="6" fill="white" />
              <circle cx="0" cy="-5" r="3" fill="#ea4335" />
            </g>

            {/* Street Labels */}
            <text x="400" y="320" textAnchor="middle" fill="#5f6368" fontSize="14" fontFamily="system-ui">
              Main Route
            </text>
            <text x="120" y="520" fill="#5f6368" fontSize="12" fontFamily="system-ui">
              Current St
            </text>
            <text x="680" y="140" fill="#5f6368" fontSize="12" fontFamily="system-ui">
              Destination
            </text>
          </svg>

          {/* Offline Mode Indicator */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-900">Offline Navigation</span>
            </div>
            <div className="text-xs text-gray-600 mt-1">No internet required</div>
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
              <span>Offline navigation mode</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-green-600 font-medium">No internet required</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
