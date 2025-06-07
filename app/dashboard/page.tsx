"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { EnhancedParkingMap } from "@/components/map/enhanced-parking-map"
import { CollapsibleSidebar } from "@/components/layout/collapsible-sidebar"
import { RightPanel } from "@/components/dashboard/right-panel"
import { FloatingAIChat } from "@/components/ai/floating-ai-chat"
import { UserProfileEnhanced } from "@/components/dashboard/user-profile-enhanced"
import { ParkingHistory } from "@/components/dashboard/parking-history"
import { SmartAssistant } from "@/components/ai/smart-assistant"
import { MapPin } from "lucide-react"
import { PWADebug } from "@/components/pwa/pwa-debug"

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("map")
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null)
  const [showDebug, setShowDebug] = useState(false)

  // Map state
  const [spotsCount, setSpotsCount] = useState(0)
  const [providersCount, setProvidersCount] = useState(0)
  const [clickedLocation, setClickedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [areaAnalysis, setAreaAnalysis] = useState<any>(null)
  const [mapLoading, setMapLoading] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const renderMainContent = () => {
    switch (activeTab) {
      case "map":
        return (
          <div className="flex h-full">
            {/* Main Map Area - Dynamic width based on right panel */}
            <div className="flex-1 bg-white min-w-0">
              <div className="h-full">
                <EnhancedParkingMap
                  onSpotSelect={setSelectedSpot}
                  onStatsUpdate={(spots, providers) => {
                    setSpotsCount(spots)
                    setProvidersCount(providers)
                  }}
                  onLocationClick={setClickedLocation}
                  onAreaAnalysis={setAreaAnalysis}
                  onLoadingChange={setMapLoading}
                />
              </div>
            </div>

            {/* Collapsible Right Panel */}
            <RightPanel
              spotsCount={spotsCount}
              providersCount={providersCount}
              clickedLocation={clickedLocation}
              areaAnalysis={areaAnalysis}
              loading={mapLoading}
            />
          </div>
        )

      case "saved":
        return (
          <div className="p-6 bg-gray-50 h-full">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Saved Locations</h1>
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Saved Locations Yet</h3>
                <p className="text-gray-600">Start saving your favorite parking spots to see them here.</p>
              </div>
            </div>
          </div>
        )

      case "history":
        return (
          <div className="p-6 bg-gray-50 h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <ParkingHistory />
            </div>
          </div>
        )

      case "settings":
        return (
          <div className="p-6 bg-gray-50 h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-6">
              <UserProfileEnhanced user={user} />
              {showDebug && <PWADebug />}
            </div>
          </div>
        )

      case "ai":
        return (
          <div className="p-6 bg-gray-50 h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <SmartAssistant />
            </div>
          </div>
        )

      default:
        return (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
              <p className="text-gray-600">This feature is under development.</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="h-screen bg-gray-900 flex overflow-hidden">
      {/* Collapsible Sidebar */}
      <CollapsibleSidebar activeTab={activeTab} onTabChange={setActiveTab} className="flex-shrink-0" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">{renderMainContent()}</div>

      {/* Floating AI Chat */}
      <FloatingAIChat />
    </div>
  )
}
