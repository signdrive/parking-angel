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
      console.log("Calculating route from", start, "to", end)

      // Validate coordinates
      if (!start || !end || start.length !== 2 || end.length !== 2) {
        throw new Error("Invalid coordinates provided")
      }

      if (isNaN(start[0]) || isNaN(start[1]) || isNaN(end[0]) || isNaN(end[1])) {
        throw new Error("Coordinates contain invalid numbers")
      }

      const distance = this.calculateDistance(start[1], start[0], end[1], end[0])
      const duration = this.estimateDuration(distance, options.routeType)

      // Generate a route with proper waypoints
      const coordinates = this.generateRouteCoordinates(start, end)
      const instructions = this.generateInstructions(coordinates, distance)

      const route = {
        distance: Math.round(distance),
        duration: Math.round(duration),
        coordinates,
        instructions,
      }

      console.log("Route calculated successfully:", route)
      return route
    } catch (error) {
      console.error("Failed to calculate route:", error)
      throw new Error(`Route calculation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
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
    const steps = 6 // More steps for better navigation
    for (let i = 1; i < steps; i++) {
      const ratio = i / steps
      const lat = start[1] + (end[1] - start[1]) * ratio
      const lng = start[0] + (end[0] - start[0]) * ratio
      coordinates.push([lng, lat])
    }

    coordinates.push(end)
    return coordinates
  }

  private generateInstructions(coordinates: [number, number][], totalDistance: number): string[] {
    const instructions = ["Start your journey"]

    // Generate more realistic instructions
    const stepDistance = totalDistance / (coordinates.length - 1)

    for (let i = 1; i < coordinates.length - 1; i++) {
      const distance = Math.round(stepDistance)
      const turns = ["Continue straight", "Turn left", "Turn right", "Keep straight"]
      const instruction = `${turns[i % turns.length]} for ${this.formatDistance(distance)}`
      instructions.push(instruction)
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
