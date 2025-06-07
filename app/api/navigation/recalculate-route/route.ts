import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { from, to } = await request.json()

    // Mock recalculation with traffic avoidance
    const recalculatedRoute = {
      id: `route_recalc_${Date.now()}`,
      distance: 2800, // slightly longer due to traffic avoidance
      duration: 380, // faster due to avoiding traffic
      trafficDelays: 20,
      geometry: [
        from,
        [from[0] + 0.0015, from[1] + 0.0005], // different path
        [from[0] + 0.0025, from[1] + 0.0015],
        to,
      ],
      steps: [
        {
          id: "step_recalc_1",
          instruction: "Head northeast on Elm Street",
          distance: 600,
          duration: 80,
          maneuver: { type: "straight" },
          streetName: "Elm Street",
          coordinates: [from[0], from[1] + 0.0005],
          speedLimit: 35,
        },
        {
          id: "step_recalc_2",
          instruction: "Turn left onto Pine Road",
          distance: 900,
          duration: 140,
          maneuver: { type: "turn-left" },
          streetName: "Pine Road",
          coordinates: [from[0] + 0.0015, from[1] + 0.0005],
          speedLimit: 30,
        },
        {
          id: "step_recalc_3",
          instruction: "Turn right onto Oak Avenue",
          distance: 1300,
          duration: 160,
          maneuver: { type: "turn-right" },
          streetName: "Oak Avenue",
          coordinates: [from[0] + 0.0025, from[1] + 0.0015],
          speedLimit: 25,
        },
        {
          id: "step_recalc_4",
          instruction: "Arrive at destination on the right",
          distance: 0,
          duration: 0,
          maneuver: { type: "arrive" },
          streetName: "Oak Avenue",
          coordinates: to,
        },
      ],
    }

    // Simulate recalculation delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json(recalculatedRoute)
  } catch (error) {
    console.error("Route recalculation error:", error)
    return NextResponse.json({ error: "Failed to recalculate route" }, { status: 500 })
  }
}
