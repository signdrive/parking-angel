import { type NextRequest, NextResponse } from "next/server"

interface RouteRequest {
  origin: { latitude: number; longitude: number }
  destination: { latitude: number; longitude: number; spotId: string }
  preferences: {
    avoidTraffic: boolean
    routeType: "fastest" | "shortest" | "eco"
    avoidTolls: boolean
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: RouteRequest = await request.json()

    console.log("🗺️ Starting route calculation:", body)

    // Simulate TomTom API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const route = {
      id: `route_${Date.now()}`,
      distance: Math.floor(Math.random() * 5000) + 1000, // 1-6km
      duration: Math.floor(Math.random() * 1800) + 300, // 5-35 minutes
      steps: [
        {
          id: "start",
          instruction: "Head northeast on Main Street",
          distance: 250,
          duration: 45,
          maneuver: { type: "straight" as const },
          streetName: "Main Street",
          coordinates: [body.origin.longitude, body.origin.latitude] as [number, number],
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
          instruction: "Turn right onto Oak Avenue",
          distance: 400,
          duration: 90,
          maneuver: { type: "turn-right" as const },
          streetName: "Oak Avenue",
          coordinates: [body.origin.longitude + 0.002, body.origin.latitude + 0.001] as [number, number],
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
          id: "roundabout",
          instruction: "At the roundabout, take the 2nd exit onto Park Boulevard",
          distance: 150,
          duration: 60,
          maneuver: { type: "roundabout" as const, modifier: "second-exit" },
          streetName: "Park Boulevard",
          coordinates: [body.origin.longitude + 0.004, body.origin.latitude + 0.002] as [number, number],
          speedLimit: 25,
        },
        {
          id: "arrive",
          instruction: "Your parking spot is on the right",
          distance: 50,
          duration: 15,
          maneuver: { type: "arrive" as const },
          streetName: "Park Boulevard",
          coordinates: [body.destination.longitude, body.destination.latitude] as [number, number],
        },
      ],
      geometry: generateRouteGeometry(body.origin, body.destination),
      trafficDelays: body.preferences.avoidTraffic ? 0 : Math.floor(Math.random() * 300),
      alternativeRoutes: [
        {
          id: `alt_route_${Date.now()}`,
          distance: Math.floor(Math.random() * 5000) + 1200,
          duration: Math.floor(Math.random() * 1800) + 400,
          steps: [],
          geometry: [],
          trafficDelays: Math.floor(Math.random() * 600),
        },
      ],
    }

    console.log("✅ Route calculated successfully")

    return NextResponse.json({
      success: true,
      route,
      estimatedArrival: new Date(Date.now() + route.duration * 1000),
      trafficConditions: "moderate",
    })
  } catch (error) {
    console.error("❌ Route calculation error:", error)
    return NextResponse.json({ error: "Failed to calculate route" }, { status: 500 })
  }
}

function generateRouteGeometry(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
): [number, number][] {
  const points: [number, number][] = []
  const steps = 20

  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const lng = origin.longitude + (destination.longitude - origin.longitude) * t
    const lat = origin.latitude + (destination.latitude - origin.latitude) * t

    // Add some curve to make it look more realistic
    const curve = Math.sin(t * Math.PI) * 0.001
    points.push([lng + curve, lat])
  }

  return points
}
