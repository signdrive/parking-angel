"use client"

import { useState, useEffect } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import type { Database } from "@/lib/supabase"

type ParkingSpot = Database["public"]["Tables"]["parking_spots"]["Row"]

interface UseParkingSpotsProps {
  latitude?: number | null
  longitude?: number | null
  radius?: number
}

interface APIError {
  error: string
  error_code: string
  msg: string
}

export function useParkingSpots({ latitude, longitude, radius = 500 }: UseParkingSpotsProps) {
  const [spots, setSpots] = useState<ParkingSpot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!latitude || !longitude) {
      setLoading(false)
      setError("Location is required")
      return
    }

    const fetchSpots = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `/api/spots/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`
        )

        const data = await response.json()

        if (!response.ok) {
          const apiError = data as APIError
          throw new Error(apiError.msg || 'Failed to fetch spots')
        }

        setSpots(data.spots || [])
      } catch (err) {
        console.error('Error fetching spots:', err)
        setError(err instanceof Error ? err.message : "Failed to fetch parking spots")
        setSpots([])
      } finally {
        setLoading(false)
      }
    }

    fetchSpots()

    if (isSupabaseConfigured()) {
      const channel = supabase
        .channel("parking-spots-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "parking_spots",
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              setSpots((prev) => [...prev, payload.new as ParkingSpot])
            } else if (payload.eventType === "UPDATE") {
              setSpots((prev) => prev.map((spot) => (spot.id === payload.new.id ? (payload.new as ParkingSpot) : spot)))
            } else if (payload.eventType === "DELETE") {
              setSpots((prev) => prev.filter((spot) => spot.id !== payload.old.id))
            }
          },
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [latitude, longitude, radius])

  return { spots, loading, error }
}
