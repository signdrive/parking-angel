import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { lat, lng, radius = 1000 } = await request.json()

    if (!lat || !lng) {
      return NextResponse.json({ error: "Missing coordinates" }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Google Places API not configured" }, { status: 500 })
    }

    // Search for real parking spots near the location
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=parking&key=${apiKey}`,
    )

    if (!response.ok) {
      throw new Error("Google Places API request failed")
    }

    const data = await response.json()

    const parkingSpots = data.results.map((place: any) => ({
      id: `google_${place.place_id}`,
      name: place.name,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      address: place.vicinity,
      spot_type: place.types.includes("parking") ? "lot" : "street",
      rating: place.rating,
      is_available: place.business_status === "OPERATIONAL",
      distance: calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng),
      source: "google_places_nearby",
    }))

    return NextResponse.json({ spots: parkingSpots })
  } catch (error) {
    console.error("Nearby search error:", error)
    return NextResponse.json({ error: "Failed to search nearby parking" }, { status: 500 })
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c * 1000 // Distance in meters
}
