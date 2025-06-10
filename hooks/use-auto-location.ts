"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { LocationService, type LocationCoordinates } from "@/lib/location-service"
import { toast } from "@/components/ui/use-toast"

interface UseAutoLocationOptions {
  autoCenter?: boolean
  enableWatching?: boolean
  onLocationUpdate?: (location: LocationCoordinates) => void
  onLocationError?: (error: GeolocationPositionError) => void
}

interface UseAutoLocationReturn {
  location: LocationCoordinates | null
  loading: boolean
  error: GeolocationPositionError | null
  accuracy: number | null
  centerOnLocation: () => Promise<void>
  refreshLocation: () => Promise<void>
  hasPermission: boolean
  requestPermission: () => Promise<void>
}

export function useAutoLocation(options: UseAutoLocationOptions = {}): UseAutoLocationReturn {
  const { autoCenter = true, enableWatching = false, onLocationUpdate, onLocationError } = options

  const [location, setLocation] = useState<LocationCoordinates | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<GeolocationPositionError | null>(null)
  const [hasPermission, setHasPermission] = useState(false)
  const locationService = useRef(LocationService.getInstance())
  const hasAutocentered = useRef(false)

  // Check permission status
  const checkPermission = useCallback(async () => {
    try {
      const permission = await locationService.current.requestPermission()
      setHasPermission(permission === "granted")
      return permission === "granted"
    } catch (error) {
      console.warn("Permission check failed:", error)
      return false
    }
  }, [])

  // Request location permission
  const requestPermission = useCallback(async () => {
    try {
      setLoading(true)
      const hasPermission = await checkPermission()

      if (hasPermission) {
        await getCurrentLocation()
      } else {
        toast({
          title: "Location Permission Required",
          description: "Please enable location access to use Park Algo's features.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Permission request failed:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const currentLocation = await locationService.current.getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      })

      setLocation(currentLocation)
      onLocationUpdate?.(currentLocation)

      // Auto-center on first location if enabled and not done yet
      if (autoCenter && !hasAutocentered.current) {
        hasAutocentered.current = true
        toast({
          title: "Location detected",
          description: `Centered on your location: ${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`,
        })
      }

      return currentLocation
    } catch (err) {
      const locationError = err as GeolocationPositionError
      setError(locationError)
      onLocationError?.(locationError)

      let errorMessage = "Unknown location error"
      switch (locationError.code) {
        case locationError.PERMISSION_DENIED:
          errorMessage = "Location access denied. Please enable location services."
          break
        case locationError.POSITION_UNAVAILABLE:
          errorMessage = "Location information unavailable."
          break
        case locationError.TIMEOUT:
          errorMessage = "Location request timed out."
          break
      }

      toast({
        title: "Location Error",
        description: errorMessage,
        variant: "destructive",
      })

      throw err
    } finally {
      setLoading(false)
    }
  }, [autoCenter, onLocationUpdate, onLocationError])

  // Center on current location
  const centerOnLocation = useCallback(async () => {
    if (location) {
      onLocationUpdate?.(location)
      toast({
        title: "Map centered",
        description: `Centered on: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
      })
    } else {
      await getCurrentLocation()
    }
  }, [location, onLocationUpdate, getCurrentLocation])

  // Refresh location
  const refreshLocation = useCallback(async () => {
    await getCurrentLocation()
  }, [getCurrentLocation])

  // Initialize location on mount
  useEffect(() => {
    let unsubscribeLocation: (() => void) | undefined
    let unsubscribeError: (() => void) | undefined

    const initializeLocation = async () => {
      try {
        // Check permission first
        const hasPermission = await checkPermission()

        if (hasPermission) {
          // Set up location callbacks
          unsubscribeLocation = locationService.current.onLocationUpdate((newLocation) => {
            if (newLocation) {
              setLocation(newLocation)
              onLocationUpdate?.(newLocation)
            }
          })

          unsubscribeError = locationService.current.onLocationError((error) => {
            setError(error)
            onLocationError?.(error)
          })

          // Get initial location
          await getCurrentLocation()

          // Start watching if enabled
          if (enableWatching) {
            locationService.current.startWatching({
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000,
            })
          }
        } else {
          setLoading(false)
          toast({
            title: "Location Access Required",
            description: "Park Algo needs location access to find nearby parking spots.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Location initialization failed:", error)
        setLoading(false)
      }
    }

    initializeLocation()

    // Cleanup
    return () => {
      unsubscribeLocation?.()
      unsubscribeError?.()
      if (enableWatching) {
        locationService.current.stopWatching()
      }
    }
  }, [enableWatching, checkPermission, getCurrentLocation, onLocationUpdate, onLocationError])

  return {
    location,
    loading,
    error,
    accuracy: location?.accuracy || null,
    centerOnLocation,
    refreshLocation,
    hasPermission,
    requestPermission,
  }
}
