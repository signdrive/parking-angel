"use client"

import { useState, useEffect } from "react"

interface ParkingSpot {
  id: string
  name: string
  latitude: number
  longitude: number
  address: string
  price_per_hour?: number
  spot_type: string
  provider: string
  is_available: boolean
  total_spaces?: number
  available_spaces?: number
}

export function useParkingSpots() {
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Mock data for demo purposes
    const mockSpots: ParkingSpot[] = [
      {
        id: "1",
        name: "Downtown Garage",
        latitude: 37.7749,
        longitude: -122.4194,
        address: "123 Main St, San Francisco, CA",
        price_per_hour: 15,
        spot_type: "garage",
        provider: "ParkWhiz",
        is_available: true,
        total_spaces: 100,
        available_spaces: 25,
      },
      {
        id: "2",
        name: "Street Parking",
        latitude: 37.7849,
        longitude: -122.4094,
        address: "456 Oak Ave, San Francisco, CA",
        price_per_hour: 5,
        spot_type: "street",
        provider: "City",
        is_available: true,
        total_spaces: 10,
        available_spaces: 3,
      },
    ]

    setParkingSpots(mockSpots)
  }, [])

  return {
    parkingSpots,
    loading,
    error,
  }
}
