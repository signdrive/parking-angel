"use client"

import { useState, useEffect } from "react"
import { EnhancedParkingMap } from "@/components/map/enhanced-parking-map"
import { NavigationInterface } from "@/components/navigation/navigation-interface"
import { useNavigationStore } from "@/lib/navigation-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Car, Clock, Zap } from "lucide-react"

export default function DashboardPage() {
  const [spotsCount, setSpotsCount] = useState(0)
  const [providersCount, setProvidersCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const { isNavigating, resetNavigation } = useNavigationStore()

  // Reset navigation state on page load to ensure clean state
  useEffect(() => {
    console.log("Dashboard mounted, resetting navigation state")
    resetNavigation()
  }, [resetNavigation])

  const handleStatsUpdate = (spots: number, providers: number) => {
    setSpotsCount(spots)
    setProvidersCount(providers)
  }

  const handleExitNavigation = () => {
    console.log("Exiting navigation from dashboard")
    resetNavigation()
  }

  // Show navigation interface only if actively navigating
  if (isNavigating) {
    console.log("Dashboard: Navigation is active, showing NavigationInterface")
    return <NavigationInterface onExit={handleExitNavigation} />
  }

  console.log("Dashboard: No active navigation, showing main map")

  return (
    <div className="h-screen flex flex-col">
      {/* Header Stats */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Live Map</h1>
            <p className="text-gray-600">Real-time parking view</p>
          </div>

          <div className="flex gap-4">
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">AI</span>
                <span className="text-sm font-medium">LIVE</span>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="bg-gray-50 p-4 border-b">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Live Stats</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{spotsCount}</div>
                <div className="text-xs text-gray-500">Spots Found</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600"></CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{providersCount}</div>
                <div className="text-xs text-gray-500">Providers</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">AI Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                <div className="text-xs text-gray-500">Click on the map to get AI recommendations</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="w-3 h-3" />
                  <span>Find Nearest Spot</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Car className="w-3 h-3" />
                  <span>Find Cheapest Spot</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-3 h-3" />
                  <span>Reserve for Later</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Zap className="w-3 h-3" />
                  <span>Share Location</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Map */}
      <div className="flex-1">
        <EnhancedParkingMap onStatsUpdate={handleStatsUpdate} onLoadingChange={setLoading} />
      </div>
    </div>
  )
}
