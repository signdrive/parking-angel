interface RouteOptions {
  avoidTraffic?: boolean
  routeType?: "fastest" | "shortest" | "scenic"
}

interface NavigationRoute {
  distance: number // in meters
  duration: number // in seconds
  coordinates: [number, number][]
  instructions: string[]
}

export class NavigationService {
  private static instance: NavigationService

  private constructor() {}

  static getInstance(): NavigationService {
    if (!NavigationService.instance) {
      NavigationService.instance = new NavigationService()
    }
    return NavigationService.instance
  }

  async calculateRoute(
    start: [number, number],
    end: [number, number],
    options: RouteOptions = {},
  ): Promise<NavigationRoute> {
    try {
      // In a real app, this would call a routing service like Mapbox Directions API
      // For now, we'll simulate a route calculation

      const distance = this.calculateDistance(start[1], start[0], end[1], end[0])
      const duration = this.estimateDuration(distance, options.routeType)

      // Generate a simple route with waypoints
      const coordinates = this.generateRouteCoordinates(start, end)
      const instructions = this.generateInstructions(coordinates)

      return {
        distance: Math.round(distance),
        duration: Math.round(duration),
        coordinates,
        instructions,
      }
    } catch (error) {
      console.error("Failed to calculate route:", error)
      throw new Error("Route calculation failed")
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  private estimateDuration(distance: number, routeType?: string): number {
    // Estimate duration based on distance and route type
    let avgSpeed = 30 // km/h default city speed

    switch (routeType) {
      case "fastest":
        avgSpeed = 40
        break
      case "shortest":
        avgSpeed = 25
        break
      case "scenic":
        avgSpeed = 20
        break
    }

    return (distance / 1000 / avgSpeed) * 3600 // Convert to seconds
  }

  private generateRouteCoordinates(start: [number, number], end: [number, number]): [number, number][] {
    const coordinates: [number, number][] = [start]

    // Generate intermediate waypoints (simplified)
    const steps = 5
    for (let i = 1; i < steps; i++) {
      const ratio = i / steps
      const lat = start[1] + (end[1] - start[1]) * ratio
      const lng = start[0] + (end[0] - start[0]) * ratio
      coordinates.push([lng, lat])
    }

    coordinates.push(end)
    return coordinates
  }

  private generateInstructions(coordinates: [number, number][]): string[] {
    const instructions = ["Start your journey"]

    for (let i = 1; i < coordinates.length - 1; i++) {
      instructions.push(`Continue for ${Math.round(Math.random() * 500 + 100)}m`)
    }

    instructions.push("You have arrived at your destination")
    return instructions
  }

  formatDistance(distance: number): string {
    if (distance < 1000) {
      return `${Math.round(distance)}m`
    } else {
      return `${(distance / 1000).toFixed(1)}km`
    }
  }

  formatDuration(duration: number): string {
    const minutes = Math.floor(duration / 60)
    if (minutes < 60) {
      return `${minutes} min`
    } else {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `${hours}h ${remainingMinutes}m`
    }
  }
}
