export class ParkingDataService {
  private static instance: ParkingDataService
  private cache = new Map<string, { data: RealParkingSpot[]; timestamp: number }>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  private readonly MAX_RETRIES = 3
  private readonly RETRY_DELAY = 1000 // 1 second

  private constructor() {}

  public static getInstance(): ParkingDataService {
    if (!ParkingDataService.instance) {
      ParkingDataService.instance = new ParkingDataService()
    }
    return ParkingDataService.instance
  }

  private getCacheKey(lat: number, lng: number, radius: number): string {
    return `${lat.toFixed(4)}_${lng.toFixed(4)}_${radius}`
  }

  private isValidCache(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private async fetchWithRetry(url: string, retries = this.MAX_RETRIES): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(10000), // 10 second timeout
        })

        if (response.ok) {
          return response
        }

        if (response.status === 503 && i < retries - 1) {
          console.warn(`Service unavailable, retrying in ${this.RETRY_DELAY}ms... (${i + 1}/${retries})`)
          await this.delay(this.RETRY_DELAY * (i + 1)) // Exponential backoff
          continue
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      } catch (error) {
        if (i === retries - 1) {
          throw error
        }
        console.warn(`Request failed, retrying... (${i + 1}/${retries})`, error)
        await this.delay(this.RETRY_DELAY * (i + 1))
      }
    }
    throw new Error("Max retries exceeded")
  }

  public async getRealParkingSpots(
    lat: number,
    lng: number,
    radius = 1000,
    options: {
      requireAvailability?: boolean
      limit?: number
    } = {},
  ): Promise<RealParkingSpot[]> {
    const cacheKey = this.getCacheKey(lat, lng, radius)
    const cached = this.cache.get(cacheKey)

    // Return cached data if valid
    if (cached && this.isValidCache(cached.timestamp)) {
      console.log("🎯 Returning cached parking data")
      return cached.data
    }

    try {
      console.log("🔍 Fetching fresh parking data...")

      // Use our API endpoint with better error handling
      const url = new URL("/api/spots/nearby", window.location.origin)
      url.searchParams.set("lat", lat.toString())
      url.searchParams.set("lng", lng.toString())
      url.searchParams.set("radius", radius.toString())
      url.searchParams.set("limit", (options.limit || 50).toString())

      const response = await this.fetchWithRetry(url.toString())
      const data = await response.json()

      if (data.success && Array.isArray(data.data)) {
        const spots: RealParkingSpot[] = data.data.map((spot: any) => ({
          id: spot.id,
          name: spot.name || `Parking Spot ${spot.id}`,
          latitude: Number.parseFloat(spot.latitude),
          longitude: Number.parseFloat(spot.longitude),
          address: spot.address || "Address not available",
          spot_type: spot.spot_type || "street",
          provider: spot.provider || "Unknown",
          is_available: spot.is_available !== false,
          price_per_hour: spot.price_per_hour || 0,
          real_time_data: spot.real_time_data || false,
          total_spaces: spot.total_spaces,
          available_spaces: spot.available_spaces,
        }))

        // Filter by availability if required
        const filteredSpots = options.requireAvailability ? spots.filter((spot) => spot.is_available) : spots

        // Cache the results
        this.cache.set(cacheKey, {
          data: filteredSpots,
          timestamp: Date.now(),
        })

        console.log(`✅ Fetched ${filteredSpots.length} parking spots`)
        return filteredSpots
      } else {
        throw new Error("Invalid response format from API")
      }
    } catch (error) {
      console.error("❌ Failed to fetch parking data:", error)

      // Return cached data even if expired, or generate mock data
      if (cached) {
        console.log("🔄 Returning expired cached data as fallback")
        return cached.data
      }

      console.log("🎭 Generating mock data as fallback")
      return this.generateMockData(lat, lng, radius, options.limit || 20)
    }
  }

  private generateMockData(lat: number, lng: number, radius: number, limit: number): RealParkingSpot[] {
    const spots: RealParkingSpot[] = []
    const radiusInDegrees = radius / 111000 // Rough conversion from meters to degrees

    for (let i = 0; i < limit; i++) {
      const angle = (Math.PI * 2 * i) / limit
      const distance = Math.random() * radiusInDegrees

      const spotLat = lat + distance * Math.cos(angle)
      const spotLng = lng + distance * Math.sin(angle)

      spots.push({
        id: `mock-${i}`,
        name: `Sample Parking ${i + 1}`,
        latitude: spotLat,
        longitude: spotLng,
        address: `${100 + i} Sample Street`,
        spot_type: ["garage", "street", "lot"][i % 3] as any,
        provider: i % 2 === 0 ? "City Parking" : "Private Lot",
        is_available: Math.random() > 0.2,
        price_per_hour: i % 4 === 0 ? 0 : Math.floor(Math.random() * 15) + 5,
        real_time_data: i % 3 === 0,
        total_spaces: i % 3 === 0 ? Math.floor(Math.random() * 100) + 20 : undefined,
        available_spaces: i % 3 === 0 ? Math.floor(Math.random() * 30) : undefined,
      })
    }

    return spots
  }

  public clearCache(): void {
    this.cache.clear()
    console.log("🧹 Parking data cache cleared")
  }
}

export interface RealParkingSpot {
  id: string
  name: string
  latitude: number
  longitude: number
  address: string
  spot_type: "garage" | "street" | "lot" | "meter"
  provider: string
  is_available: boolean
  price_per_hour?: number
  real_time_data?: boolean
  total_spaces?: number
  available_spaces?: number
}
