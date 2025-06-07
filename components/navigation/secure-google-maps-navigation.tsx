"use client"

import { useEffect, useRef, useState } from "react"
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

interface SecureGoogleMapsNavigationProps {
  onExit: () => void
}

export function SecureGoogleMapsNavigation({ onExit }: SecureGoogleMapsNavigationProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
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

  // Create beautiful navigation map without any external dependencies
  useEffect(() => {
    if (!mapContainer.current) return

    console.log("🗺️ Creating secure Google Maps-style navigation")

    mapContainer.current.innerHTML = `
      <div style="
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        position: relative;
        overflow: hidden;
      ">
        <!-- Realistic street pattern -->
        <svg width="100%" height="100%" style="position: absolute; top: 0; left: 0; opacity: 0.8;">
          <defs>
            <pattern id="cityGrid" width="100" height="100" patternUnits="userSpaceOnUse">
              <rect width="100" height="100" fill="#f1f5f9"/>
              <!-- Main streets -->
              <rect x="0" y="45" width="100" height="10" fill="#e2e8f0"/>
              <rect x="45" y="0" width="10" height="100" fill="#e2e8f0"/>
              <!-- Side streets -->
              <rect x="0" y="20" width="100" height="4" fill="#f1f5f9"/>
              <rect x="0" y="75" width="100" height="4" fill="#f1f5f9"/>
              <rect x="20" y="0" width="4" height="100" fill="#f1f5f9"/>
              <rect x="75" y="0" width="4" height="100" fill="#f1f5f9"/>
              <!-- Buildings -->
              <rect x="5" y="5" width="15" height="15" fill="#cbd5e1" opacity="0.6"/>
              <rect x="25" y="5" width="15" height="15" fill="#cbd5e1" opacity="0.6"/>
              <rect x="60" y="5" width="15" height="15" fill="#cbd5e1" opacity="0.6"/>
              <rect x="80" y="5" width="15" height="15" fill="#cbd5e1" opacity="0.6"/>
              <rect x="5" y="25" width="15" height="15" fill="#cbd5e1" opacity="0.6"/>
              <rect x="25" y="25" width="15" height="15" fill="#cbd5e1" opacity="0.6"/>
              <rect x="60" y="25" width="15" height="15" fill="#cbd5e1" opacity="0.6"/>
              <rect x="80" y="25" width="15" height="15" fill="#cbd5e1" opacity="0.6"/>
              <rect x="5" y="60" width="15" height="15" fill="#cbd5e1" opacity="0.6"/>
              <rect x="25" y="60" width="15" height="15" fill="#cbd5e1" opacity="0.6"/>
              <rect x="60" y="60" width="15" height="15" fill="#cbd5e1" opacity="0.6"/>
              <rect x="80" y="60" width="15" height="15" fill="#cbd5e1" opacity="0.6"/>
              <rect x="5" y="80" width="15" height="15" fill="#cbd5e1" opacity="0.6"/>
              <rect x="25" y="80" width="15" height="15" fill="#cbd5e1" opacity="0.6"/>
              <rect x="60" y="80" width="15" height="15" fill="#cbd5e1" opacity="0.6"/>
              <rect x="80" y="80" width="15" height="15" fill="#cbd5e1" opacity="0.6"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cityGrid)"/>
        </svg>
        
        <!-- Google Maps style route -->
        <svg width="100%" height="100%" style="position: absolute; top: 0; left: 0;">
          <!-- Route shadow for depth -->
          <path d="M 15% 85% Q 30% 65% 45% 45% Q 65% 25% 85% 15%" 
                stroke="#1a73e8" 
                strokeWidth="16" 
                fill="none" 
                strokeLinecap="round"
                opacity="0.3"/>
          
          <!-- Main Google blue route -->
          <path d="M 15% 85% Q 30% 65% 45% 45% Q 65% 25% 85% 15%" 
                stroke="#4285f4" 
                strokeWidth="10" 
                fill="none" 
                strokeLinecap="round"/>
          
          <!-- Direction arrows along route -->
          <g transform="translate(30%, 65%) rotate(-25)">
            <polygon points="-5,-10 5,0 -5,10" fill="white" stroke="#4285f4" strokeWidth="1"/>
          </g>
          <g transform="translate(45%, 45%) rotate(0)">
            <polygon points="-5,-10 5,0 -5,10" fill="white" stroke="#4285f4" strokeWidth="1"/>
          </g>
          <g transform="translate(65%, 25%) rotate(25)">
            <polygon points="-5,-10 5,0 -5,10" fill="white" stroke="#4285f4" strokeWidth="1"/>
          </g>
          
          <!-- User location with Google-style pulsing -->
          <g>
            <!-- Outer pulse -->
            <circle cx="15%" cy="85%" r="20" fill="#4285f4" opacity="0.2">
              <animate attributeName="r" values="20;30;20" dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.2;0.05;0.2" dur="2s" repeatCount="indefinite"/>
            </circle>
            <!-- Middle pulse -->
            <circle cx="15%" cy="85%" r="15" fill="#4285f4" opacity="0.4">
              <animate attributeName="r" values="15;20;15" dur="1.5s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.4;0.1;0.4" dur="1.5s" repeatCount="indefinite"/>
            </circle>
            <!-- User dot -->
            <circle cx="15%" cy="85%" r="12" fill="white" stroke="#4285f4" strokeWidth="3"/>
            <circle cx="15%" cy="85%" r="8" fill="#4285f4"/>
            <!-- Direction indicator -->
            <g transform="translate(15%, 85%) rotate(-25)">
              <polygon points="0,-6 3,0 0,6 -3,0" fill="white"/>
            </g>
          </g>
          
          <!-- Destination marker (Google red) -->
          <circle cx="85%" cy="15%" r="18" fill="white" stroke="#ea4335" strokeWidth="3"/>
          <circle cx="85%" cy="15%" r="14" fill="#ea4335"/>
          <circle cx="85%" cy="15%" r="5" fill="white"/>
          
          <!-- Street labels -->
          <text x="50%" y="52%" textAnchor="middle" fill="#6b7280" fontSize="10" fontFamily="Arial, sans-serif">Main Route</text>
          <text x="20%" y="92%" fill="#6b7280" fontSize="8" fontFamily="Arial, sans-serif">Current Street</text>
        </svg>
        
        <!-- Navigation status overlay -->
        <div style="
          position: absolute;
          top: 20px;
          left: 20px;
          background: rgba(255, 255, 255, 0.95);
          padding: 12px 16px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          font-size: 14px;
          color: #374151;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
        ">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="
              width: 8px;
              height: 8px;
              background: #10b981;
              border-radius: 50%;
              animation: statusPulse 2s infinite;
            "></div>
            <span style="font-weight: 500;">Navigation Active</span>
          </div>
          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
            Following route to ${destination?.name || "destination"}
          </div>
        </div>
        
        <!-- Traffic info -->
        <div style="
          position: absolute;
          bottom: 20px;
          left: 20px;
          background: rgba(255, 255, 255, 0.95);
          padding: 8px 12px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          font-size: 12px;
          color: #374151;
          backdrop-filter: blur(10px);
        ">
          <div style="display: flex; align-items: center; gap: 6px;">
            <div style="width: 6px; height: 6px; background: #10b981; border-radius: 50%;"></div>
            <span>Light traffic</span>
          </div>
        </div>
        
        <style>
          @keyframes statusPulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.3); }
          }
        </style>
      </div>
    `

    setMapLoaded(true)
  }, [userLocation, destination, currentRoute])

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
              onClick={() => {
                updateSettings({ voiceGuidance: !settings.voiceGuidance })
                toast({
                  title: settings.voiceGuidance ? "Voice guidance off" : "Voice guidance on",
                  duration: 2000,
                })
              }}
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

      {/* Main Map */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full" style={{ minHeight: "400px" }} />

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
      </div>

      {/* Google Maps Bottom Sheet */}
      <div className="bg-white border-t border-gray-200 shadow-lg relative z-10">
        <div className="px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
              {getTurnIcon()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-base font-medium text-gray-900 truncate">{getNextInstruction()}</div>
              {nextStep && <div className="text-sm text-gray-600 mt-1 truncate">on {nextStep.streetName}</div>}
            </div>

            <div className="text-right flex-shrink-0">
              <div className="text-xl font-bold text-gray-900">
                {navigationService.formatDistance(getNextDistance())}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 px-4 py-3">
          <div className="flex items-center justify-between">
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

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 h-8 px-3 text-sm">
                <Phone className="w-3 h-3 mr-2" />
                Call
              </Button>

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

        <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-3 h-3" />
              <span>Secure navigation active</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-green-600 font-medium text-xs">No API keys exposed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
