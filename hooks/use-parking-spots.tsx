"use client"

import { useState, useEffect } from "react"
import type { Spot } from "@/types/Spot"
import { useMap } from "@/context/MapContext"

const useParkingSpots = () => {
  const [spots, setSpots] = useState<Spot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { map } = useMap()

  useEffect(() => {
    if (!map) {
      return
    }

    const fetchNearbySpots = async () => {
      setLoading(true)
      setError(null)

      const bounds = map.getBounds()
      const ne = bounds.getNorthEast()
      const sw = bounds.getSouthWest()

      try {
        const response = await fetch(
          `/api/spots/nearby-simple?ne_lat=${ne.lat()}&ne_lng=${ne.lng()}&sw_lat=${sw.lat()}&sw_lng=${sw.lng()}`,
        )

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data: Spot[] = await response.json()
        setSpots(data)
      } catch (e: any) {
        setError(e.message || "An unexpected error occurred.")
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch and then fetch on map move
    fetchNearbySpots()
    map.on("moveend", fetchNearbySpots)

    // Cleanup listener on unmount
    return () => {
      map.off("moveend", fetchNearbySpots)
    }
  }, [map])

  return { spots, loading, error }
}

export default useParkingSpots
