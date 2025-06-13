"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MapPin,
  Activity,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  Zap,
  CheckCircle,
  XCircle,
  Circle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect } from "react"
import { usePersistentState } from "@/hooks/use-persistent-state"
import { useAIAssistant } from "../ai/ai-assistant-context"

interface LiveDataPanelProps {
  spotsCount: number
  providersCount: number
  clickedLocation: { lat: number; lng: number } | null
  areaAnalysis: any
  loading: boolean
  onCollapseChange?: (isCollapsed: boolean) => void
}

export function LiveDataPanel({
  spotsCount,
  providersCount,
  clickedLocation,
  areaAnalysis,
  loading,
  onCollapseChange,
}: LiveDataPanelProps) {
  const [isCollapsed, setIsCollapsed] = usePersistentState("liveDataPanelCollapsed", false)
  const { sendMessage } = useAIAssistant()

  const handleToggle = () => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
    onCollapseChange?.(newCollapsed)
  }

  const handleAnalyzeLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const message = `Analyze parking at my current location: ${position.coords.latitude}, ${position.coords.longitude}`
          sendMessage(message)
        },
        (error) => {
          console.error("Error getting location:", error)
          sendMessage("Analyze parking options near me")
        }
      )
    } else {
      sendMessage("Analyze parking options near me")
    }
  }

  useEffect(() => {
    onCollapseChange?.(isCollapsed)
  }, [isCollapsed, onCollapseChange])

  // Mock data for demonstration - replace with real data
  const freeSpots = Math.floor(spotsCount * 0.3)
  const paidSpots = Math.floor(spotsCount * 0.6)
  const unavailableSpots = spotsCount - freeSpots - paidSpots

  return (
    <div
      className={cn(
        "h-full bg-white/95 backdrop-blur-sm border-l border-gray-200 shadow-lg transition-all duration-300 ease-in-out relative",
        isCollapsed ? "w-12" : "w-80",
      )}
    >
      {/* Collapse/Expand Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        className="absolute top-4 -left-6 z-20 bg-white border border-gray-200 shadow-md hover:shadow-lg h-8 w-8 rounded-full"
      >
        {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </Button>

      {/* Collapsed State */}
      {isCollapsed && (
        <div className="p-2 space-y-4 mt-12">
          <div className="flex flex-col items-center space-y-3">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-blue-600 hover:bg-blue-50"
              title="Live Data"
              onClick={() => setIsCollapsed(false)}
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-purple-600 hover:bg-purple-50"
              title="AI Assistant"
              onClick={() => setIsCollapsed(false)}
            >
              <Zap className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-green-600 hover:bg-green-50"
              title="Map Status"
              onClick={() => setIsCollapsed(false)}
            >
              <CheckCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Expanded State */}
      {!isCollapsed && (
        <div className="h-full overflow-y-auto bg-gray-50">
          <div className="p-4 space-y-4">
            {/* Live Data */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Live Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Spot Status Breakdown */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Free</span>
                    </div>
                    <span className="text-sm text-gray-600">{freeSpots}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">Paid</span>
                    </div>
                    <span className="text-sm text-gray-600">{paidSpots}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium">Unavailable</span>
                    </div>
                    <span className="text-sm text-gray-600">{unavailableSpots}</span>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{spotsCount} spots found</div>
                    <div className="text-sm text-gray-600">From {providersCount} providers</div>
                  </div>
                </div>

                {loading && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Updating data...</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Assistant */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Click anywhere on the map to get AI-powered parking analysis for that area
                </p>

                <Button
                  onClick={handleAnalyzeLocation}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  size="sm"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Analyze Current Location
                </Button>

                {clickedLocation && (
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">Analyzed Location</span>
                    </div>
                    <div className="text-xs text-purple-700">
                      {clickedLocation.lat.toFixed(4)}, {clickedLocation.lng.toFixed(4)}
                    </div>
                    {areaAnalysis?.summary && (
                      <div className="mt-2 text-xs text-purple-800">
                        {areaAnalysis.summary}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Map Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Map Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">Ready</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Map is loaded and ready for interaction
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}