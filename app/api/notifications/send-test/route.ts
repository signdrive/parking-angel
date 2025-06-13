import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = await request.json()

    // In a real app, you'd use Firebase Admin SDK to send notifications
    // For now, we'll simulate a successful response
    console.log(`Sending test notification to user: ${userId}`)

    // Example of what you'd do with Firebase Admin SDK:
    /*
    const admin = require('firebase-admin');
    
    const message = {
      notification: {
        title: 'Test Notification',
        body: 'This is a test notification from Park Algo!'
      },
      token: userFCMToken, // You'd get this from your database
    };

    const response = await admin.messaging().send(message);
    */

    return NextResponse.json({
      success: true,
      message: "Test notification sent successfully",
    })
  } catch (error) {
    console.error("Error sending test notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
