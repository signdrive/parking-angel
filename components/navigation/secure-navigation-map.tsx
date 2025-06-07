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

interface SecureNavigationMapProps {
  onExit: () => void
}

export function SecureNavigationMap({ onExit }: SecureNavigationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
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

  // Initialize secure map
  useEffect(() => {
    const initializeSecureMap = async () => {
      try {
        // Check if secure map is available
        const response = await fetch("/api/mapbox/secure-config")
        const config = await response.json()

        if (config.available) {
          // Try to load Leaflet for map rendering (no API keys needed for basic functionality)
          await loadLeafletMap()
        } else {
          createBeautifulFallbackMap()
        }
      } catch (error) {
        console.error("Map initialization error:", error)
        createBeautifulFallbackMap()
      }
    }

    const loadLeafletMap = async () => {
      try {
        // Use Leaflet with OpenStreetMap tiles (no API key required)
        const L = await import("leaflet")

        if (!mapContainer.current) return

        const map = L.map(mapContainer.current).setView(
          userLocation ? [userLocation.latitude, userLocation.longitude] : [37.7749, -122.4194],
          16,
        )

        // Use OpenStreetMap tiles (free, no API key required)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(map)

        // Add route if available
        if (currentRoute && currentRoute.geometry) {
          const routeCoords = currentRoute.geometry.map((coord: [number, number]) => [coord[1], coord[0]])
          L.polyline(routeCoords, { color: "#4285f4", weight: 8, opacity: 0.8 }).addTo(map)
        }

        // Add user location marker
        if (userLocation) {
          const userIcon = L.divIcon({
            html: `<div style="
              width: 20px;
              height: 20px;
              background: #4285f4;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            "></div>`,
            className: "user-location-marker",
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          })

          L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon }).addTo(map)
        }

        // Add destination marker
        if (destination) {
          const destIcon = L.divIcon({
            html: `<div style="
              width: 32px;
              height: 32px;
              background: #ea4335;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                width: 8px;
                height: 8px;
                background: white;
                border-radius: 50%;
              "></div>
            </div>`,
            className: "destination-marker",
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          })

          L.marker([destination.latitude, destination.longitude], { icon: destIcon }).addTo(map)
        }

        setMapLoaded(true)
      } catch (error) {
        console.error("Leaflet map error:", error)
        createBeautifulFallbackMap()
      }
    }

    const createBeautifulFallbackMap = () => {
      if (!mapContainer.current) return

      console.log("🔄 Creating beautiful secure fallback map")

      mapContainer.current.innerHTML = `
        <div style="
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          position: relative;
          overflow: hidden;
        ">
          <!-- Realistic street grid -->
          <svg width="100%" height="100%" style="position: absolute; top: 0; left: 0; opacity: 0.6;">
            <defs>
              <pattern id="streets" width="120" height="120" patternUnits="userSpaceOnUse">
                <rect width="120" height="120" fill="#f1f5f9"/>
                <!-- Horizontal streets -->
                <rect x="0" y="50" width="120" height="20" fill="#e2e8f0"/>
                <!-- Vertical streets -->
                <rect x="50" y="0" width="20" height="120" fill="#e2e8f0"/>
                <!-- Buildings -->
                <rect x="10" y="10" width="30" height="30" fill="#cbd5e1" opacity="0.7"/>
                <rect x="80" y="10" width="30" height="30" fill="#cbd5e1" opacity="0.7"/>
                <rect x="10" y="80" width="30" height="30" fill="#cbd5e1" opacity="0.7"/>
                <rect x="80" y="80" width="30" height="30" fill="#cbd5e1" opacity="0.7"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#streets)"/>
          </svg>
          
          <!-- Navigation route -->
          <svg width="100%" height="100%" style="position: absolute; top: 0; left: 0;">
            <!-- Route shadow -->
            <path d="M 10% 90% Q 25% 70% 40% 50% Q 60% 30% 90% 20%" 
                  stroke="#1a73e8" 
                  strokeWidth="14" 
                  fill="none" 
                  strokeLinecap="round"
                  opacity="0.4"/>
            
            <!-- Main route -->
            <path d="M 10% 90% Q 25% 70% 40% 50% Q 60% 30% 90% 20%" 
                  stroke="#4285f4" 
                  strokeWidth="8" 
                  fill="none" 
                  strokeLinecap="round"/>
            
            <!-- Direction arrows -->
            <g transform="translate(25%, 70%) rotate(-30)">
              <polygon points="-4,-8 4,0 -4,8" fill="#4285f4"/>
            </g>
            <g transform="translate(60%, 30%) rotate(30)">
              <polygon points="-4,-8 4,0 -4,8" fill="#4285f4"/>
            </g>
            
            <!-- User location with pulsing animation -->
            <g>
              <circle cx="10%" cy="90%" r="15" fill="#4285f4" opacity="0.3">
                <animate attributeName="r" values="15;25;15" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="10%" cy="90%" r="10" fill="white" stroke="#4285f4" strokeWidth="3"/>
              <circle cx="10%" cy="90%" r="6" fill="#4285f4"/>
            </g>
            
            <!-- Destination marker -->
            <circle cx="90%" cy="20%" r="16" fill="white" stroke="#ea4335" strokeWidth="3"/>
            <circle cx="90%" cy="20%" r="12" fill="#ea4335"/>
            <circle cx="90%" cy="20%" r="4" fill="white"/>
          </svg>
          
          <!-- Status overlay -->
          <div style="
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(255, 255, 255, 0.95);
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            font-size: 14px;
            color: #374151;
            backdrop-filter: blur(10px);
          ">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="
                width: 8px;
                height: 8px;
                background: #10b981;
                border-radius: 50%;
                animation: pulse 2s infinite;
              "></div>
              Secure Navigation Active
            </div>
          </div>
          
          <style>
            @keyframes pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.5; transform: scale(1.2); }
            }
          </style>
        </div>
      `

      setMapLoaded(true)
    }

    initializeSecureMap()
  }, [userLocation, destination, currentRoute])

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
          <p className="text-gray-600">Loading secure navigation...</p>
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

      {mapError && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-2 relative z-10">
          <div className="flex items-center gap-2 text-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm font-medium">Secure navigation mode active</span>
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
              <span>Secure navigation mode</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-green-600 font-medium text-xs">Protected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
