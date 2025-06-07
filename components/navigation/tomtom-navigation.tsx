"use client"

import { useEffect, useState, useRef } from "react"
import { useNavigationStore } from "@/lib/navigation-store"
import {
  ChevronLeft,
  Plus,
  Minus,
  Volume2,
  VolumeX,
  AlertTriangle,
  Phone,
  Menu,
  MapPin,
  ChevronUp,
  MoreVertical,
  ParkingSquare,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function TomTomNavigation({ onExit }: { onExit: () => void }) {
  const {
    currentRoute,
    currentStep,
    userLocation,
    destination,
    eta,
    remainingDistance,
    remainingTime,
    isRecalculating,
    settings,
    updateSettings,
  } = useNavigationStore()

  const [currentSpeed, setCurrentSpeed] = useState(63)
  const [showSettings, setShowSettings] = useState(false)
  const [showRouteOptions, setShowRouteOptions] = useState(false)
  const [trafficDelay, setTrafficDelay] = useState(5) // minutes
  const [progress, setProgress] = useState(0.35) // Route progress (0-1)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Simulate speed changes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSpeed((prev) => {
        const change = Math.random() > 0.5 ? 1 : -1
        return Math.max(25, Math.min(70, prev + change))
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Draw the 3D road view
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Draw sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.4)
    skyGradient.addColorStop(0, "#1a2b47")
    skyGradient.addColorStop(1, "#2c3e50")
    ctx.fillStyle = skyGradient
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.4)

    // Draw ground/landscape
    const groundGradient = ctx.createLinearGradient(0, canvas.height * 0.4, 0, canvas.height)
    groundGradient.addColorStop(0, "#2d4a22")
    groundGradient.addColorStop(1, "#1e3217")
    ctx.fillStyle = groundGradient
    ctx.fillRect(0, canvas.height * 0.4, canvas.width, canvas.height * 0.6)

    // Draw road
    ctx.save()
    ctx.beginPath()

    // Road perspective trapezoid
    const roadTop = canvas.height * 0.4
    const roadBottom = canvas.height
    const roadTopWidth = canvas.width * 0.5
    const roadBottomWidth = canvas.width * 0.9

    ctx.moveTo(canvas.width / 2 - roadTopWidth / 2, roadTop)
    ctx.lineTo(canvas.width / 2 + roadTopWidth / 2, roadTop)
    ctx.lineTo(canvas.width / 2 + roadBottomWidth / 2, roadBottom)
    ctx.lineTo(canvas.width / 2 - roadBottomWidth / 2, roadBottom)
    ctx.closePath()

    // Road surface
    ctx.fillStyle = "#333333"
    ctx.fill()

    // Draw lane markings
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 2

    // Center line
    ctx.beginPath()
    ctx.setLineDash([20, 20])
    ctx.moveTo(canvas.width / 2, roadTop)
    ctx.lineTo(canvas.width / 2, roadBottom)
    ctx.stroke()

    // Left lane marking
    ctx.beginPath()
    ctx.setLineDash([])
    ctx.moveTo(canvas.width / 2 - roadTopWidth / 4, roadTop)
    ctx.lineTo(canvas.width / 2 - roadBottomWidth / 4, roadBottom)
    ctx.stroke()

    // Right lane marking
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2 + roadTopWidth / 4, roadTop)
    ctx.lineTo(canvas.width / 2 + roadBottomWidth / 4, roadBottom)
    ctx.stroke()

    // Draw route guidance (blue overlay on right lane)
    ctx.fillStyle = "rgba(0, 179, 253, 0.3)"
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2, roadTop)
    ctx.lineTo(canvas.width / 2 + roadTopWidth / 4, roadTop)
    ctx.lineTo(canvas.width / 2 + roadBottomWidth / 4, roadBottom)
    ctx.lineTo(canvas.width / 2, roadBottom)
    ctx.closePath()
    ctx.fill()

    // Draw route arrows
    const drawArrow = (x: number, y: number, size: number) => {
      ctx.fillStyle = "#00b3fd"
      ctx.beginPath()
      ctx.moveTo(x, y - size / 2)
      ctx.lineTo(x + size / 2, y + size / 2)
      ctx.lineTo(x - size / 2, y + size / 2)
      ctx.closePath()
      ctx.fill()
    }

    // Draw multiple arrows down the route
    const routeCenterX = canvas.width / 2 + roadTopWidth / 8
    drawArrow(routeCenterX, roadTop + (roadBottom - roadTop) * 0.2, 15)
    drawArrow(routeCenterX, roadTop + (roadBottom - roadTop) * 0.4, 20)
    drawArrow(routeCenterX, roadTop + (roadBottom - roadTop) * 0.6, 25)

    ctx.restore()
  }, [])

  if (!currentRoute || !destination) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <h3 className="text-lg font-semibold mb-2">No Active Navigation</h3>
          <p className="text-gray-400 mb-4">Please select a destination to start navigation.</p>
          <Button onClick={onExit} variant="outline">
            Return to Map
          </Button>
        </div>
      </div>
    )
  }

  const currentStepData = currentRoute.steps[currentStep]
  const nextStep = currentRoute.steps[currentStep + 1]
  const formattedDistance =
    remainingDistance > 1000 ? `${(remainingDistance / 1000).toFixed(1)} km` : `${remainingDistance} m`
  const formattedTime =
    remainingTime > 3600
      ? `${Math.floor(remainingTime / 3600)}h ${Math.floor((remainingTime % 3600) / 60)}m`
      : `${Math.floor(remainingTime / 60)}m`

  // Format next maneuver distance
  const nextManeuverDistance = nextStep ? nextStep.distance : 0
  const formattedNextDistance =
    nextManeuverDistance < 1000
      ? `${Math.round(nextManeuverDistance)} m`
      : `${(nextManeuverDistance / 1000).toFixed(1)} km`

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white relative overflow-hidden">
      {/* 3D Road Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Top navigation bar */}
      <div className="relative z-10 flex justify-between items-center px-3 py-2 bg-gray-800/90">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onExit} className="text-white hover:bg-gray-700 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="text-sm font-medium">{destination.name}</div>
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <span>{formattedDistance}</span>
              <span>•</span>
              <span>{formattedTime}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-sm font-bold">
              {eta ? eta.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}
            </div>
            <div className="text-xs text-gray-300">ETA</div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => updateSettings({ voiceGuidance: !settings.voiceGuidance })}
            className="text-white hover:bg-gray-700 rounded-full"
          >
            {settings.voiceGuidance ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
            className="text-white hover:bg-gray-700 rounded-full"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Next maneuver banner */}
      <div className="relative z-10 bg-gray-800 px-4 py-3 border-t border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            {nextStep?.maneuver.type === "turn-right" && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 4L18 12L9 20" stroke="white" strokeWidth="3" strokeLinecap="round" />
                <path d="M18 12H4" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </svg>
            )}
            {nextStep?.maneuver.type === "turn-left" && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 4L6 12L15 20" stroke="white" strokeWidth="3" strokeLinecap="round" />
                <path d="M6 12H20" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </svg>
            )}
            {nextStep?.maneuver.type === "straight" && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L12 20" stroke="white" strokeWidth="3" strokeLinecap="round" />
                <path
                  d="M6 10L12 4L18 10"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {!nextStep && <MapPin className="w-6 h-6 text-white" />}
          </div>
          <div className="flex-1">
            <div className="font-bold text-lg">{nextStep ? nextStep.instruction : "You have arrived"}</div>
            {nextStep && <div className="text-gray-300 text-sm">{nextStep.streetName}</div>}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formattedNextDistance}</div>
          </div>
        </div>
      </div>

      {/* Traffic alert */}
      {trafficDelay > 0 && (
        <div className="relative z-10 bg-yellow-600/90 px-4 py-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-medium">Traffic ahead - {trafficDelay} min delay</span>
        </div>
      )}

      {/* Left side controls */}
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 bg-gray-800/80 rounded-full flex flex-col">
        <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700 rounded-full">
          <ChevronUp className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700 rounded-full">
          <Plus className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700 rounded-full">
          <Minus className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700 rounded-full">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Right side controls */}
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 flex flex-col gap-2">
        <Button variant="ghost" size="icon" className="bg-white/90 hover:bg-white rounded-full">
          <ParkingSquare className="h-5 w-5 text-blue-600" />
        </Button>
        <Button variant="ghost" size="icon" className="bg-white/90 hover:bg-white rounded-full">
          <User className="h-5 w-5 text-gray-700" />
        </Button>
      </div>

      {/* Bottom info bar */}
      <div className="relative z-10 mt-auto">
        {/* Progress bar */}
        <div className="h-1 bg-gray-700 w-full">
          <div className="h-full bg-blue-500" style={{ width: `${progress * 100}%` }}></div>
        </div>

        {/* Speed and distance info */}
        <div className="flex justify-between items-center px-4 py-3 bg-gray-800/90">
          <div className="flex items-center gap-4">
            {/* Speed limit */}
            <div className="bg-white rounded-full border-4 border-red-600 w-14 h-14 flex items-center justify-center">
              <div className="text-center">
                <div className="font-bold text-lg text-black">{currentStepData.speedLimit || 65}</div>
                <div className="text-xs -mt-1 text-black">mph</div>
              </div>
            </div>

            {/* Current speed */}
            <div className="text-center">
              <div className="font-bold text-3xl">{currentSpeed}</div>
              <div className="text-sm text-gray-300">mph</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRouteOptions(!showRouteOptions)}
              className="h-9 border-gray-600 text-white hover:bg-gray-700"
            >
              Routes
            </Button>
            <Button size="sm" className="h-9 bg-blue-600 hover:bg-blue-700 text-white">
              <Phone className="w-4 h-4 mr-1" />
              Call
            </Button>
          </div>
        </div>
      </div>

      {/* Settings overlay */}
      {showSettings && (
        <div className="absolute inset-0 z-20 bg-black/80 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg w-4/5 max-w-md p-4">
            <h3 className="text-lg font-bold mb-4">Navigation Settings</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Map Style</span>
                <select
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1"
                  value={settings.mapStyle}
                  onChange={(e) => updateSettings({ mapStyle: e.target.value as any })}
                >
                  <option value="navigation">Navigation</option>
                  <option value="satellite">Satellite</option>
                  <option value="terrain">Terrain</option>
                  <option value="street">Street</option>
                </select>
              </div>
              <div className="flex justify-between items-center">
                <span>View Mode</span>
                <select
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1"
                  value={settings.viewMode}
                  onChange={(e) => updateSettings({ viewMode: e.target.value as any })}
                >
                  <option value="3d">3D</option>
                  <option value="2d">2D</option>
                  <option value="bird-eye">Bird's Eye</option>
                  <option value="follow">Follow</option>
                </select>
              </div>
              <div className="flex justify-between items-center">
                <span>Voice Guidance</span>
                <div
                  className={`w-10 h-6 rounded-full relative cursor-pointer ${
                    settings.voiceGuidance ? "bg-blue-600" : "bg-gray-600"
                  }`}
                  onClick={() => updateSettings({ voiceGuidance: !settings.voiceGuidance })}
                >
                  <div
                    className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-all ${
                      settings.voiceGuidance ? "left-5" : "left-1"
                    }`}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>Show Traffic</span>
                <div
                  className={`w-10 h-6 rounded-full relative cursor-pointer ${
                    settings.showTraffic ? "bg-blue-600" : "bg-gray-600"
                  }`}
                  onClick={() => updateSettings({ showTraffic: !settings.showTraffic })}
                >
                  <div
                    className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-all ${
                      settings.showTraffic ? "left-5" : "left-1"
                    }`}
                  ></div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setShowSettings(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Route options overlay */}
      {showRouteOptions && (
        <div className="absolute inset-0 z-20 bg-black/80 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg w-4/5 max-w-md p-4">
            <h3 className="text-lg font-bold mb-4">Route Options</h3>
            <div className="space-y-3">
              <div className="bg-gray-700 rounded p-3 border-l-4 border-blue-500">
                <div className="flex justify-between">
                  <span className="font-medium">Current Route</span>
                  <span className="text-blue-400">{formattedTime}</span>
                </div>
                <div className="text-sm text-gray-300">Via Highway 101</div>
              </div>
              <div className="bg-gray-700 rounded p-3">
                <div className="flex justify-between">
                  <span className="font-medium">Alternative 1</span>
                  <span>{Math.floor(remainingTime / 60) + 8}m</span>
                </div>
                <div className="text-sm text-gray-300">Via Downtown</div>
              </div>
              <div className="bg-gray-700 rounded p-3">
                <div className="flex justify-between">
                  <span className="font-medium">Alternative 2</span>
                  <span>{Math.floor(remainingTime / 60) + 15}m</span>
                </div>
                <div className="text-sm text-gray-300">Avoid Highways</div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setShowRouteOptions(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Recalculating overlay */}
      {isRecalculating && (
        <div className="absolute inset-0 z-30 bg-black/50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-600 rounded-full animate-spin mb-4"></div>
            <h3 className="text-lg font-bold">Recalculating Route</h3>
            <p className="text-gray-300 mt-2">Finding the best route for you...</p>
          </div>
        </div>
      )}
    </div>
  )
}
