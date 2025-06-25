import { type NextRequest, NextResponse } from "next/server"
import type { NavigationRoute } from "@/lib/navigation-store"

export async function POST(request: NextRequest) {
  try {
    console.log("📍 Route calculation API called")

    const body = await request.json()
    const { from, to, options = {} } = body

    console.log("Route request:", { from, to, options })

    // Validate input
    if (!from || !to || !Array.isArray(from) || !Array.isArray(to)) {
      console.error("Invalid route request parameters")
      return NextResponse.json(
        { error: "Invalid parameters. Expected from and to as [longitude, latitude] arrays." },
        { status: 400 },
      )
    }

    if (from.length !== 2 || to.length !== 2) {
      console.error("Invalid coordinate format")
      return NextResponse.json({ error: "Invalid coordinate format. Expected [longitude, latitude]." }, { status: 400 })
    }    // Calculate realistic distance and duration
    const distance = calculateDistance(from as [number, number], to as [number, number])
    const baseSpeed = options.routeType === "eco" ? 25 : options.routeType === "shortest" ? 35 : 30 // km/h
    const duration = Math.max(300, (distance / 1000 / baseSpeed) * 3600) // Minimum 5 minutes
    const trafficMultiplier = options.avoidTraffic ? 1.0 : 1.2

    console.log(`Calculated distance: ${distance}m, duration: ${duration}s`)

    const mockRoute: NavigationRoute = {
      id: `route_${Date.now()}`,
      distance: Math.round(distance),
      duration: Math.round(duration * trafficMultiplier),
      trafficDelays: Math.round(duration * (trafficMultiplier - 1)),
      geometry: generateGeometry(from as [number, number], to as [number, number]),
      steps: generateSteps(from as [number, number], to as [number, number], distance, duration * trafficMultiplier),
    }

    console.log("✅ Route generated successfully")

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json(mockRoute)
  } catch (error) {
    console.error("❌ Route calculation error:", error)

    // Return a more detailed error response
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

    return NextResponse.json(
      {
        error: "Failed to calculate route",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

function calculateDistance(from: [number, number], to: [number, number]): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (from[1] * Math.PI) / 180
  const φ2 = (to[1] * Math.PI) / 180
  const Δφ = ((to[1] - from[1]) * Math.PI) / 180
  const Δλ = ((to[0] - from[0]) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

function generateGeometry(from: [number, number], to: [number, number]): [number, number][] {
  // Generate a more realistic route with multiple waypoints
  const waypoints: [number, number][] = [from]

  // Add intermediate points for a more realistic route
  for (let i = 1; i <= 3; i++) {
    const progress = i / 4
    const lat = from[1] + (to[1] - from[1]) * progress
    const lng = from[0] + (to[0] - from[0]) * progress

    // Add some variation to make the route more realistic
    const variation = 0.0001 * Math.sin(progress * Math.PI * 2)
    waypoints.push([lng + variation, lat + variation])
  }

  waypoints.push(to)
  return waypoints
}

function generateSteps(
  from: [number, number],
  to: [number, number],
  totalDistance: number,
  totalDuration: number,
): any[] {
  const steps = [
    {
      id: "step_1",
      instruction: "Head toward your destination",
      distance: Math.round(totalDistance * 0.3),
      duration: Math.round(totalDuration * 0.3),
      maneuver: { type: "straight" },
      streetName: "Current Street",
      coordinates: [from[0] + (to[0] - from[0]) * 0.3, from[1] + (to[1] - from[1]) * 0.3],
      speedLimit: 35,
    },
    {
      id: "step_2",
      instruction: "Continue straight on main route",
      distance: Math.round(totalDistance * 0.4),
      duration: Math.round(totalDuration * 0.4),
      maneuver: { type: "straight" },
      streetName: "Main Route",
      coordinates: [from[0] + (to[0] - from[0]) * 0.7, from[1] + (to[1] - from[1]) * 0.7],
      speedLimit: 30,
      laneGuidance: {
        lanes: [
          { valid: true, indications: ["straight"] },
          { valid: true, indications: ["straight"] },
          { valid: false, indications: ["right"] },
        ],
      },
    },
    {
      id: "step_3",
      instruction: "Arrive at your destination",
      distance: Math.round(totalDistance * 0.3),
      duration: Math.round(totalDuration * 0.3),
      maneuver: { type: "arrive" },
      streetName: "Destination Street",
      coordinates: to,
    },
  ]

  return steps
}
