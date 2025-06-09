"use client"

import { useState, useEffect, useCallback } from "react"

interface ParkingSpot {
  id: string
  latitude: number
  longitude: number
  address: string
  spot_type: string
  is_available: boolean
  price_per_hour?: number
  max_duration_hours?: number
  total_spaces?: number
  available_spaces?: number
  restrictions?: string
  payment_methods?: string[]
  accessibility: boolean
  covered: boolean
  security: boolean
  ev_charging: boolean
  provider: string
  confidence_score: number
  expires_at: string
  last_updated: string
  distance_meters?: number
}

interface UseParkingSpotsReturn {
  spots: ParkingSpot[]
  loading: boolean
  error: string | null
  refetch: () => void
  addSpot: (spot: Partial<ParkingSpot>) => Promise<boolean>
}

export function useParkingSpots(latitude?: number, longitude?: number, radius = 1000): UseParkingSpotsReturn {
  const [spots, setSpots] = useState<ParkingSpot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSpots = useCallback(async () => {
    if (!latitude || !longitude) {
      setSpots([])
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("🔍 Fetching parking spots:", { latitude, longitude, radius })

      const params = new URLSearchParams({
        lat: latitude.toString(),
        lng: longitude.toString(),
        radius: radius.toString(),
        limit: "50",
      })

      const response = await fetch(`/api/spots?${params}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch parking spots")
      }

      console.log("✅ Parking spots fetched:", data.data?.length || 0)
      setSpots(data.data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      console.error("❌ Error fetching parking spots:", errorMessage)
      setError(errorMessage)
      setSpots([])
    } finally {
      setLoading(false)
    }
  }, [latitude, longitude, radius])

  const addSpot = useCallback(async (spotData: Partial<ParkingSpot>): Promise<boolean> => {
    try {
      setError(null)

      const response = await fetch("/api/spots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(spotData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to add parking spot")
      }

      // Add the new spot to the current list
      if (data.data) {
        setSpots((prev) => [data.data, ...prev])
      }

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      console.error("❌ Error adding parking spot:", errorMessage)
      setError(errorMessage)
      return false
    }
  }, [])

  useEffect(() => {
    fetchSpots()
  }, [fetchSpots])

  return {
    spots,
    loading,
    error,
    refetch: fetchSpots,
    addSpot,
  }
}
