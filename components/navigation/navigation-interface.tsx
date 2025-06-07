"use client"

import { useState, useEffect } from "react"
import { useNavigationStore } from "@/lib/navigation-store"
import { NaviCoreProInterface } from "./navicore-pro-interface" // Ensure this is a named import
import { Button } from "@/components/ui/button"

export function NavigationInterface() {
  const { isNavigating, destination, stopNavigation } = useNavigationStore()
  const [showNaviCore, setShowNaviCore] = useState(false)

  useEffect(() => {
    // This is a simplified trigger. In a real app, you'd likely set this
    // when a "Start Navigation" button is clicked and a destination is set.
    if (isNavigating && destination) {
      setShowNaviCore(true)
    } else {
      setShowNaviCore(false)
    }
  }, [isNavigating, destination])

  const handleExitNavigation = () => {
    stopNavigation() // Call your Zustand action to stop navigation
    setShowNaviCore(false)
  }

  if (!showNaviCore || !destination) {
    // Render your map browsing interface or a placeholder
    return (
      <div className="p-4">
        <p>Navigation not active or no destination set.</p>
        <p>Select a destination on the map to start navigation.</p>
        {/* Example button to simulate starting navigation */}
        <Button
          onClick={() => {
            // Simulate starting navigation to a test destination
            // In a real app, this would come from user interaction with the map
            useNavigationStore.getState().startNavigation(
              { latitude: 34.0522, longitude: -118.2437, name: "Los Angeles City Hall", spotId: "test-la" },
              // You'd typically calculate the route first, then pass it.
              // For this example, NaviCoreProInterface will calculate its own route.
              // So, the route object here is just a placeholder if your startNavigation expects one.
              { id: "placeholder", distance: 0, duration: 0, steps: [], geometry: [], trafficDelays: 0 },
            )
          }}
        >
          Simulate Start Navigation to LA
        </Button>
      </div>
    )
  }

  return <NaviCoreProInterface onExit={handleExitNavigation} destination={destination} />
}
