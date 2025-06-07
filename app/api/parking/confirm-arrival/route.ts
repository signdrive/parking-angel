import { type NextRequest, NextResponse } from "next/server"

interface ArrivalConfirmation {
  spotId: string
  userId: string
  arrivalTime: string
  reservationId?: string
  vehicleLocation: {
    latitude: number
    longitude: number
    accuracy: number
  }
}

export async function POST(request: NextRequest) {
  try {
    const confirmation: ArrivalConfirmation = await request.json()

    console.log("🎯 Confirming parking arrival:", confirmation)

    // Simulate arrival processing
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Generate parking session
    const sessionId = `session_${Date.now()}`
    const maxDuration = 2 * 60 * 60 * 1000 // 2 hours in milliseconds
    const sessionExpiry = new Date(Date.now() + maxDuration)

    const response = {
      success: true,
      sessionId,
      spotId: confirmation.spotId,
      arrivalTime: confirmation.arrivalTime,
      sessionExpiry: sessionExpiry.toISOString(),
      parkingInstructions: [
        "Park within the designated lines",
        "Display parking confirmation on dashboard",
        "Maximum stay: 2 hours",
        "Payment will be processed automatically",
      ],
      walkingDirections: {
        distance: Math.floor(Math.random() * 200) + 50, // 50-250m walk
        duration: Math.floor(Math.random() * 180) + 60, // 1-4 minutes
        instructions: [
          "Exit your vehicle",
          "Walk north towards the main entrance",
          "Your destination is 150 meters ahead",
        ],
      },
      paymentInfo: confirmation.reservationId
        ? {
            amount: "$3.50",
            duration: "2 hours",
            paymentMethod: "Credit Card ending in 4242",
            receiptId: `receipt_${Date.now()}`,
          }
        : null,
    }

    console.log("✅ Arrival confirmed successfully")

    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ Arrival confirmation error:", error)
    return NextResponse.json({ error: "Failed to confirm arrival" }, { status: 500 })
  }
}
