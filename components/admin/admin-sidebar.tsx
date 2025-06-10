"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Map,
  Users,
  Car,
  BarChart3,
  FileText,
  Settings,
  MapPin,
  Navigation,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useAutoLocation } from "@/hooks/use-auto-location"
import { toast } from "@/components/ui/use-toast"

interface AdminSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  onCenterMap?: () => void
}

export function AdminSidebar({ activeSection, onSectionChange, onCenterMap }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const {
    location,
    loading: locationLoading,
    error: locationError,
    hasPermission,
    centerOnLocation,
    refreshLocation,
  } = useAutoLocation({
    autoCenter: true,
    enableWatching: true,
    onLocationUpdate: (newLocation) => {
      console.log("Location updated:", newLocation)
    },
  })

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "map", label: "Live Map", icon: Map },
    { id: "users", label: "Users", icon: Users },
    { id: "spots", label: "Parking Spots", icon: Car },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const handleCenterMap = async () => {
    try {
      await centerOnLocation()
      onCenterMap?.()
      toast({
        title: "Map Centered",
        description: "Map view centered on your current location",
      })
    } catch (error) {
      console.error("Failed to center map:", error)
      toast({
        title: "Center Failed",
        description: "Could not center map on your location",
        variant: "destructive",
      })
    }
  }

  const handleRefreshLocation = async () => {
    try {
      await refreshLocation()
    } catch (error) {
      console.error("Failed to refresh location:", error)
    }
  }

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${isCollapsed ? "w-16" : "w-80"}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-gray-900">Park Algo</h1>
              <p className="text-sm text-gray-500">Admin Panel</p>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)} className="ml-auto">
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Location Status */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {location ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Active
                    </Badge>
                    <span className="text-xs text-gray-500">±{Math.round(location.accuracy)}m</span>
                  </div>
                  <div className="text-xs text-gray-600 font-mono">
                    <div>Lat: {location.latitude.toFixed(6)}</div>
                    <div>Lng: {location.longitude.toFixed(6)}</div>
                  </div>
                </div>
              ) : locationError ? (
                <div className="space-y-2">
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    Error
                  </Badge>
                  <p className="text-xs text-red-600">{locationError.message}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    {locationLoading ? "Loading..." : "Inactive"}
                  </Badge>
                  <p className="text-xs text-gray-500">
                    {hasPermission ? "Getting location..." : "Location permission needed"}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button size="sm" onClick={handleCenterMap} disabled={!location || locationLoading} className="flex-1">
                  <Navigation className="w-3 h-3 mr-1" />
                  Center Map
                </Button>
                <Button size="sm" variant="outline" onClick={handleRefreshLocation} disabled={locationLoading}>
                  <RefreshCw className={`w-3 h-3 ${locationLoading ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start ${isCollapsed ? "px-2" : "px-3"}`}
                onClick={() => onSectionChange(item.id)}
              >
                <Icon className="w-4 h-4" />
                {!isCollapsed && <span className="ml-2">{item.label}</span>}
              </Button>
            )
          })}
        </div>
      </nav>

      {/* Collapsed Location Controls */}
      {isCollapsed && (
        <div className="p-2 border-t border-gray-200">
          <div className="space-y-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCenterMap}
              disabled={!location || locationLoading}
              className="w-full p-2"
              title="Center Map"
            >
              <Navigation className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefreshLocation}
              disabled={locationLoading}
              className="w-full p-2"
              title="Refresh Location"
            >
              <RefreshCw className={`w-4 h-4 ${locationLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSidebar
