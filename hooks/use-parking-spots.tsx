"use client"

import { useState, useEffect } from "react"
import { getBrowserClient } from "@/lib/supabase/browser"
import { Database } from "@/lib/types/supabase"

type ParkingSpot = Database['public']['Tables']['parking_spots']['Row']

export function useParkingSpots({ latitude, longitude, radius = 500 }: { latitude?: number | null, longitude?: number | null, radius?: number }) {
  const supabase = getBrowserClient()
  const [spots, setSpots] = useState<ParkingSpot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!latitude || !longitude) {
      setLoading(false)
      setError("Location is required")
      return
    }

    setLoading(true)
    setError(null)

    supabase
      .from("parking_spots")
      .select("*")
      // Add geolocation filtering if your database supports it
      // For now, we'll fetch all spots and can filter client-side if needed
      .then(({ data, error }) => {
        if (error) {
          setError(error.message)
        } else {
          setSpots(data || [])
        }
        setLoading(false)
      })
  }, [latitude, longitude, radius])

  return { spots, loading, error }
}
