import { NextResponse } from "next/server"

export async function GET() {
  // Use your provided Mapbox token as fallback
  const mapboxToken =
    process.env.MAPBOX_ACCESS_TOKEN ||
    "pk.eyJ1Ijoic3VyZmVhc3lhcHAiLCJhIjoiY21hdGtlODlnMG1jaDJsczQ2YmNtZmdxbyJ9.QVy8Bx_v_4GH6B_RBqGoCA"

  if (!mapboxToken) {
    return NextResponse.json({ error: "Mapbox token not configured" }, { status: 500 })
  }

  return NextResponse.json({ token: mapboxToken })
}
