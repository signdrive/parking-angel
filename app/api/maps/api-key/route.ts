import { NextResponse } from "next/server"

export async function GET() {
  // Use the server-side environment variable (without NEXT_PUBLIC_ prefix)
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 })
  }

  return NextResponse.json({
    apiKey: apiKey,
  })
}
