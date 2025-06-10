"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, RefreshCw } from "lucide-react"
import { useAutoLocation } from "@/hooks/use-auto-location"
import { toast } from "@/components/ui/use-toast"

interface LocationStatusProps {
  onCenterMap?: () => void
}

export function LocationStatus({ onCenterMap }: LocationStatusProps) {
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
  })

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
  )
}

export default LocationStatus
