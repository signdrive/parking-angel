import type { NavigationRoute, NavigationStep } from "./navigation-store"

export class NavigationService {
  private static instance: NavigationService
  private watchId: number | null = null
  private speechSynthesis: SpeechSynthesis | null = null

  static getInstance(): NavigationService {
    if (!NavigationService.instance) {
      NavigationService.instance = new NavigationService()
    }
    return NavigationService.instance
  }

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.speechSynthesis = window.speechSynthesis
    }
  }

  async calculateRoute(
    from: [number, number],
    to: [number, number],
    options: {
      avoidTraffic?: boolean
      routeType?: "fastest" | "shortest" | "eco"
    } = {},
  ): Promise<NavigationRoute> {
    try {
      const response = await fetch("/api/navigation/calculate-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to,
          options,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to calculate route")
      }

      return await response.json()
    } catch (error) {
      console.error("Route calculation failed:", error)
      throw error
    }
  }

  startLocationTracking(
    onLocationUpdate: (location: {
      latitude: number
      longitude: number
      heading: number
      speed: number
    }) => void,
    onError: (error: GeolocationPositionError) => void,
  ): void {
    if (!navigator.geolocation) {
      throw new Error("Geolocation is not supported")
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 1000,
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        onLocationUpdate({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          heading: position.coords.heading || 0,
          speed: position.coords.speed || 0,
        })
      },
      onError,
      options,
    )
  }

  stopLocationTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }
  }

  speakInstruction(instruction: string, voiceEnabled: boolean): void {
    if (!this.speechSynthesis || !voiceEnabled) return

    // Cancel any ongoing speech
    this.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(instruction)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 0.8

    this.speechSynthesis.speak(utterance)
  }

  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)}m`
    } else {
      return `${(meters / 1000).toFixed(1)}km`
    }
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  getManeuverIcon(maneuver: NavigationStep["maneuver"]): string {
    const iconMap = {
      "turn-left": "↰",
      "turn-right": "↱",
      straight: "↑",
      merge: "⤴",
      roundabout: "↻",
      arrive: "📍",
    }

    return iconMap[maneuver.type] || "↑"
  }

  calculateOffRouteDistance(userLocation: [number, number], routeGeometry: [number, number][]): number {
    // Simplified distance calculation to nearest route point
    let minDistance = Number.POSITIVE_INFINITY

    for (const point of routeGeometry) {
      const distance = this.calculateHaversineDistance(userLocation, point)
      if (distance < minDistance) {
        minDistance = distance
      }
    }

    return minDistance
  }

  private calculateHaversineDistance(point1: [number, number], point2: [number, number]): number {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (point1[1] * Math.PI) / 180
    const φ2 = (point2[1] * Math.PI) / 180
    const Δφ = ((point2[1] - point1[1]) * Math.PI) / 180
    const Δλ = ((point2[0] - point1[0]) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }
}
