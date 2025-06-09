import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 })
    }

    // Return the API key securely from server-side
    return NextResponse.json({
      apiKey,
      configured: true,
    })
  } catch (error) {
    console.error("Error fetching Google Maps config:", error)
    return NextResponse.json({ error: "Failed to fetch maps configuration" }, { status: 500 })
  }
}
