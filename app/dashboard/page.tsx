"use client"

import { useEffect } from "react"
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
import { usePersistentState } from "@/hooks/use-persistent-state"

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = usePersistentState("dashboardActiveTab", "map")
  const [selectedSpot, setSelectedSpot] = usePersistentState<string | null>("selectedSpot", null)
  const [showDebug, setShowDebug] = usePersistentState("showDebug", false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = usePersistentState("rightPanelCollapsed", false)

  // Map state (these don't need to persist as they're live data)
  const [spotsCount, setSpotsCount] = usePersistentState("spotsCount", 0)
  const [providersCount, setProvidersCount] = usePersistentState("providersCount", 0)
  const [clickedLocation, setClickedLocation] = usePersistentState<{ lat: number; lng: number } | null>(
    "clickedLocation",
    null,
  )
  const [areaAnalysis, setAreaAnalysis] = usePersistentState<any>("areaAnalysis", null)
  const [mapLoading, setMapLoading] = usePersistentState("mapLoading", false)

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
            {/* Main Map Area - Responsive to right panel state */}
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
              onCollapseChange={setRightPanelCollapsed}
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
                </div>
              </div>
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
