import { type NextRequest, NextResponse } from "next/server"
import type { NavigationRoute } from "@/lib/navigation-store"

export async function POST(request: NextRequest) {
  try {
    const { from, to, options } = await request.json()

    // Mock route calculation - replace with actual TomTom/Mapbox API
    const mockRoute: NavigationRoute = {
      id: `route_${Date.now()}`,
      distance: 2500, // meters
      duration: 420, // seconds (7 minutes)
      trafficDelays: 60, // seconds
      geometry: [from, [from[0] + 0.001, from[1] + 0.001], [from[0] + 0.002, from[1] + 0.002], to],
      steps: [
        {
          id: "step_1",
          instruction: "Head north on Main Street",
          distance: 500,
          duration: 60,
          maneuver: { type: "straight" },
          streetName: "Main Street",
          coordinates: [from[0], from[1] + 0.001],
          speedLimit: 35,
        },
        {
          id: "step_2",
          instruction: "Turn right onto Oak Avenue",
          distance: 800,
          duration: 120,
          maneuver: { type: "turn-right" },
          streetName: "Oak Avenue",
          coordinates: [from[0] + 0.001, from[1] + 0.001],
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
          id: "step_3",
          instruction: "Continue straight for 0.8 miles",
          distance: 1200,
          duration: 180,
          maneuver: { type: "straight" },
          streetName: "Oak Avenue",
          coordinates: [from[0] + 0.002, from[1] + 0.002],
          speedLimit: 30,
        },
        {
          id: "step_4",
          instruction: "Arrive at destination on the right",
          distance: 0,
          duration: 60,
          maneuver: { type: "arrive" },
          streetName: "Oak Avenue",
          coordinates: to,
        },
      ],
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json(mockRoute)
  } catch (error) {
    console.error("Route calculation error:", error)
    return NextResponse.json({ error: "Failed to calculate route" }, { status: 500 })
  }
}
