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
      console.log("🗺️ Calculating route from", from, "to", to)

      // Calculate realistic distance and duration
      const distance = this.calculateHaversineDistance(from, to)
      const duration = Math.max(300, distance / 10) // Minimum 5 minutes, ~10m/s average speed

      // Generate realistic route steps
      const steps = this.generateRouteSteps(from, to, distance, duration)

      const route: NavigationRoute = {
        id: `route_${Date.now()}`,
        distance: Math.round(distance),
        duration: Math.round(duration),
        trafficDelays: Math.round(duration * 0.1), // 10% traffic delay
        geometry: this.generateRouteGeometry(from, to, steps.length),
        steps,
      }

      console.log("✅ Route calculated:", route)
      return route
    } catch (error) {
      console.error("❌ Route calculation failed:", error)
      throw error
    }
  }

  private generateRouteSteps(
    from: [number, number],
    to: [number, number],
    totalDistance: number,
    totalDuration: number,
  ): NavigationStep[] {
    const steps: NavigationStep[] = []
    const numSteps = Math.min(8, Math.max(3, Math.floor(totalDistance / 500))) // 3-8 steps

    const streetNames = [
      "Main Street",
      "Oak Avenue",
      "Pine Road",
      "Elm Street",
      "Cedar Lane",
      "Maple Drive",
      "Park Avenue",
      "First Street",
      "Second Street",
      "Broadway",
    ]

    const maneuvers: NavigationStep["maneuver"]["type"][] = [
      "straight",
      "turn-left",
      "turn-right",
      "straight",
      "turn-right",
      "straight",
      "turn-left",
      "arrive",
    ]

    for (let i = 0; i < numSteps; i++) {
      const isLastStep = i === numSteps - 1
      const stepDistance = isLastStep ? 0 : totalDistance / numSteps
      const stepDuration = isLastStep ? 30 : totalDuration / numSteps

      // Interpolate coordinates
      const progress = i / (numSteps - 1)
      const lat = from[1] + (to[1] - from[1]) * progress
      const lng = from[0] + (to[0] - from[0]) * progress

      const step: NavigationStep = {
        id: `step_${i + 1}`,
        instruction: isLastStep
          ? "Arrive at destination on the right"
          : this.generateInstruction(maneuvers[i % maneuvers.length], streetNames[i % streetNames.length]),
        distance: Math.round(stepDistance),
        duration: Math.round(stepDuration),
        maneuver: { type: isLastStep ? "arrive" : maneuvers[i % maneuvers.length] },
        streetName: streetNames[i % streetNames.length],
        coordinates: [lng, lat],
        speedLimit: isLastStep ? undefined : [25, 30, 35, 40][Math.floor(Math.random() * 4)],
      }

      // Add lane guidance for turns
      if (step.maneuver.type.includes("turn")) {
        step.laneGuidance = {
          lanes: [
            { valid: step.maneuver.type === "turn-left", indications: ["left"] },
            { valid: step.maneuver.type === "straight", indications: ["straight"] },
            { valid: step.maneuver.type === "turn-right", indications: ["right"] },
          ],
        }
      }

      steps.push(step)
    }

    return steps
  }

  private generateInstruction(maneuver: string, streetName: string): string {
    switch (maneuver) {
      case "turn-left":
        return `Turn left onto ${streetName}`
      case "turn-right":
        return `Turn right onto ${streetName}`
      case "straight":
        return `Continue straight on ${streetName}`
      case "merge":
        return `Merge onto ${streetName}`
      default:
        return `Continue on ${streetName}`
    }
  }

  private generateRouteGeometry(from: [number, number], to: [number, number], numPoints: number): [number, number][] {
    const geometry: [number, number][] = [from]

    for (let i = 1; i < numPoints - 1; i++) {
      const progress = i / (numPoints - 1)
      const lat = from[1] + (to[1] - from[1]) * progress
      const lng = from[0] + (to[0] - from[0]) * progress

      // Add some randomness to make it look like a real route
      const randomOffset = 0.001
      const offsetLat = lat + (Math.random() - 0.5) * randomOffset
      const offsetLng = lng + (Math.random() - 0.5) * randomOffset

      geometry.push([offsetLng, offsetLat])
    }

    geometry.push(to)
    return geometry
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

  calculateHaversineDistance(point1: [number, number], point2: [number, number]): number {
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
