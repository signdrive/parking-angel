"use client"

import { Button } from "@/components/ui/button"
import {
  MapPin,
  Clock,
  Zap,
  DollarSign,
  Users,
  Activity,
  Route,
  Star,
  Navigation,
  ChevronRight,
  ChevronLeft,
  Target,
  Brain,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { usePersistentState } from "@/hooks/use-persistent-state"
import { useAIAssistant } from "../ai/ai-assistant-context"
import { SmartAssistant } from "../ai/smart-assistant"

interface RightPanelProps {
  areaAnalysis: any
  spotsCount?: number
  providersCount?: number
  clickedLocation?: { lat: number; lng: number } | null
  loading?: boolean
  mapInitialized?: boolean
  onCollapseChange?: (isCollapsed: boolean) => void
}

export function RightPanel({
  areaAnalysis,
  spotsCount = 0,
  providersCount = 0,
  clickedLocation = null,
  loading = false,
  mapInitialized = false,
  onCollapseChange,
}: RightPanelProps) {
  const [isCollapsed, setIsCollapsed] = usePersistentState("rightPanelCollapsed", false)
  const [activePanel, setActivePanel] = useState<"status" | "ai">("status")
  const { sendMessage } = useAIAssistant()

  const handleQuickAction = (message: string) => {
    sendMessage(message)
  }

  const handleToggle = () => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
    onCollapseChange?.(newCollapsed)
  }

  useEffect(() => {
    onCollapseChange?.(isCollapsed)
  }, [isCollapsed, onCollapseChange])

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
              className="w-8 h-8 text-yellow-600 hover:bg-yellow-50"
              title="AI Recommendations"
              onClick={() => setIsCollapsed(false)}
            >
              <Zap className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-green-600 hover:bg-green-50"
              title="Quick Actions"
              onClick={() => setIsCollapsed(false)}
            >
              <Target className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-purple-600 hover:bg-purple-50"
              title="Recent Activity"
              onClick={() => setIsCollapsed(false)}
            >
              <Activity className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Expanded State: Two tab buttons, one for each panel */}
      {!isCollapsed && (
        <div className="h-full flex flex-col">
          <div className="flex gap-2 p-2">
            <Button
              variant={activePanel === "status" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setActivePanel("status")}
            >
              Status & Info
            </Button>
            <Button
              variant={activePanel === "ai" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setActivePanel("ai")}
            >
              AI Assistant
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {activePanel === "status" && (
              <div className="space-y-4">
                {/* All status/info/action cards here */}
                <div className="p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Live Data</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Free</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Paid</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Unavailable</span>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-sm font-medium">{loading ? "Loading..." : `${spotsCount} spots found`}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {`From ${providersCount} providers`}
                    {clickedLocation && (
                      <div className="text-purple-600 mt-1">
                        📍 Clicked area: {clickedLocation.lat.toFixed(4)}, {clickedLocation.lng.toFixed(4)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">AI Assistant</span>
                  </div>
                  <p className="text-xs text-purple-700 mb-2">
                    Click anywhere on the map to get AI-powered parking analysis for that area
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => handleQuickAction("Analyze Current Location")}
                  >
                    Analyze Current Location
                  </Button>
                </div>
                <div className="p-3 bg-blue-50">
                  <div className="text-xs text-blue-800">
                    <div className="font-medium mb-1">Map Status</div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${mapInitialized ? "bg-green-500" : "bg-yellow-500"}`}></div>
                      <span>{mapInitialized ? "Ready" : "Initializing..."}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Panel 2: AI Chat/Assistant (render children or a dedicated AI component here) */}
            {activePanel === "ai" && (
              <div className="flex-1 flex flex-col p-0 m-0 bg-transparent border-none shadow-none">
                <SmartAssistant />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}