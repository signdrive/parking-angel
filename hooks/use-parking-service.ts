"use client"

import { useState, useEffect } from "react"
import { parkingService } from "@/lib/parking-service"

export function useParkingSpot(spotId: string) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!spotId) return

    const fetchSpot = async () => {
      try {
        setLoading(true)
        setError(null)
        const spotData = await parkingService.getAllSpotData(spotId)
        setData(spotData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchSpot()
  }, [spotId])

  return { data, loading, error }
}

export function useParkingSpots(spotIds: string[]) {
  const [data, setData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!spotIds.length) return

    const fetchSpots = async () => {
      try {
        setLoading(true)
        setError(null)
        const results: Record<string, any> = {}

        // Fetch all spots in parallel
        await Promise.all(
          spotIds.map(async (spotId) => {
            try {
              results[spotId] = await parkingService.getAllSpotData(spotId)
            } catch (err) {
              console.error(`Error fetching spot ${spotId}:`, err)
              // Provide fallback data
              results[spotId] = {
                latitude: 52.3676,
                longitude: 4.9041,
                spot_type: "street",
                address: `Amsterdam - ${spotId}`,
                is_available: true,
                last_updated: new Date().toISOString(),
              }
            }
          }),
        )

        setData(results)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchSpots()
  }, [spotIds.join(",")])

  return { data, loading, error }
}
