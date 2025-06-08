import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { spotId } = await request.json()

    if (!spotId) {
      return NextResponse.json({ error: "Missing spot ID" }, { status: 400 })
    }

    let coordinates = null

    // Handle Google Places IDs
    if (spotId.startsWith("google_")) {
      const placeId = spotId.replace("google_", "")
      coordinates = await getGooglePlaceCoordinates(placeId)
    }
    // Handle OpenStreetMap IDs
    else if (spotId.startsWith("osm_")) {
      const osmId = spotId.replace("osm_", "")
      coordinates = await getOSMCoordinates(osmId)
    }

    if (!coordinates) {
      // Fallback to Amsterdam city center with slight randomization
      coordinates = {
        latitude: 52.3676 + (Math.random() - 0.5) * 0.02,
        longitude: 4.9041 + (Math.random() - 0.5) * 0.02,
        address: `Amsterdam - ${spotId}`,
        source: "fallback",
      }
    }

    return NextResponse.json(coordinates)
  } catch (error) {
    console.error("Error getting coordinates:", error)
    return NextResponse.json({ error: "Failed to get coordinates" }, { status: 500 })
  }
}

async function getGooglePlaceCoordinates(placeId: string) {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY
    if (!apiKey) {
      console.log("No Google Places API key found")
      return null
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address&key=${apiKey}`,
    )

    if (!response.ok) {
      console.log("Google Places API request failed")
      return null
    }

    const data = await response.json()

    if (data.result?.geometry?.location) {
      return {
        latitude: data.result.geometry.location.lat,
        longitude: data.result.geometry.location.lng,
        address: data.result.formatted_address || `Google Place ${placeId}`,
        source: "google_places",
      }
    }
  } catch (error) {
    console.error("Google Places API error:", error)
  }
  return null
}

async function getOSMCoordinates(osmId: string) {
  try {
    // Try OpenStreetMap Nominatim API
    const response = await fetch(
      `https://nominatim.openstreetmap.org/lookup?osm_ids=N${osmId}&format=json&addressdetails=1`,
      {
        headers: {
          "User-Agent": "ParkingAngel/1.0",
        },
      },
    )

    if (!response.ok) {
      console.log("OSM Nominatim request failed")
      return null
    }

    const data = await response.json()

    if (data.length > 0 && data[0].lat && data[0].lon) {
      return {
        latitude: Number.parseFloat(data[0].lat),
        longitude: Number.parseFloat(data[0].lon),
        address: data[0].display_name || `OSM Node ${osmId}`,
        source: "openstreetmap",
      }
    }
  } catch (error) {
    console.error("OSM API error:", error)
  }
  return null
}
