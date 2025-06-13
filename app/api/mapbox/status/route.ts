import { NextResponse } from "next/server"

export async function GET() {
  const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN

  if (!mapboxToken) {
    return NextResponse.json({ configured: false, error: "Token not configured" }, { status: 200 })
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/test.json?access_token=${mapboxToken}`,
    )

    if (response.ok) {
      return NextResponse.json({ configured: true, connected: true })
    } else {
      return NextResponse.json({ configured: true, connected: false, error: "Invalid token" })
    }
  } catch (error) {
    return NextResponse.json({ configured: true, connected: false, error: "Connection failed" })
  }
}
