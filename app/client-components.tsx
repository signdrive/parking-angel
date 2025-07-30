"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useGeolocation } from "@/hooks/use-geolocation"
import { trackPageView } from "@/components/analytics/google-analytics-provider"

export function ClientInteractiveComponents() {
  const [mounted, setMounted] = useState(false)
  const { latitude, longitude, error, loading, requestGeolocation } = useGeolocation()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Track homepage view
  useEffect(() => {
    if (mounted) {
      trackPageView('/', 'Parkalgo - AI Parking Optimization Software | Smart Algorithms');
    }
  }, [mounted]);

  if (!mounted) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <div className="bg-blue-50 rounded-lg p-6 max-w-md mx-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Get Started with Smart Parking
        </h3>
        <Button onClick={requestGeolocation} className="mb-2 w-full">
          Find Parking Near Me
        </Button>
        {loading && <p className="text-gray-500 text-sm">Getting your location...</p>}
        {latitude && longitude && (
          <p className="text-green-600 text-sm">
            Location found: {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </p>
        )}
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
    </div>
  )
}
