"use client"

import { useState, useCallback, useRef } from "react"

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  error: string | null
  loading: boolean
}

interface GeolocationOptions extends PositionOptions {
  maxRetries?: number
  retryDelay?: number
}

export function useGeolocation(options: GeolocationOptions = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    enableHighAccuracy = true,
    timeout = 5000,
    maximumAge = 0,
  } = options

  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
  })

  const retryCount = useRef(0)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const requestGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by this browser.",
        loading: false,
      }))
      return
    }

    setState((prev) => ({ ...prev, loading: true }))

    const handleSuccess = (position: GeolocationPosition) => {
      retryCount.current = 0
      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: null,
        loading: false,
      })
    }

    const handleError = (error: GeolocationPositionError) => {
      if (retryCount.current < maxRetries) {
        retryCount.current++
        timeoutRef.current = setTimeout(() => {
          requestGeolocation()
        }, retryDelay)
        return
      }

      setState((prev) => ({
        ...prev,
        error: error.message,
        loading: false,
      }))
    }

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy,
      timeout,
      maximumAge,
    })
  }, [maxRetries, retryDelay, enableHighAccuracy, timeout, maximumAge])

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setState((prev) => ({
      ...prev,
      loading: false,
    }))
  }, [])

  return {
    ...state,
    requestGeolocation,
    cancel,
  }
}
