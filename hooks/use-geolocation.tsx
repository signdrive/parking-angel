"use client"

import { useState, useEffect, useCallback } from "react"

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  error: string | null
  loading: boolean
}

interface UseGeolocationOptions {
  autoCenter?: boolean
  enableWatching?: boolean
  onLocationUpdate?: (location: { latitude: number; longitude: number }) => void
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const { autoCenter = true, enableWatching = false, onLocationUpdate } = options

  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  })

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by this browser.",
        loading: false,
      }))
      return
    }

    const handleSuccess = (position: GeolocationPosition) => {
      const newLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }

      setState({
        latitude: newLocation.latitude,
        longitude: newLocation.longitude,
        error: null,
        loading: false,
      })

      // Call the callback if provided
      if (onLocationUpdate) {
        onLocationUpdate(newLocation)
      }
    }

    const handleError = (error: GeolocationPositionError) => {
      setState((prev) => ({
        ...prev,
        error: error.message,
        loading: false,
      }))
    }

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000,
    })
  }, [onLocationUpdate])

  useEffect(() => {
    getCurrentLocation()

    // Set up watching if enabled
    let watchId: number | null = null
    if (enableWatching && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }

          setState({
            latitude: newLocation.latitude,
            longitude: newLocation.longitude,
            error: null,
            loading: false,
          })

          if (onLocationUpdate) {
            onLocationUpdate(newLocation)
          }
        },
        (error) => {
          setState((prev) => ({
            ...prev,
            error: error.message,
            loading: false,
          }))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        },
      )
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [getCurrentLocation, enableWatching, onLocationUpdate])

  const refreshLocation = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true }))
    getCurrentLocation()
  }, [getCurrentLocation])

  return {
    ...state,
    refreshLocation,
  }
}
