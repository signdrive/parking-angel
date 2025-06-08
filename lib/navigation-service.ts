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
    destinationName: string,
  ): Promise<NavigationRoute> {
    console.log("🗺️ Calculating route from", from, "to", to)

    // Generate realistic route with multiple steps
    const steps: NavigationStep[] = [
      {
        id: "1",
        instruction: "Head north on Main Street",
        distance: 500,
        duration: 60,
        maneuver: { type: "straight" },
        streetName: "Main Street",
        coordinates: [from[0], from[1] + 0.001],
        speedLimit: 35,
      },
      {
        id: "2",
        instruction: "Turn right onto Oak Avenue",
        distance: 300,
        duration: 45,
        maneuver: { type: "turn-right" },
        streetName: "Oak Avenue",
        coordinates: [from[0] + 0.002, from[1] + 0.001],
        speedLimit: 25,
        laneGuidance: {
          lanes: [
            { valid: false, indications: ["straight"] },
            { valid: true, indications: ["right"] },
            { valid: true, indications: ["right"] },
          ],
        },
      },
      {
        id: "3",
        instruction: "Continue straight for 800 meters",
        distance: 800,
        duration: 120,
        maneuver: { type: "straight" },
        streetName: "Oak Avenue",
        coordinates: [from[0] + 0.004, from[1] + 0.001],
        speedLimit: 25,
      },
      {
        id: "4",
        instruction: "Turn left onto Pine Street",
        distance: 200,
        duration: 30,
        maneuver: { type: "turn-left" },
        streetName: "Pine Street",
        coordinates: [from[0] + 0.004, from[1] + 0.003],
        speedLimit: 30,
      },
      {
        id: "5",
        instruction: "Enter roundabout and take 2nd exit",
        distance: 150,
        duration: 45,
        maneuver: { type: "roundabout" },
        streetName: "Pine Street",
        coordinates: [from[0] + 0.003, from[1] + 0.004],
        speedLimit: 20,
      },
      {
        id: "6",
        instruction: `Arrive at ${destinationName}`,
        distance: 100,
        duration: 20,
        maneuver: { type: "arrive" },
        streetName: "Pine Street",
        coordinates: to,
      },
    ]

    // Generate route geometry (simplified)
    const geometry: [number, number][] = [
      from,
      [from[0], from[1] + 0.001],
      [from[0] + 0.002, from[1] + 0.001],
      [from[0] + 0.004, from[1] + 0.001],
      [from[0] + 0.004, from[1] + 0.003],
      [from[0] + 0.003, from[1] + 0.004],
      to,
    ]

    const totalDistance = steps.reduce((sum, step) => sum + step.distance, 0)
    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0)

    return {
      id: `route_${Date.now()}`,
      distance: totalDistance,
      duration: totalDuration,
      steps,
      geometry,
      trafficDelays: 0,
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
      console.error("Geolocation not supported")
      return
    }

    // Start with a simulated location for demo purposes
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

    // Cancel any ongoing speech
    this.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(instruction)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 0.8

    this.speechSynthesis.speak(utterance)
  }

  getManeuverIcon(maneuver: NavigationStep["maneuver"]): string {
    switch (maneuver.type) {
      case "turn-left":
        return "↰"
      case "turn-right":
        return "↱"
      case "straight":
        return "↑"
      case "merge":
        return "⤴"
      case "roundabout":
        return "↻"
      case "arrive":
        return "🏁"
      default:
        return "↑"
    }
  }

  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)}m`
    } else {
      return `${(meters / 1000).toFixed(1)}km`
    }
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) {
      return `${minutes}m`
    } else {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `${hours}h ${remainingMinutes}m`
    }
  }

  calculateOffRouteDistance(userLocation: [number, number], routeGeometry: [number, number][]): number {
    // Simplified distance calculation
    let minDistance = Number.POSITIVE_INFINITY

    for (const point of routeGeometry) {
      const distance = this.calculateDistance(userLocation, point)
      if (distance < minDistance) {
        minDistance = distance
      }
    }

    return minDistance * 1000 // Convert to meters
  }

  private calculateDistance(point1: [number, number], point2: [number, number]): number {
    const R = 6371 // Earth's radius in km
    const dLat = this.toRadians(point2[1] - point1[1])
    const dLon = this.toRadians(point2[0] - point1[0])
    const lat1 = this.toRadians(point1[1])
    const lat2 = this.toRadians(point2[1])

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }
}
