import { NextResponse } from "next/server"

export async function GET() {
  // Use your provided Mapbox token as fallback
  const mapboxToken =
    process.env.MAPBOX_ACCESS_TOKEN ||
    "pk.eyJ1Ijoic3VyZmVhc3lhcHAiLCJhIjoiY21hdGtlODlnMG1jaDJsczQ2YmNtZmdxbyJ9.QVy8Bx_v_4GH6B_RBqGoCA"

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
