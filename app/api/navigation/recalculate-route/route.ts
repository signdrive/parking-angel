import { type NextRequest, NextResponse } from "next/server"
import type { NavigationRoute } from "@/lib/navigation-store"

export async function POST(request: NextRequest) {
  try {
    const { from, to } = await request.json()

    console.log("🔄 Recalculating route from", from, "to", to)

    // Calculate realistic distance and duration
    const distance = calculateDistance(from, to)
    const duration = Math.max(300, distance / 10) // Minimum 5 minutes

    const mockRoute: NavigationRoute = {
      id: `recalc_route_${Date.now()}`,
      distance: Math.round(distance),
      duration: Math.round(duration),
      trafficDelays: Math.round(duration * 0.15), // 15% traffic delay for recalculation
      geometry: generateGeometry(from, to),
      steps: [
        {
          id: "recalc_step_1",
          instruction: "Head toward your destination",
          distance: Math.round(distance * 0.6),
          duration: Math.round(duration * 0.6),
          maneuver: { type: "straight" },
          streetName: "Recalculated Route",
          coordinates: [from[0] + (to[0] - from[0]) * 0.3, from[1] + (to[1] - from[1]) * 0.3],
          speedLimit: 30,
        },
        {
          id: "recalc_step_2",
          instruction: "Continue to destination",
          distance: Math.round(distance * 0.4),
          duration: Math.round(duration * 0.4),
          maneuver: { type: "straight" },
          streetName: "Destination Street",
          coordinates: [from[0] + (to[0] - from[0]) * 0.7, from[1] + (to[1] - from[1]) * 0.7],
          speedLimit: 25,
        },
        {
          id: "recalc_step_3",
          instruction: "Arrive at destination",
          distance: 0,
          duration: 30,
          maneuver: { type: "arrive" },
          streetName: "Destination",
          coordinates: to,
        },
      ],
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("✅ Route recalculated successfully")
    return NextResponse.json(mockRoute)
  } catch (error) {
    console.error("❌ Route recalculation error:", error)
    return NextResponse.json({ error: "Failed to recalculate route" }, { status: 500 })
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
  return [
    from,
    [from[0] + (to[0] - from[0]) * 0.33, from[1] + (to[1] - from[1]) * 0.33],
    [from[0] + (to[0] - from[0]) * 0.66, from[1] + (to[1] - from[1]) * 0.66],
    to,
  ]
}
