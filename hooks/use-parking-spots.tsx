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

export function useParkingSpots({ latitude, longitude, radius = 500 }: UseParkingSpotsProps) {
  const [spots, setSpots] = useState<ParkingSpot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!latitude || !longitude || !isSupabaseConfigured()) {
      setLoading(false)
      if (!isSupabaseConfigured()) {
        setError("Database not configured")
      }
      return
    }

    const fetchSpots = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase.rpc("find_nearby_spots", {
          user_lat: latitude,
          user_lng: longitude,
          radius_meters: radius,
        })

        if (error) throw error
        setSpots(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch parking spots")
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
