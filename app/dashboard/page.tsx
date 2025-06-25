"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
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
import { usePersistentState } from "@/hooks/use-persistent-state"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Persistent states
  const [activeTab, setActiveTab] = usePersistentState("dashboardActiveTab", "map")
  const [showDebug, setShowDebug] = usePersistentState("showDebug", false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = usePersistentState("rightPanelCollapsed", false)
  const [liveDataPanelCollapsed, setLiveDataPanelCollapsed] = usePersistentState("liveDataPanelCollapsed", false)

  // Non-persistent states (live data)
  const [selectedSpot, setSelectedSpot] = useState<any>(null)
  const [spotsCount, setSpotsCount] = useState(0)
  const [providersCount, setProvidersCount] = useState(0)
  const [clickedLocation, setClickedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [areaAnalysis, setAreaAnalysis] = useState<any>(null)
  const [mapLoading, setMapLoading] = useState(false)
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading) {
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
          <div className="flex h-full w-full">
            {/* Main Map Area - Takes all available space */}
            <div className="flex-1 bg-white relative">
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

            {/* Right Panel with overlays and AI */}
            <div className={`absolute top-0 right-0 h-full z-10`}>
              <RightPanel
                areaAnalysis={areaAnalysis}
                spotsCount={spotsCount}
                providersCount={providersCount}
                clickedLocation={clickedLocation}
                loading={mapLoading}
                mapInitialized={true} // You may want to wire this to actual map state
                onCollapseChange={setRightPanelCollapsed}
              />
            </div>
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

              {/* Settings Panel */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">App Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Debug Mode</h3>
                      <p className="text-sm text-gray-500">Show technical information and diagnostics</p>
                    </div>
                    <button
                      onClick={() => setShowDebug(!showDebug)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        showDebug ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          showDebug ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Right Panel</h3>
                      <p className="text-sm text-gray-500">Show or hide the statistics panel</p>
                    </div>
                    <button
                      onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        !rightPanelCollapsed ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          !rightPanelCollapsed ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

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
      <CollapsibleSidebar activeTab={activeTab} onTabChangeAction={setActiveTab} className="flex-shrink-0" />

      {/* Main Content - Takes remaining space */}
      <div className="flex-1 relative overflow-hidden">{renderMainContent()}</div>

      {/* Floating AI Chat */}
      <FloatingAIChat />
    </div>
  )
}
