import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { params: string[] } }) {
  try {
    const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN

    if (!mapboxToken) {
      return NextResponse.json({ error: "Mapbox token not configured" }, { status: 500 })
    }

    const [z, x, y] = params.params

    if (!z || !x || !y) {
      return NextResponse.json({ error: "Invalid tile parameters" }, { status: 400 })
    }

    // Fetch the tile from Mapbox using server-side token
    const tileUrl = `https://api.mapbox.com/styles/v1/mapbox/navigation-day-v1/tiles/256/${z}/${x}/${y}?access_token=${mapboxToken}`

    const response = await fetch(tileUrl)

    if (!response.ok) {
      throw new Error("Failed to fetch tile")
    }

    const tileData = await response.arrayBuffer()

    // Return the tile with proper headers
    return new NextResponse(tileData, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      },
    })
  } catch (error) {
    console.error("Error fetching map tile:", error)
    return NextResponse.json({ error: "Failed to fetch map tile" }, { status: 500 })
  }
}
