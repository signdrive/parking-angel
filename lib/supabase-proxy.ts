import { getResilientClient } from "./supabase-connection-fix"
import { ParkingCache } from "./parking-cache"

// Proxy all Supabase database operations through this service
export class SupabaseProxyService {
  private static instance: SupabaseProxyService
  private cache = ParkingCache.getInstance()

  static getInstance(): SupabaseProxyService {
    if (!SupabaseProxyService.instance) {
      SupabaseProxyService.instance = new SupabaseProxyService()
    }
    return SupabaseProxyService.instance
  }

  // Get parking spots with caching and fallback
  async getParkingSpots(params: {
    lat?: number
    lng?: number
    radius?: number
    limit?: number
  }) {
    const { lat, lng, radius = 5000, limit = 50 } = params

    // Try to get from cache first
    if (lat && lng) {
      const cached = this.cache.get(lat, lng, radius)
      if (cached) {
        return { data: cached, source: "cache" }
      }
    }

    try {
      const supabase = getResilientClient()

      let query
      if (lat && lng) {
        // Try to use the stored procedure first
        try {
          const { data, error } = await supabase.rpc("get_nearby_spots_simple", {
            user_lat: lat,
            user_lng: lng,
            radius_meters: radius,
            max_results: limit,
          })

          if (!error && data) {
            // Cache the results
            this.cache.set(lat, lng, radius, data)
            return { data, source: "database_function" }
          }
        } catch (functionError) {
          console.warn("Function call failed, falling back to direct query:", functionError)
        }

        // Fallback to direct query
        query = supabase.from("parking_spots").select("*").eq("is_available", true).order("id").limit(limit)
      } else {
        // Simple query without location filtering
        query = supabase.from("parking_spots").select("*").eq("is_available", true).order("id").limit(limit)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      // Cache the results if location-based
      if (lat && lng && data) {
        this.cache.set(lat, lng, radius, data)
      }

      return { data, source: "database" }
    } catch (error) {
      console.error("Database query failed:", error)

      // Return offline data as last resort
      return {
        data: this.getOfflineData(lat, lng, radius, limit),
        source: "offline",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  // Get a specific parking spot by ID
  async getParkingSpotById(id: string) {
    try {
      const supabase = getResilientClient()
      const { data, error } = await supabase.from("parking_spots").select("*").eq("id", id).maybeSingle()

      if (error) {
        throw error
      }

      return { data, source: "database" }
    } catch (error) {
      console.error("Failed to get parking spot by ID:", error)

      // Return offline data if available
      const offlineSpot = this.getOfflineData().find((spot) => spot.id === id)
      return {
        data: offlineSpot || null,
        source: "offline",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  // Offline data for fallback
  private getOfflineData(lat?: number, lng?: number, radius?: number, limit?: number) {
    // Basic offline dataset
    const offlineData = [
      {
        id: "offline_1",
        latitude: 51.5074,
        longitude: -0.1278,
        address: "London Central",
        spot_type: "street",
        is_available: true,
        provider: "offline",
      },
      {
        id: "offline_2",
        latitude: 51.2093,
        longitude: 3.2247,
        address: "Bruges Market",
        spot_type: "garage",
        is_available: true,
        provider: "offline",
      },
      // Add more offline spots as needed
    ]

    // Filter by location if provided
    if (lat && lng && radius) {
      return offlineData
        .filter((spot) => {
          const distance = this.calculateDistance(lat, lng, Number(spot.latitude), Number(spot.longitude))
          return distance <= radius / 1000 // Convert meters to km
        })
        .slice(0, limit)
    }

    return offlineData.slice(0, limit)
  }

  // Calculate distance between coordinates in km
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1)
    const dLon = this.deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180)
  }
}

// Export a singleton instance
export const supabaseProxy = SupabaseProxyService.getInstance()
