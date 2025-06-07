"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useNavigationStore } from "@/lib/navigation-store"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Phone,
  Volume2,
  VolumeX,
  MoreHorizontal,
  Navigation,
  Clock,
  AlertTriangle,
  ArrowUp,
  Zap,
} from "lucide-react"

interface BulletproofNavigationProps {
  onExit: () => void
}

export function BulletproofNavigation({ onExit }: BulletproofNavigationProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [currentSpeed, setCurrentSpeed] = useState(63)
  const [mapboxToken, setMapboxToken] = useState<string | null>(null)
  const [useAdvancedFallback, setUseAdvancedFallback] = useState(false)

  const { currentRoute, destination, settings, updateSettings, userLocation } = useNavigationStore()

  // Professional navigation data
  const navigationData = {
    nextInstruction: "Continue straight on Main Route",
    streetName: "Interstate 101 North",
    distance: "2.1 mi",
    totalDistance: "1.4 mi",
    duration: "12 min",
    eta: "18:23",
    speedLimit: 65,
    currentSpeed: currentSpeed,
    trafficDelay: "5 min delay",
    maneuverType: "straight" as const,
  }

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Realistic speed simulation
  useEffect(() => {
    const speedTimer = setInterval(() => {
      setCurrentSpeed((prev) => {
        const change = (Math.random() - 0.5) * 2
        return Math.max(58, Math.min(68, prev + change))
      })
    }, 3000)
    return () => clearInterval(speedTimer)
  }, [])

  // Advanced Canvas-based Navigation Renderer
  const renderAdvancedNavigation = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = canvas.offsetWidth
    const height = canvas.offsetHeight

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.4)
    skyGradient.addColorStop(0, "#87CEEB")
    skyGradient.addColorStop(0.5, "#98D8E8")
    skyGradient.addColorStop(1, "#B0E0E6")
    ctx.fillStyle = skyGradient
    ctx.fillRect(0, 0, width, height * 0.4)

    // Clouds
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
    ctx.beginPath()
    ctx.arc(width * 0.2, height * 0.15, 30, 0, Math.PI * 2)
    ctx.arc(width * 0.25, height * 0.15, 25, 0, Math.PI * 2)
    ctx.arc(width * 0.3, height * 0.15, 20, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(width * 0.7, height * 0.1, 35, 0, Math.PI * 2)
    ctx.arc(width * 0.75, height * 0.1, 30, 0, Math.PI * 2)
    ctx.arc(width * 0.8, height * 0.1, 25, 0, Math.PI * 2)
    ctx.fill()

    // Landscape
    const landscapeGradient = ctx.createLinearGradient(0, height * 0.4, 0, height * 0.7)
    landscapeGradient.addColorStop(0, "#90EE90")
    landscapeGradient.addColorStop(1, "#228B22")
    ctx.fillStyle = landscapeGradient
    ctx.fillRect(0, height * 0.4, width, height * 0.3)

    // Buildings in distance
    ctx.fillStyle = "#696969"
    for (let i = 0; i < 8; i++) {
      const x = (width / 8) * i + width * 0.1
      const buildingHeight = 20 + Math.random() * 40
      ctx.fillRect(x, height * 0.4 - buildingHeight, 30, buildingHeight)
    }

    // Highway perspective
    const roadY = height * 0.7
    const roadHeight = height * 0.3

    // Road surface with perspective
    ctx.fillStyle = "#2F2F2F"
    ctx.beginPath()
    ctx.moveTo(width * 0.3, roadY)
    ctx.lineTo(width * 0.7, roadY)
    ctx.lineTo(width * 0.9, height)
    ctx.lineTo(width * 0.1, height)
    ctx.closePath()
    ctx.fill()

    // Lane markings with perspective
    ctx.strokeStyle = "#FFFFFF"
    ctx.lineWidth = 2

    // Center line (yellow)
    ctx.strokeStyle = "#FFD700"
    ctx.lineWidth = 3
    ctx.setLineDash([15, 10])
    ctx.beginPath()
    ctx.moveTo(width * 0.5, roadY)
    ctx.lineTo(width * 0.5, height)
    ctx.stroke()

    // Side lane markings
    ctx.strokeStyle = "#FFFFFF"
    ctx.lineWidth = 2
    ctx.setLineDash([10, 15])

    // Left lane
    ctx.beginPath()
    ctx.moveTo(width * 0.4, roadY)
    ctx.lineTo(width * 0.3, height)
    ctx.stroke()

    // Right lane
    ctx.beginPath()
    ctx.moveTo(width * 0.6, roadY)
    ctx.lineTo(width * 0.7, height)
    ctx.stroke()

    // Route guidance arrows
    ctx.fillStyle = "#4285F4"
    ctx.setLineDash([])

    const arrowPositions = [
      { x: width * 0.5, y: height * 0.85 },
      { x: width * 0.5, y: height * 0.9 },
      { x: width * 0.5, y: height * 0.95 },
    ]

    arrowPositions.forEach((pos, index) => {
      ctx.save()
      ctx.translate(pos.x, pos.y)
      ctx.globalAlpha = 0.8 - index * 0.2

      // Arrow shape
      ctx.beginPath()
      ctx.moveTo(0, -15)
      ctx.lineTo(-8, -5)
      ctx.lineTo(-3, -5)
      ctx.lineTo(-3, 5)
      ctx.lineTo(3, 5)
      ctx.lineTo(3, -5)
      ctx.lineTo(8, -5)
      ctx.closePath()
      ctx.fill()

      ctx.restore()
    })

    // Road signs
    ctx.fillStyle = "#228B22"
    ctx.fillRect(width * 0.85, height * 0.45, 80, 30)
    ctx.fillStyle = "#FFFFFF"
    ctx.font = "12px Arial"
    ctx.textAlign = "center"
    ctx.fillText("EXIT 42", width * 0.85 + 40, height * 0.45 + 20)

    // Highway shield
    ctx.fillStyle = "#FF0000"
    ctx.fillRect(width * 0.15, height * 0.5, 60, 40)
    ctx.fillStyle = "#FFFFFF"
    ctx.font = "bold 16px Arial"
    ctx.textAlign = "center"
    ctx.fillText("101", width * 0.15 + 30, height * 0.5 + 25)

    // Animate the scene
    requestAnimationFrame(renderAdvancedNavigation)
  }, [])

  // Initialize advanced fallback after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setUseAdvancedFallback(true)
      if (canvasRef.current) {
        renderAdvancedNavigation()
      }
    }, 3000) // Show advanced fallback after 3 seconds

    return () => clearTimeout(timer)
  }, [renderAdvancedNavigation])

  // Attempt Mapbox initialization with comprehensive error handling
  useEffect(() => {
    let mounted = true
    let retryCount = 0
    const maxRetries = 3

    const initializeMapbox = async () => {
      try {
        console.log(`🗺️ Attempting Mapbox initialization (attempt ${retryCount + 1}/${maxRetries})...`)

        // Fetch token with timeout
        const tokenResponse = await Promise.race([
          fetch("/api/mapbox/token"),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Token fetch timeout")), 5000)),
        ])

        if (!tokenResponse.ok) {
          throw new Error(`Token fetch failed: ${tokenResponse.status}`)
        }

        const tokenData = await tokenResponse.json()
        if (!tokenData.token) {
          throw new Error("No token received")
        }

        setMapboxToken(tokenData.token)

        // Dynamic import with timeout
        const mapboxgl = await Promise.race([
          import("mapbox-gl"),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Mapbox import timeout")), 10000)),
        ])

        if (!mounted || !mapContainer.current) return

        mapboxgl.accessToken = tokenData.token

        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/navigation-day-v1",
          center: [-122.4194, 37.7749],
          zoom: 16,
          pitch: 60,
          bearing: 0,
          attributionControl: false,
        })

        mapRef.current = map

        map.on("load", () => {
          if (!mounted) return
          console.log("✅ Mapbox loaded successfully!")
          setMapLoaded(true)
          setUseAdvancedFallback(false)
        })

        map.on("error", (e) => {
          console.error("❌ Mapbox error:", e)
          if (mounted) {
            setUseAdvancedFallback(true)
          }
        })
      } catch (error) {
        console.error(`❌ Mapbox initialization failed (attempt ${retryCount + 1}):`, error)
        retryCount++

        if (retryCount < maxRetries && mounted) {
          console.log(`🔄 Retrying in ${retryCount * 2} seconds...`)
          setTimeout(initializeMapbox, retryCount * 2000)
        } else {
          console.log("🎯 Using advanced navigation fallback")
          setUseAdvancedFallback(true)
        }
      }
    }

    initializeMapbox()

    return () => {
      mounted = false
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Professional Navigation Header */}
      <div className="bg-white shadow-sm border-b px-4 py-2 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onExit} className="rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <div>
              <div className="font-medium text-sm">{destination?.name || "Parking Area"}</div>
              <div className="text-xs text-gray-500">
                {navigationData.totalDistance} • {navigationData.duration}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right text-sm">
            <div className="font-medium">
              {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="text-xs text-gray-500">ETA {navigationData.eta}</div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => updateSettings({ voiceGuidance: !settings.voiceGuidance })}
            className="rounded-full hover:bg-gray-100"
          >
            {settings.voiceGuidance ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>

          <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Navigation Area */}
      <div className="flex-1 relative">
        {/* Map Container */}
        {mapLoaded && !useAdvancedFallback && <div ref={mapContainer} className="w-full h-full" />}

        {/* Advanced Canvas Navigation */}
        {useAdvancedFallback && <canvas ref={canvasRef} className="w-full h-full" style={{ display: "block" }} />}

        {/* Loading State */}
        {!mapLoaded && !useAdvancedFallback && (
          <div className="w-full h-full bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center">
            <div className="text-center text-white">
              <Navigation className="w-12 h-12 mx-auto mb-4 animate-pulse" />
              <p className="text-lg font-medium">Loading professional navigation...</p>
              <p className="text-sm opacity-80 mt-2">Initializing map services...</p>
            </div>
          </div>
        )}

        {/* Navigation Instruction Card */}
        <div className="absolute top-4 left-4 right-4 bg-white rounded-xl shadow-lg p-4 z-10 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg">
              <ArrowUp className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-lg text-gray-900">{navigationData.nextInstruction}</div>
              <div className="text-gray-600 text-sm">on {navigationData.streetName}</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">{navigationData.distance}</div>
              <div className="text-sm text-gray-500">to turn</div>
            </div>
          </div>
        </div>

        {/* Traffic Alert */}
        <div className="absolute top-24 right-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg z-10 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">Traffic ahead • {navigationData.trafficDelay}</span>
        </div>

        {/* Speed Display */}
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex items-center gap-6 z-10">
          {/* Speed Limit */}
          <div className="bg-white border-4 border-red-500 rounded-full w-20 h-20 flex items-center justify-center shadow-xl">
            <div className="text-center">
              <div className="font-bold text-xl">{navigationData.speedLimit}</div>
              <div className="text-xs -mt-1 text-gray-600">mph</div>
            </div>
          </div>

          {/* Current Speed */}
          <div className="bg-gray-900 text-white px-6 py-3 rounded-xl shadow-xl">
            <div className="text-center">
              <div className="font-bold text-3xl">{Math.round(navigationData.currentSpeed)}</div>
              <div className="text-sm opacity-80">mph</div>
            </div>
          </div>
        </div>

        {/* Distance Remaining */}
        <div className="absolute bottom-24 right-4 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg z-10 border border-gray-200">
          <div className="text-center">
            <div className="font-bold text-xl text-gray-900">{navigationData.totalDistance}</div>
            <div className="text-xs text-gray-600">remaining</div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-white border-t px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">{navigationData.duration}</span>
          </div>
          <div className="text-sm text-gray-600">Arrive by {navigationData.eta}</div>
          <div className="flex items-center gap-1 text-sm text-green-600">
            <Zap className="w-4 h-4" />
            <span>Fastest route</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="flex items-center gap-2 hover:bg-gray-50">
            <Phone className="w-4 h-4" />
            Call
          </Button>

          <Button variant="outline" size="sm" className="hover:bg-gray-50">
            Routes
          </Button>

          <Button variant="outline" size="sm" className="hover:bg-gray-50">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
