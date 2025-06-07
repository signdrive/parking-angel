import { type NextRequest, NextResponse } from "next/server"

interface PositionUpdate {
  latitude: number
  longitude: number
  heading: number
  speed: number
  accuracy: number
  routeId: string
  currentStepId: string
}

export async function POST(request: NextRequest) {
  try {
    const position: PositionUpdate = await request.json()

    console.log("📍 Position update:", position)

    // Simulate position analysis
    const isOffRoute = Math.random() < 0.05 // 5% chance of being off route
    const nextStepDistance = Math.max(0, Math.floor(Math.random() * 500))
    const speedLimit = 35 + Math.floor(Math.random() * 30) // 35-65 mph

    // Check if approaching destination (within 100m)
    const approachingDestination = nextStepDistance < 100

    // Traffic conditions
    const trafficConditions = ["light", "moderate", "heavy"][Math.floor(Math.random() * 3)]

    const response = {
      success: true,
      isOffRoute,
      nextStepDistance,
      speedLimit,
      approachingDestination,
      trafficConditions,
      estimatedTimeToNextStep: Math.ceil(nextStepDistance / Math.max(position.speed * 0.44704, 1)), // Convert mph to m/s
      laneGuidance: approachingDestination
        ? null
        : {
            lanes: [
              { valid: true, indications: ["straight"] },
              { valid: false, indications: ["right"] },
            ],
          },
      voiceInstruction: approachingDestination
        ? "Your parking spot is approaching on the right"
        : `In ${nextStepDistance} meters, turn right onto Oak Avenue`,
    }

    if (isOffRoute) {
      console.log("🔄 User is off route, triggering recalculation")
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ Position update error:", error)
    return NextResponse.json({ error: "Failed to process position update" }, { status: 500 })
  }
}
