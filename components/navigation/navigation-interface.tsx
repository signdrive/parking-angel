"use client"

import { useEffect } from "react"
import { useNavigationStore } from "@/lib/navigation-store"
import { NavigationService } from "@/lib/navigation-service"
import { ProfessionalNavigation } from "./professional-navigation"

interface NavigationInterfaceProps {
  onExit: () => void
}

export function NavigationInterface({ onExit }: NavigationInterfaceProps) {
  const { updateUserLocation, updateGpsSignal } = useNavigationStore()
  const navigationService = NavigationService.getInstance()

  // Professional location tracking
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

  return <ProfessionalNavigation onExit={onExit} />
}
