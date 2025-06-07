"use client"

import { useEffect, useState } from "react"
import { useNavigationStore } from "@/lib/navigation-store"
import { NavigationService } from "@/lib/navigation-service"
import { NavigationMap } from "./navigation-map"
import { Button } from "@/components/ui/button"
import { NavigationSettings } from "./navigation-settings"
import { ArrowLeft, Volume2, VolumeX, Settings, Phone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface NavigationInterfaceProps {
  onExit: () => void
}

export function NavigationInterface({ onExit }: NavigationInterfaceProps) {
  const [mapboxToken, setMapboxToken] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  const { currentRoute, userLocation, destination, settings, updateSettings } = useNavigationStore()

  const navigationService = NavigationService.getInstance()
  const { toast } = useToast()

  // Fetch Mapbox token for navigation
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        console.log("🗺️ Fetching Mapbox token for navigation...")
        const response = await fetch("/api/mapbox/token")
        if (response.ok) {
          const data = await response.json()
          console.log("✅ Mapbox token received for navigation")
          setMapboxToken(data.token)
        } else {
          console.error("❌ Failed to fetch Mapbox token:", response.status)
        }
      } catch (error) {
        console.error("❌ Error fetching Mapbox token:", error)
      }
    }

    fetchMapboxToken()
  }, [])

  // Location tracking
  useEffect(() => {
    navigationService.startLocationTracking(
      (location) => {
        // Location updates handled by the store
      },
      (error) => {
        console.error("Location error:", error)
      },
    )

    return () => {
      navigationService.stopLocationTracking()
    }
  }, [])

  if (!currentRoute || !destination) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Navigation</h3>
          <p className="text-gray-600 mb-4">Please start navigation to a destination.</p>
          <Button onClick={onExit}>Return to Map</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Main Navigation Map - Full Screen */}
      <div className="flex-1 relative">
        <NavigationMap mapboxToken={mapboxToken} />

        {/* Top-left back button */}
        <div className="absolute top-16 left-2 z-30">
          <Button
            variant="ghost"
            size="icon"
            onClick={onExit}
            className="bg-gray-800/80 text-white hover:bg-gray-700 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-24 right-4 flex flex-col gap-2 z-30">
          {/* Voice Toggle */}
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
            className="bg-gray-800/80 text-white hover:bg-gray-700 rounded-full"
          >
            {settings.voiceGuidance ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(true)}
            className="bg-gray-800/80 text-white hover:bg-gray-700 rounded-full"
          >
            <Settings className="w-5 h-5" />
          </Button>

          {/* Call */}
          <Button variant="ghost" size="icon" className="bg-gray-800/80 text-white hover:bg-gray-700 rounded-full">
            <Phone className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Settings modal */}
      <NavigationSettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  )
}
