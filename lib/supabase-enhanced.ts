import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Enhanced Supabase client with proper headers
export const supabaseEnhanced = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      // Explicitly set Accept header to application/json
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

// Direct fetch function with minimal headers
export async function directFetch<T>(
  endpoint: string,
  params: Record<string, string> = {},
): Promise<{ data: T | null; error: string | null }> {
  try {
    const url = new URL(`${supabaseUrl}/rest/v1/${endpoint}`)

    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    console.log(`🔍 Direct fetch to: ${url.toString()}`)

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        // Minimal set of headers to avoid 406 errors
        Accept: "application/json",
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      // Disable cache to prevent stale responses
      cache: "no-store",
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`)
    }

    const data = await response.json()
    return { data, error: null }
  } catch (error) {
    console.error("❌ Direct fetch error:", error)
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Parking spots service with multiple fallback strategies
export class ParkingService {
  // Get a specific parking spot by ID
  static async getSpotById(id: string) {
    console.log(`🔍 Getting parking spot with ID: ${id}`)

    // Strategy 1: Try with enhanced Supabase client
    try {
      console.log("Strategy 1: Using enhanced Supabase client")
      const { data, error } = await supabaseEnhanced
        .from("parking_spots")
        .select("id, latitude, longitude, spot_type, address, is_available, last_updated")
        .eq("id", id)
        .maybeSingle()

      if (error) throw error
      if (data) return { data, error: null }
    } catch (error) {
      console.warn("⚠️ Strategy 1 failed:", error)
    }

    // Strategy 2: Try with direct fetch
    try {
      console.log("Strategy 2: Using direct fetch")
      const result = await directFetch("parking_spots", {
        select: "id,latitude,longitude,spot_type,address,is_available,last_updated",
        id: `eq.${id}`,
      })

      if (result.error) throw new Error(result.error)
      if (result.data) return { data: result.data, error: null }
    } catch (error) {
      console.warn("⚠️ Strategy 2 failed:", error)
    }

    // Strategy 3: Try with minimal fields
    try {
      console.log("Strategy 3: Using minimal fields")
      const result = await directFetch("parking_spots", {
        select: "id",
        id: `eq.${id}`,
      })

      if (result.error) throw new Error(result.error)
      if (result.data) {
        return {
          data: {
            id,
            // Add placeholder values
            latitude: 0,
            longitude: 0,
            spot_type: "unknown",
            address: "Address unavailable",
            is_available: false,
            last_updated: new Date().toISOString(),
          },
          error: null,
          partial: true,
        }
      }
    } catch (error) {
      console.warn("⚠️ Strategy 3 failed:", error)
    }

    // All strategies failed
    return {
      data: null,
      error: "Failed to fetch parking spot after multiple attempts",
    }
  }

  // Get nearby parking spots
  static async getNearbySpots(params: {
    lat?: number
    lng?: number
    radius?: number
    limit?: number
  }) {
    const { lat, lng, radius = 5000, limit = 50 } = params

    // Strategy 1: Try with enhanced Supabase client
    try {
      console.log("Strategy 1: Using enhanced Supabase client for nearby spots")
      let query = supabaseEnhanced
        .from("parking_spots")
        .select("id, latitude, longitude, spot_type, address, is_available, provider, confidence_score, last_updated")
        .eq("is_available", true)
        .order("id")
        .limit(limit)

      // Add location filtering if coordinates provided
      if (lat && lng) {
        const latDelta = radius / 111000 // Rough conversion: 1 degree ≈ 111km
        const lngDelta = radius / (111000 * Math.cos((lat * Math.PI) / 180))

        query = query
          .gte("latitude", lat - latDelta)
          .lte("latitude", lat + latDelta)
          .gte("longitude", lng - lngDelta)
          .lte("longitude", lng + lngDelta)
      }

      const { data, error } = await query
      if (error) throw error
      if (data) return { data, error: null }
    } catch (error) {
      console.warn("⚠️ Strategy 1 failed for nearby spots:", error)
    }

    // Strategy 2: Try with direct fetch
    try {
      console.log("Strategy 2: Using direct fetch for nearby spots")
      const params: Record<string, string> = {
        select: "id,latitude,longitude,spot_type,address,is_available,provider,confidence_score,last_updated",
        is_available: "eq.true",
        order: "id",
        limit: limit.toString(),
      }

      const result = await directFetch("parking_spots", params)
      if (result.error) throw new Error(result.error)
      if (result.data) return { data: result.data, error: null }
    } catch (error) {
      console.warn("⚠️ Strategy 2 failed for nearby spots:", error)
    }

    // All strategies failed
    return {
      data: [],
      error: "Failed to fetch nearby parking spots after multiple attempts",
    }
  }
}
