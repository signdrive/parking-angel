import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const { event, data } = await request.json()

    // Log analytics event to your backend
    console.log("Analytics Event:", {
      userId: user?.id,
      event,
      data,
      timestamp: new Date().toISOString(),
    })

    // You can store this in your database for custom analytics
    // or send to other analytics services

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error tracking analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
