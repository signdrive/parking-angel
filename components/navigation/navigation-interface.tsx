"use client"

import { useEffect } from "react"
import { useNavigationStore } from "@/lib/navigation-store"
import { NavigationService } from "@/lib/navigation-service"
import { SecureGoogleMapsNavigation } from "./secure-google-maps-navigation"

interface NavigationInterfaceProps {
  onExit: () => void
}

export function NavigationInterface({ onExit }: NavigationInterfaceProps) {
  const { currentRoute, destination, settings, updateUserLocation, updateGpsSignal } = useNavigationStore()

  const navigationService = NavigationService.getInstance()

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
  }, [updateUserLocation, updateGpsSignal])

  if (!currentRoute || !destination) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Navigation Error</h2>
          <p className="mb-4 text-gray-600">Unable to load navigation data</p>
          <button onClick={onExit} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return <SecureGoogleMapsNavigation onExit={onExit} />
}
