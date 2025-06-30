import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { lat, lng, radius } = await request.json()
    const apiKey = process.env.GOOGLE_PLACES_API_KEY

    if (!apiKey) {
      return NextResponse.json({ spots: [] })
    }

    // Search for parking-related places
    const searchTypes = ["parking", "gas_station", "shopping_mall", "airport"]
    const allSpots = []

    for (const type of searchTypes) {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&keyword=parking&key=${apiKey}`,
      )

      if (response.ok) {
        const data = await response.json()
        const spots = data.results
          ?.filter((place: any) => place.name.toLowerCase().includes("parking"))
          .map((place: any) => ({
            id: `google_${place.place_id}`,
            name: place.name,
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
            address: place.vicinity || place.formatted_address,
            spot_type: determineSpotType(place.name, place.types),
            is_available: true,
            price_per_hour: place.price_level ? place.price_level * 5 : undefined,
            provider: "google_places",
            provider_id: place.place_id,
            real_time_data: false,
            last_updated: new Date(),
          }))

        allSpots.push(...(spots || []))
      }
    }

    return NextResponse.json({ spots: allSpots })
  } catch (error) {

    return NextResponse.json({ spots: [] })
  }
}

function determineSpotType(name: string, types: string[]): string {
  const nameLower = name.toLowerCase()
  if (nameLower.includes("garage") || nameLower.includes("structure")) return "garage"
  if (nameLower.includes("lot") || nameLower.includes("surface")) return "lot"
  if (nameLower.includes("meter") || nameLower.includes("street")) return "meter"
  if (types.includes("parking")) return "lot"
  return "lot"
}
