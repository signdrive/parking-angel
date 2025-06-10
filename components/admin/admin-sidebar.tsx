"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Shield,
  BarChart3,
  Users,
  MapPin,
  Map,
  Settings,
  FileText,
  TrendingUp,
  Navigation,
  Crosshair,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react"
import { useAutoLocation } from "@/hooks/use-auto-location"
import { toast } from "@/components/ui/use-toast"

interface AdminSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onCenterMap?: () => void
  className?: string
}

const navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: BarChart3,
    description: "Overview & Analytics",
    color: "text-blue-600",
  },
  {
    id: "map",
    label: "Live Map",
    icon: Map,
    description: "Real-time Parking View",
    color: "text-green-600",
  },
  {
    id: "users",
    label: "Users",
    icon: Users,
    description: "User Management",
    color: "text-purple-600",
  },
  {
    id: "spots",
    label: "Parking Spots",
    icon: MapPin,
    description: "Spot Management",
    color: "text-orange-600",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: TrendingUp,
    description: "Data Insights",
    color: "text-indigo-600",
  },
  {
    id: "reports",
    label: "Reports",
    icon: FileText,
    description: "System Reports",
    color: "text-red-600",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    description: "Configuration",
    color: "text-gray-600",
  },
]

export function AdminSidebar({ activeTab, onTabChange, onCenterMap, className }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const {
    location,
    loading: locationLoading,
    error: locationError,
    centerOnLocation,
    refreshLocation,
    hasPermission,
    requestPermission,
  } = useAutoLocation({
    autoCenter: false, // Don't auto-center from sidebar
    enableWatching: true,
  })

  const handleCenterMap = async () => {
    try {
      if (!hasPermission) {
        await requestPermission()
        return
      }

      if (location) {
        await centerOnLocation()
        onCenterMap?.()
        toast({
          title: "Map Centered",
          description: `Centered on your location: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
        })
      } else {
        await refreshLocation()
      }
    } catch (error) {
      console.error("Failed to center map:", error)
      toast({
        title: "Location Error",
        description: "Could not center map on your location. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getLocationStatus = () => {
    if (locationLoading) {
      return { icon: Clock, text: "Detecting...", color: "text-yellow-500" }
    }
    if (locationError) {
      return { icon: AlertTriangle, text: "Unavailable", color: "text-red-500" }
    }
    if (location) {
      return { icon: CheckCircle, text: "Active", color: "text-green-500" }
    }
    return { icon: AlertTriangle, text: "Unknown", color: "text-gray-500" }
  }

  const locationStatus = getLocationStatus()
  const StatusIcon = locationStatus.icon

  return (
    <div
      className={cn(
        "bg-white shadow-lg border-r flex flex-col transition-all duration-300",
        isCollapsed ? "w-20" : "w-80",
        className,
      )}
    >
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white relative">
        {!isCollapsed && (
          <>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Park Algo</h1>
                <p className="text-blue-100 text-sm">Admin Dashboard</p>
              </div>
            </div>

            {/* Location Status Card */}
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">Location Status</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20 h-6 w-6 p-0"
                    onClick={refreshLocation}
                    disabled={locationLoading}
                  >
                    <RefreshCw className={`w-3 h-3 ${locationLoading ? "animate-spin" : ""}`} />
                  </Button>
                </div>

                <div className="flex items-center space-x-2 mb-3">
                  <StatusIcon className={`w-4 h-4 ${locationStatus.color}`} />
                  <span className="text-sm text-white">{locationStatus.text}</span>
                </div>

                {location && (
                  <div className="text-xs text-blue-100 mb-3">
                    <Navigation className="w-3 h-3 inline mr-1" />
                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    {location.accuracy && <div className="mt-1">Accuracy: ±{Math.round(location.accuracy)}m</div>}
                  </div>
                )}

                <Button
                  size="sm"
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
                  onClick={handleCenterMap}
                  disabled={locationLoading}
                >
                  <Crosshair className="w-3 h-3 mr-2" />
                  {locationLoading ? "Locating..." : "Center Map"}
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {isCollapsed && (
          <div className="flex flex-col items-center space-y-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <Button
              size="sm"
              className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white border-white/30 p-0"
              onClick={handleCenterMap}
              disabled={locationLoading}
            >
              <Crosshair className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-4 -right-4 z-10 bg-white/20 border border-white/30 hover:bg-white/30 h-8 w-8 rounded-full text-white"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full text-left h-auto transition-all duration-200",
                isCollapsed ? "p-3 justify-center" : "p-3 justify-start",
                isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isCollapsed ? "mx-auto" : "mr-3",
                  isActive ? item.color : "text-gray-500",
                )}
              />

              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs opacity-70">{item.description}</div>
                </div>
              )}

              {!isCollapsed && isActive && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
            </Button>
          )
        })}
      </nav>

      {/* System Status */}
      {!isCollapsed && (
        <div className="p-4 border-t bg-gray-50">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">System Status</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Database</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">API</span>
              </div>
              <div className="flex items-center space-x-1">
                <StatusIcon className={`w-3 h-3 ${locationStatus.color}`} />
                <span className="text-gray-600">Location</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600">Live Data</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
