"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Shield, X } from "lucide-react"

interface LocationTrackerProps {
  onLocationUpdate?: (location: { latitude: number; longitude: number }) => void
}

export function LocationTracker({ onLocationUpdate }: LocationTrackerProps) {
  const { user } = useAuth()
  const [consent, setConsent] = useState<boolean | null>(null)
  const [tracking, setTracking] = useState(false)
  const [lastLocation, setLastLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Check for existing consent
  useEffect(() => {
    const savedConsent = localStorage.getItem("location-tracking-consent")
    if (savedConsent) {
      setConsent(savedConsent === "true")
    }
  }, [])

  // Start tracking when consent is given
  useEffect(() => {
    if (consent && user && !tracking) {
      startTracking()
    }
  }, [consent, user])

  const requestConsent = () => {
    setConsent(true)
    localStorage.setItem("location-tracking-consent", "true")
  }

  const revokeConsent = () => {
    setConsent(false)
    setTracking(false)
    localStorage.setItem("location-tracking-consent", "false")
    setLastLocation(null)
    setError(null)
  }

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser")
      return
    }

    setTracking(true)
    setError(null)

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // Cache for 1 minute
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }

        setLastLocation(location)
        onLocationUpdate?.(location)

        // Send to backend if user is logged in
        if (user) {
          try {
            await fetch("/api/admin/user-locations", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                latitude: location.latitude,
                longitude: location.longitude,
                userId: user.id,
              }),
            })
          } catch (error) {
            console.error("Failed to save location:", error)
          }
        }
      },
      (error) => {
        console.error("Geolocation error:", error)
        setError(error.message)
        setTracking(false)
      },
      options,
    )

    // Cleanup function
    return () => {
      navigator.geolocation.clearWatch(watchId)
      setTracking(false)
    }
  }

  // Don't show anything if user hasn't made a consent decision
  if (consent === null) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900">Enable Location Tracking</h3>
            <p className="text-sm text-blue-700 mt-1">
              Help us improve our service by sharing your location. This data is used for analytics and finding better
              parking spots near you.
            </p>
            <div className="flex items-center space-x-2 mt-3">
              <Button size="sm" onClick={requestConsent}>
                <Shield className="w-4 h-4 mr-1" />
                Allow Location
              </Button>
              <Button variant="outline" size="sm" onClick={() => setConsent(false)}>
                <X className="w-4 h-4 mr-1" />
                Decline
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show status if consent is given
  if (consent) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <MapPin className="w-3 h-3 mr-1" />
            {tracking ? "Tracking" : "Ready"}
          </Badge>
          {lastLocation && (
            <span className="text-sm text-green-700">
              Last: {lastLocation.latitude.toFixed(4)}, {lastLocation.longitude.toFixed(4)}
            </span>
          )}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
        <Button variant="ghost" size="sm" onClick={revokeConsent}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return null
}
