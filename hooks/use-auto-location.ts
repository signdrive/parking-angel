"use client"

import { useState, useEffect, useCallback } from "react"
import { LocationService } from "@/lib/location-service"
import { toast } from "@/components/ui/use-toast"

interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
}

interface UseAutoLocationOptions {
  autoCenter?: boolean
  enableWatching?: boolean
  onLocationUpdate?: (location: LocationData) => void
  onError?: (error: Error) => void
}

interface UseAutoLocationReturn {
  location: LocationData | null
  loading: boolean
  error: Error | null
  hasPermission: boolean
  centerOnLocation: () => Promise<void>
  refreshLocation: () => Promise<void>
}

export function useAutoLocation(options: UseAutoLocationOptions = {}): UseAutoLocationReturn {
  const { autoCenter = false, enableWatching = false, onLocationUpdate, onError } = options

  const [location, setLocation] = useState<LocationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [hasPermission, setHasPermission] = useState(false)

  const locationService = LocationService.getInstance()

  const updateLocation = useCallback(
    (position: GeolocationPosition) => {
      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      }

      setLocation(locationData)
      setError(null)
      onLocationUpdate?.(locationData)
    },
    [onLocationUpdate],
  )

  const handleError = useCallback(
    (err: Error) => {
      setError(err)
      setLoading(false)
      onError?.(err)

      toast({
        title: "Location Error",
        description: err.message,
        variant: "destructive",
      })
    },
    [onError],
  )

  const requestLocation = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const position = await locationService.getCurrentLocation()
      updateLocation(position)
      setHasPermission(true)

      if (autoCenter) {
        toast({
          title: "Location Found",
          description: `Accuracy: ${Math.round(position.coords.accuracy)}m`,
        })
      }
    } catch (err) {
      handleError(err as Error)
      setHasPermission(false)
    } finally {
      setLoading(false)
    }
  }, [locationService, updateLocation, handleError, autoCenter])

  const centerOnLocation = useCallback(async () => {
    await requestLocation()
  }, [requestLocation])

  const refreshLocation = useCallback(async () => {
    toast({
      title: "Refreshing Location",
      description: "Getting your current location...",
    })
    await requestLocation()
  }, [requestLocation])

  // Check permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const permission = await locationService.requestPermission()
        setHasPermission(permission === "granted")

        if (permission === "granted" && autoCenter) {
          await requestLocation()
        }
      } catch (err) {
        console.error("Permission check failed:", err)
        setHasPermission(false)
      }
    }

    checkPermission()
  }, [locationService, autoCenter, requestLocation])

  // Set up location watching
  useEffect(() => {
    if (!enableWatching || !hasPermission) return

    const watchId = locationService.startWatching(updateLocation)

    return () => {
      if (watchId) {
        locationService.stopWatching(updateLocation)
      }
    }
  }, [locationService, enableWatching, hasPermission, updateLocation])

  return {
    location,
    loading,
    error,
    hasPermission,
    centerOnLocation,
    refreshLocation,
  }
}

export default useAutoLocation
