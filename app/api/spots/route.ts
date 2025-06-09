import { type NextRequest, NextResponse } from "next/server"
import { supabasePostgREST, rawSupabaseFetch } from "@/lib/supabase-postgrest-fix"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const lat = searchParams.get("lat") ? Number.parseFloat(searchParams.get("lat")!) : undefined
    const lng = searchParams.get("lng") ? Number.parseFloat(searchParams.get("lng")!) : undefined
    const radius = searchParams.get("radius") ? Number.parseInt(searchParams.get("radius")!) : 5000
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 50

    console.log("🔍 API: Fetching parking spots with PostgREST-compliant headers")

    // Validate parameters
    if (lat !== undefined && (isNaN(lat) || lat < -90 || lat > 90)) {
      return NextResponse.json({ error: "Invalid latitude" }, { status: 400 })
    }

    if (lng !== undefined && (isNaN(lng) || lng < -180 || lng > 180)) {
      return NextResponse.json({ error: "Invalid longitude" }, { status: 400 })
    }

    // Strategy 1: Try PostgREST-compliant Supabase client
    try {
      console.log("🔄 Attempting PostgREST-compliant client...")

      let query = supabasePostgREST
        .from("parking_spots")
        .select("id, latitude, longitude, spot_type, address, is_available, provider, confidence_score, last_updated")
        .eq("is_available", true)
        .order("id")
        .limit(limit)

      // Add location filtering if coordinates provided
      if (lat && lng) {
        const latDelta = radius / 111000
        const lngDelta = radius / (111000 * Math.cos((lat * Math.PI) / 180))

        query = query
          .gte("latitude", lat - latDelta)
          .lte("latitude", lat + latDelta)
          .gte("longitude", lng - lngDelta)
          .lte("longitude", lng + lngDelta)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(`PostgREST client error: ${error.message}`)
      }

      console.log(`✅ PostgREST client successful, found ${data?.length || 0} spots`)

      return NextResponse.json({
        data: data || [],
        count: data?.length || 0,
        source: "supabase-postgrest-client",
        timestamp: new Date().toISOString(),
      })
    } catch (clientError) {
      console.warn("⚠️ PostgREST client failed, trying raw fetch:", clientError)

      // Strategy 2: Raw fetch with minimal headers
      const params: Record<string, string> = {
        select: "id,latitude,longitude,spot_type,address,is_available,provider,confidence_score,last_updated",
        is_available: "eq.true",
        order: "id",
        limit: limit.toString(),
      }

      const result = await rawSupabaseFetch("parking_spots", params)

      if (result.error) {
        throw new Error(`Raw fetch error: ${result.error}`)
      }

      console.log(`✅ Raw fetch successful, found ${result.data?.length || 0} spots`)

      return NextResponse.json({
        data: result.data || [],
        count: result.data?.length || 0,
        source: "supabase-raw-fetch",
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error("❌ API error:", error)

    return NextResponse.json(
      {
        error: "Failed to fetch parking spots",
        details: error instanceof Error ? error.message : "Unknown error",
        data: [],
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
