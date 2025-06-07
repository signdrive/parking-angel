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

interface GoogleMapsNavigationProps {
  onExit: () => void
}

export function GoogleMapsNavigation({ onExit }: GoogleMapsNavigationProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
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

  // Initialize map with secure token fetching
  useEffect(() => {
    let mounted = true
    let map: any = null

    const loadMap = async () => {
      try {
        if (!mapContainer.current) return

        console.log("🗺️ Loading Mapbox map...")

        // Securely fetch token from API route
        try {
          const response = await fetch("/api/mapbox/token")
          if (response.ok) {
            const data = await response.json()
            if (data.token) {
              await initializeMap(data.token)
            } else {
              throw new Error("No token received from API")
            }
          } else {
            throw new Error("Failed to fetch token from API")
          }
        } catch (apiError) {
          console.error("API token fetch failed:", apiError)
          // Fallback to a beautiful map visualization
          createFallbackMap()
        }
      } catch (error) {
        console.error("Map loading error:", error)
        setMapError("Failed to load map")
        createFallbackMap()
      }
    }

    const initializeMap = async (token: string) => {
      try {
        // Dynamically import Mapbox GL
        const mapboxgl = await import("mapbox-gl")

        if (!mounted || !mapContainer.current) return

        mapboxgl.accessToken = token

        map = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/streets-v12",
          center: userLocation ? [userLocation.longitude, userLocation.latitude] : [-122.4194, 37.7749],
          zoom: 16,
          pitch: 0,
          bearing: 0,
          attributionControl: false,
        })

        mapRef.current = map

        map.on("load", () => {
          if (!mounted) return
          console.log("✅ Mapbox map loaded successfully")
          addRouteToMap(map)
          setMapLoaded(true)
        })

        map.on("error", (e: any) => {
          console.error("Mapbox error:", e)
          setMapError("Map failed to load")
          createFallbackMap()
        })
      } catch (error) {
        console.error("Mapbox initialization error:", error)
        createFallbackMap()
      }
    }

    const addRouteToMap = (map: any) => {
      try {
        if (currentRoute) {
          // Add route source
          map.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: currentRoute.geometry,
              },
            },
          })

          // Route shadow
          map.addLayer({
            id: "route-shadow",
            type: "line",
            source: "route",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#1a73e8",
              "line-width": 14,
              "line-opacity": 0.4,
            },
          })

          // Main route
          map.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#4285f4",
              "line-width": 8,
              "line-opacity": 1,
            },
          })

          // Add markers
          addMarkersToMap(map)
        }
      } catch (error) {
        console.error("Error adding route to map:", error)
      }
    }

    const addMarkersToMap = (map: any) => {
      try {
        // Add destination marker
        if (destination) {
          const destinationEl = document.createElement("div")
          destinationEl.innerHTML = `
            <div style="
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
            </div>
          `
          new map.constructor.Marker({ element: destinationEl })
            .setLngLat([destination.longitude, destination.latitude])
            .addTo(map)
        }

        // Add user location marker
        if (userLocation) {
          const userEl = document.createElement("div")
          userEl.innerHTML = `
            <div style="
              width: 20px;
              height: 20px;
              background: #4285f4;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              position: relative;
            ">
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 6px;
                height: 6px;
                background: white;
                border-radius: 50%;
              "></div>
            </div>
          `
          new map.constructor.Marker({ element: userEl })
            .setLngLat([userLocation.longitude, userLocation.latitude])
            .addTo(map)
        }
      } catch (error) {
        console.error("Error adding markers:", error)
      }
    }

    const createFallbackMap = () => {
      if (!mapContainer.current || !mounted) return

      console.log("🔄 Creating beautiful fallback map")

      // Create a beautiful Google Maps-style fallback
      mapContainer.current.innerHTML = `
        <div style="
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        ">
          <!-- Street grid background -->
          <svg width="100%" height="100%" style="position: absolute; top: 0; left: 0; opacity: 0.3;">
            <defs>
              <pattern id="streets" width="80" height="80" patternUnits="userSpaceOnUse">
                <rect width="80" height="80" fill="#f1f5f9"/>
                <rect x="0" y="35" width="80" height="10" fill="#e2e8f0"/>
                <rect x="35" y="0" width="10" height="80" fill="#e2e8f0"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#streets)"/>
          </svg>
          
          <!-- Route visualization -->
          <svg width="100%" height="100%" style="position: absolute; top: 0; left: 0;">
            <!-- Route shadow -->
            <path d="M 15% 85% Q 30% 60% 50% 45% T 85% 35%" 
                  stroke="#1a73e8" 
                  strokeWidth="12" 
                  fill="none" 
                  strokeLinecap="round"
                  opacity="0.4"/>
            
            <!-- Main route -->
            <path d="M 15% 85% Q 30% 60% 50% 45% T 85% 35%" 
                  stroke="#4285f4" 
                  strokeWidth="8" 
                  fill="none" 
                  strokeLinecap="round"/>
            
            <!-- User location (blue dot) -->
            <circle cx="15%" cy="85%" r="10" fill="white" stroke="#4285f4" strokeWidth="3"/>
            <circle cx="15%" cy="85%" r="6" fill="#4285f4"/>
            
            <!-- Destination (red dot) -->
            <circle cx="85%" cy="35%" r="16" fill="white" stroke="#ea4335" strokeWidth="3"/>
            <circle cx="85%" cy="35%" r="12" fill="#ea4335"/>
            <circle cx="85%" cy="35%" r="4" fill="white"/>
            
            <!-- Direction arrow on route -->
            <g transform="translate(50%, 45%) rotate(45)">
              <polygon points="-4,-8 4,0 -4,8" fill="#4285f4"/>
            </g>
          </svg>
          
          <!-- Navigation info overlay -->
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.95);
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 320px;
            backdrop-filter: blur(10px);
          ">
            <div style="
              font-size: 20px; 
              font-weight: 600; 
              color: #1f2937; 
              margin-bottom: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
            ">
              <div style="
                width: 8px;
                height: 8px;
                background: #10b981;
                border-radius: 50%;
                animation: pulse 2s infinite;
              "></div>
              Navigation Active
            </div>
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">
              Following route to<br><strong>${destination?.name || "destination"}</strong>
            </div>
            <div style="
              font-size: 12px; 
              color: #9ca3af;
              padding: 8px 12px;
              background: #f3f4f6;
              border-radius: 6px;
            ">
              Using offline navigation mode
            </div>
          </div>
          
          <style>
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          </style>
        </div>
      `

      setMapLoaded(true)
    }

    loadMap()

    return () => {
      mounted = false
      if (map) {
        try {
          map.remove()
        } catch (error) {
          console.error("Error removing map:", error)
        }
      }
    }
  }, [userLocation, destination, currentRoute])

  // Simulate realistic updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSpeed(Math.floor(Math.random() * 15) + 20) // 20-35 mph
      setShowSpeedCamera(Math.random() > 0.9) // Rarely show speed camera
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

  // Get next turn instruction
  const getNextInstruction = () => {
    if (!nextStep) return "Continue to destination"
    return nextStep.instruction
  }

  // Get next turn distance
  const getNextDistance = () => {
    if (!nextStep) return remainingDistance
    return nextStep.distance
  }

  // Get turn icon for Google Maps style
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
          {/* Left side - Back button and destination */}
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

          {/* Right side - Controls */}
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
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 relative z-10">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Using offline map • {mapError}</span>
          </div>
        </div>
      )}

      {/* Main Map */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full" style={{ minHeight: "400px" }} />

        {/* Speed limit (Google Maps style) */}
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
