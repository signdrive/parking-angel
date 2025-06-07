"use client"

import { useEffect, useState } from "react"
import { useNavigationStore } from "@/lib/navigation-store"
import { NavigationService } from "@/lib/navigation-service"
import { TomTomNavigation } from "./tomtom-navigation"
import { useToast } from "@/hooks/use-toast"

interface NavigationInterfaceProps {
  onExit: () => void
}

export function NavigationInterface({ onExit }: NavigationInterfaceProps) {
  const [mapboxToken, setMapboxToken] = useState<string | null>(null)
  const { userLocation, updateUserLocation, updateGpsSignal } = useNavigationStore()
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
        updateUserLocation(location)
        updateGpsSignal("strong")
      },
      (error) => {
        console.error("Location error:", error)
        updateGpsSignal("lost")
      },
    )

    return () => {
      navigationService.stopLocationTracking()
    }
  }, [updateUserLocation, updateGpsSignal, navigationService])

  // Use the TomTom-style navigation interface
  return <TomTomNavigation onExit={onExit} />
}
