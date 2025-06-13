import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { fcmToken } = await request.json()

    if (!fcmToken) {
      return NextResponse.json({ error: "FCM token is required" }, { status: 400 })
    }

    // Store FCM token in your database (Supabase or Firebase)
    // This is where you'd save the token for sending push notifications later

    console.log(`Subscribed user ${user.id} with FCM token: ${fcmToken}`)

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to notifications",
    })
  } catch (error) {
    console.error("Error subscribing to notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
