import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a properly configured Supabase client
export const supabaseFixed = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      // Fix the Accept header issue
      Accept: "application/json",
      "Content-Type": "application/json",
      // Remove problematic headers
      "Accept-Profile": undefined,
      "Content-Profile": undefined,
    },
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: "public",
  },
})

// Query builder with proper headers
export class SupabaseQueryBuilder {
  static async getParkingSpotById(id: string) {
    try {
      console.log("🔍 Querying parking spot with ID:", id)

      // Use the fixed client with proper query structure
      const { data, error } = await supabaseFixed
        .from("parking_spots")
        .select("id, latitude, longitude, spot_type, address, is_available, last_updated")
        .eq("id", id)
        .maybeSingle()

      if (error) {
        console.error("❌ Supabase query error:", error)
        throw new Error(`Database query failed: ${error.message}`)
      }

      console.log("✅ Query successful, data:", data)
      return { data, error: null }
    } catch (error) {
      console.error("❌ Query builder error:", error)
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  static async getParkingSpots(params: {
    lat?: number
    lng?: number
    radius?: number
    limit?: number
  }) {
    try {
      const { lat, lng, radius = 5000, limit = 50 } = params

      console.log("🔍 Querying parking spots with params:", { lat, lng, radius, limit })

      let query = supabaseFixed
        .from("parking_spots")
        .select("id, latitude, longitude, spot_type, address, is_available, provider, confidence_score, last_updated")
        .eq("is_available", true)
        .order("id")
        .limit(limit)

      // Add location filtering if coordinates provided
      if (lat && lng) {
        // Use a simple bounding box for now to avoid complex PostGIS queries
        const latDelta = radius / 111000 // Rough conversion: 1 degree ≈ 111km
        const lngDelta = radius / (111000 * Math.cos((lat * Math.PI) / 180))

        query = query
          .gte("latitude", lat - latDelta)
          .lte("latitude", lat + latDelta)
          .gte("longitude", lng - lngDelta)
          .lte("longitude", lng + lngDelta)
      }

      const { data, error } = await query

      if (error) {
        console.error("❌ Supabase query error:", error)
        throw new Error(`Database query failed: ${error.message}`)
      }

      console.log(`✅ Query successful, found ${data?.length || 0} spots`)
      return { data, error: null }
    } catch (error) {
      console.error("❌ Query builder error:", error)
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  // Direct REST API call with proper headers (fallback method)
  static async directRestCall(endpoint: string, params: Record<string, string> = {}) {
    try {
      const url = new URL(`${supabaseUrl}/rest/v1/${endpoint}`)
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })

      console.log("🔗 Direct REST call to:", url.toString())

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json", // Fix the Accept header
          "Content-Type": "application/json",
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          // Remove problematic headers that cause 406 errors
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("✅ Direct REST call successful")
      return { data, error: null }
    } catch (error) {
      console.error("❌ Direct REST call error:", error)
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}
