"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Crosshair, RefreshCw, AlertTriangle, CheckCircle, Clock, Satellite } from "lucide-react"
import { useAutoLocation } from "@/hooks/use-auto-location"
import { toast } from "@/components/ui/use-toast"

interface LocationStatusProps {
  onCenterMap?: () => void
  showControls?: boolean
  compact?: boolean
}

export function LocationStatus({ onCenterMap, showControls = true, compact = false }: LocationStatusProps) {
  const {
    location,
    loading: locationLoading,
    error: locationError,
    accuracy,
    centerOnLocation,
    refreshLocation,
    hasPermission,
    requestPermission,
  } = useAutoLocation({
    autoCenter: false,
    enableWatching: true,
  })

  const handleCenterMap = async () => {
    try {
      if (!hasPermission) {
        await requestPermission()
        return
      }

      await centerOnLocation()
      onCenterMap?.()

      toast({
        title: "Map Centered",
        description: location
          ? `Centered on: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
          : "Centering on your current location...",
      })
    } catch (error) {
      console.error("Failed to center map:", error)
      toast({
        title: "Location Error",
        description: "Could not center map on your location. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  const getLocationStatus = () => {
    if (locationLoading) {
      return {
        icon: Clock,
        text: "Detecting Location...",
        color: "text-yellow-500",
        bgColor: "bg-yellow-50",
        variant: "secondary" as const,
      }
    }
    if (locationError) {
      return {
        icon: AlertTriangle,
        text: "Location Unavailable",
        color: "text-red-500",
        bgColor: "bg-red-50",
        variant: "destructive" as const,
      }
    }
    if (location) {
      return {
        icon: CheckCircle,
        text: "Location Active",
        color: "text-green-500",
        bgColor: "bg-green-50",
        variant: "default" as const,
      }
    }
    return {
      icon: AlertTriangle,
      text: "Location Unknown",
      color: "text-gray-500",
      bgColor: "bg-gray-50",
      variant: "outline" as const,
    }
  }

  const status = getLocationStatus()
  const StatusIcon = status.icon

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 p-2 rounded-lg ${status.bgColor}`}>
        <StatusIcon className={`w-4 h-4 ${status.color}`} />
        <span className="text-sm font-medium">{status.text}</span>
        {location && (
          <Badge variant="outline" className="text-xs">
            ±{accuracy ? Math.round(accuracy) : "?"}m
          </Badge>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="w-5 h-5 text-blue-600" />
          Location Services
          <Badge variant={status.variant} className="ml-auto">
            <StatusIcon className="w-3 h-3 mr-1" />
            {status.text}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location Details */}
        {location ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Navigation className="w-4 h-4 text-blue-500" />
              <span className="font-mono">
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </span>
            </div>

            {accuracy && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Satellite className="w-4 h-4" />
                <span>Accuracy: ±{Math.round(accuracy)} meters</span>
              </div>
            )}

            <div className="text-xs text-gray-500">
              Last updated: {new Date(location.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-600">
            {locationError ? `Error: ${locationError.message}` : "Waiting for location data..."}
          </div>
        )}

        {/* Controls */}
        {showControls && (
          <div className="flex gap-2">
            <Button onClick={handleCenterMap} disabled={locationLoading} className="flex-1">
              <Crosshair className="w-4 h-4 mr-2" />
              {locationLoading ? "Locating..." : "Center Map"}
            </Button>

            <Button variant="outline" onClick={refreshLocation} disabled={locationLoading}>
              <RefreshCw className={`w-4 h-4 ${locationLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        )}

        {/* Permission Request */}
        {!hasPermission && (
          <Button variant="outline" onClick={requestPermission} className="w-full">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Enable Location Access
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
