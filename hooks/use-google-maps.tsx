"use client"

import { useState, useEffect } from "react"

interface GoogleMapsConfig {
  apiKey: string | null
  isLoaded: boolean
  error: string | null
}

export function useGoogleMaps(): GoogleMapsConfig {
  const [config, setConfig] = useState<GoogleMapsConfig>({
    apiKey: null,
    isLoaded: false,
    error: null,
  })

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/maps/config")

        if (!response.ok) {
          throw new Error("Failed to fetch Google Maps configuration")
        }

        const data = await response.json()

        setConfig({
          apiKey: data.apiKey,
          isLoaded: true,
          error: null,
        })
      } catch (error) {
        setConfig({
          apiKey: null,
          isLoaded: true,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    fetchConfig()
  }, [])

  return config
}
