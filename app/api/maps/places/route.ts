import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { lat, lng, radius, query } = await request.json()
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 })
    }

    // Perform Google Places API search server-side
    const placesUrl = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json")
    placesUrl.searchParams.set("location", `${lat},${lng}`)
    placesUrl.searchParams.set("radius", radius.toString())
    placesUrl.searchParams.set("keyword", query || "parking")
    placesUrl.searchParams.set("key", apiKey)

    const response = await fetch(placesUrl.toString())

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      results: data.results || [],
      status: data.status,
    })
  } catch (error) {
    console.error("Google Places API error:", error)
    return NextResponse.json({ error: "Failed to fetch places data" }, { status: 500 })
  }
}
