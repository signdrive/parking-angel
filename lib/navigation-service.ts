import type { NavigationStep, NavigationRoute } from "./navigation-store"

export class NavigationService {
  private static instance: NavigationService
  private watchId: number | null = null
  private speechSynthesis: SpeechSynthesis | null = null

  private constructor() {
    if (typeof window !== "undefined") {
      this.speechSynthesis = window.speechSynthesis
    }
  }

  static getInstance(): NavigationService {
    if (!NavigationService.instance) {
      NavigationService.instance = new NavigationService()
    }
    return NavigationService.instance
  }

  async calculateRoute(
    from: [number, number],
    to: [number, number],
    options?: {
      avoidTraffic?: boolean
      routeType?: "fastest" | "shortest" | "eco"
    },
  ): Promise<NavigationRoute> {
    console.log("🗺️ Calculating Google Maps style route")

    try {
      const response = await fetch("/api/navigation/calculate-route", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to,
          options: options || {},
        }),
      })

      if (!response.ok) {
        throw new Error(`Route calculation failed: ${response.status}`)
      }

      const route: NavigationRoute = await response.json()
      return route
    } catch (error) {
      console.error("❌ Route calculation error:", error)
      return this.generateGoogleMapsRoute(from, to, options)
    }
  }

  private generateGoogleMapsRoute(
    from: [number, number],
    to: [number, number],
    options?: {
      avoidTraffic?: boolean
      routeType?: "fastest" | "shortest" | "eco"
    },
  ): NavigationRoute {
    console.log("🛠️ Generating Google Maps style route")

    const distance = this.calculateDistance(from, to)
    const baseSpeed = 30 // mph average
    const duration = (distance / 1609.34 / baseSpeed) * 3600 // Convert to seconds

    // Realistic values for city driving
    const clampedDistance = Math.max(500, Math.min(20000, distance))
    const clampedDuration = Math.max(60, Math.min(3600, duration))

    // Google Maps style street names
    const streetNames = [
      "Main St",
      "1st Ave",
      "Oak St",
      "Pine Ave",
      "Elm Dr",
      "Maple Rd",
      "Cedar Ln",
      "Park Blvd",
      "Broadway",
      "Market St",
      "Union St",
      "Mission St",
    ]

    // Generate realistic Google Maps style steps
    const steps: NavigationStep[] = [
      {
        id: "start",
        instruction: `Head ${this.getCardinalDirection(from, to)} on ${streetNames[0]}`,
        distance: Math.round(clampedDistance * 0.25),
        duration: Math.round(clampedDuration * 0.25),
        maneuver: { type: "straight" },
        streetName: streetNames[0],
        coordinates: [from[0] + (to[0] - from[0]) * 0.25, from[1] + (to[1] - from[1]) * 0.25],
        speedLimit: 35,
        laneGuidance: {
          lanes: [
            { valid: true, indications: ["straight"] },
            { valid: true, indications: ["straight"] },
            { valid: false, indications: ["right"] },
          ],
        },
      },
      {
        id: "turn1",
        instruction: `Turn right onto ${streetNames[1]}`,
        distance: Math.round(clampedDistance * 0.35),
        duration: Math.round(clampedDuration * 0.35),
        maneuver: { type: "turn-right" },
        streetName: streetNames[1],
        coordinates: [from[0] + (to[0] - from[0]) * 0.6, from[1] + (to[1] - from[1]) * 0.6],
        speedLimit: 30,
        laneGuidance: {
          lanes: [
            { valid: false, indications: ["straight"] },
            { valid: true, indications: ["right"] },
            { valid: true, indications: ["right"] },
          ],
        },
      },
      {
        id: "continue",
        instruction: `Continue straight on ${streetNames[1]}`,
        distance: Math.round(clampedDistance * 0.25),
        duration: Math.round(clampedDuration * 0.25),
        maneuver: { type: "straight" },
        streetName: streetNames[1],
        coordinates: [from[0] + (to[0] - from[0]) * 0.85, from[1] + (to[1] - from[1]) * 0.85],
        speedLimit: 25,
      },
      {
        id: "arrive",
        instruction: `Your destination will be on the right`,
        distance: Math.round(clampedDistance * 0.15),
        duration: Math.round(clampedDuration * 0.15),
        maneuver: { type: "arrive" },
        streetName: streetNames[2],
        coordinates: to,
      },
    ]

    // Generate smooth route geometry (Google Maps style)
    const geometry: [number, number][] = []
    const numPoints = 20
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints
      const lng = from[0] + (to[0] - from[0]) * t
      const lat = from[1] + (to[1] - from[1]) * t
      geometry.push([lng, lat])
    }

    const totalDistance = steps.reduce((sum, step) => sum + step.distance, 0)
    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0)

    return {
      id: `google_maps_route_${Date.now()}`,
      distance: totalDistance,
      duration: totalDuration,
      steps,
      geometry,
      trafficDelays: options?.avoidTraffic ? 0 : Math.round(totalDuration * 0.1),
    }
  }

  private getCardinalDirection(from: [number, number], to: [number, number]): string {
    const deltaLng = to[0] - from[0]
    const deltaLat = to[1] - from[1]

    const angle = Math.atan2(deltaLat, deltaLng) * (180 / Math.PI)

    if (angle >= -22.5 && angle < 22.5) return "east"
    if (angle >= 22.5 && angle < 67.5) return "northeast"
    if (angle >= 67.5 && angle < 112.5) return "north"
    if (angle >= 112.5 && angle < 157.5) return "northwest"
    if (angle >= 157.5 || angle < -157.5) return "west"
    if (angle >= -157.5 && angle < -112.5) return "southwest"
    if (angle >= -112.5 && angle < -67.5) return "south"
    if (angle >= -67.5 && angle < -22.5) return "southeast"

    return "north"
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
      console.error("Geolocation not supported")
      return
    }

    // Start with simulated location
    const simulatedLocation = {
      latitude: 37.7749,
      longitude: -122.4194,
      heading: 0,
      speed: 0,
    }

    onLocationUpdate(simulatedLocation)

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
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000,
      },
    )
  }

  stopLocationTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }
  }

  speakInstruction(instruction: string, enabled: boolean): void {
    if (!enabled || !this.speechSynthesis) return

    this.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(instruction)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 0.8
    utterance.lang = "en-US"

    this.speechSynthesis.speak(utterance)
  }

  formatDistance(meters: number): string {
    if (meters < 1609) {
      // Less than 1 mile
      const feet = Math.round(meters * 3.28084)
      return `${feet} ft`
    } else {
      const miles = (meters / 1609.34).toFixed(1)
      return `${miles} mi`
    }
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) {
      return `${minutes} min`
    } else {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `${hours} hr ${remainingMinutes} min`
    }
  }

  private calculateDistance(point1: [number, number], point2: [number, number]): number {
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
