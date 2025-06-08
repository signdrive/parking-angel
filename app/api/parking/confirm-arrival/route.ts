import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { spotId, arrivalTime } = await request.json()

    // Mock arrival confirmation
    const confirmationData = {
      success: true,
      spotId,
      arrivalTime,
      sessionId: `session_${Date.now()}`,
      parkingDuration: null, // Will be calculated when user leaves
      message: "Arrival confirmed! Enjoy your parking.",
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    return NextResponse.json(confirmationData)
  } catch (error) {
    console.error("Arrival confirmation error:", error)
    return NextResponse.json({ error: "Failed to confirm arrival" }, { status: 500 })
  }
}
