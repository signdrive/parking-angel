"use client"

import type React from "react"
import { useEffect, useState } from "react"

interface SpotDetailsProps {
  spotId: string
  children: React.ReactNode
}

export function SpotDetailsProvider({ spotId, children }: SpotDetailsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [spotDetails, setSpotDetails] = useState<any>(null)

  useEffect(() => {
    const fetchSpotDetails = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Use the API endpoint instead of direct Supabase queries
        const response = await fetch(`/api/parking/spot-details?id=${spotId}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch spot details: ${response.status}`)
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch spot details")
        }

        setSpotDetails({
          ...data.details,
          is_available: data.availability?.is_available,
          last_updated: data.availability?.last_updated,
        })
      } catch (err) {
        console.error("Error fetching spot details:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setIsLoading(false)
      }
    }

    if (spotId) {
      fetchSpotDetails()
    }
  }, [spotId])

  return (
    <div className="spot-details-provider">
      {children}
      {isLoading && <div className="text-sm text-gray-500">Loading spot details...</div>}
      {error && <div className="text-sm text-red-500">Error: {error}</div>}
      {spotDetails && (
        <div className="mt-2 text-sm">
          <div>
            <strong>Address:</strong> {spotDetails.address}
          </div>
          <div>
            <strong>Type:</strong> {spotDetails.spot_type}
          </div>
          <div>
            <strong>Status:</strong> {spotDetails.is_available ? "Available" : "Occupied"}
          </div>
          <div>
            <strong>Last updated:</strong> {new Date(spotDetails.last_updated).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  )
}
