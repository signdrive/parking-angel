import { NextResponse } from "next/server"

export async function GET() {
  const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN

  if (!mapboxToken) {
    return NextResponse.json({ error: "Mapbox token not configured" }, { status: 500 })
  }

  return NextResponse.json({ token: mapboxToken })
}
