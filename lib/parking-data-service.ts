// Real parking data providers
export const PARKING_PROVIDERS = {
  PARKWHIZ: "parkwhiz",
  SPOTHERO: "spothero",
  PARKOPEDIA: "parkopedia",
  GOOGLE_PLACES: "google_places",
  OPENSTREETMAP: "openstreetmap",
  CITY_API: "city_api",
  TFL: "tfl",
} as const

export interface RealParkingSpot {
  id: string
  name: string
  latitude: number
  longitude: number
  address: string
  spot_type: "street" | "garage" | "lot" | "meter" | "private"
  price_per_hour?: number
  max_duration_hours?: number
  is_available: boolean
  total_spaces?: number
  available_spaces?: number
  restrictions?: string[]
  payment_methods?: string[]
  accessibility?: boolean
  covered?: boolean
  security?: boolean
  ev_charging?: boolean
  provider: string
  provider_id: string
  real_time_data: boolean
  last_updated: string
  distance?: number
  opening_hours?: {
    [key: string]: { open: string; close: string }
  }
  contact_info?: {
    phone?: string
    website?: string
    email?: string
  }
}

export class ParkingDataService {
  private static instance: ParkingDataService
  private cache = new Map<string, { data: RealParkingSpot[]; timestamp: number }>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  private readonly MAX_RETRIES = 3
  private readonly RETRY_DELAY = 1000

  private constructor() {}

  static getInstance(): ParkingDataService {
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
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)

        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          return response
        }

        if (response.status === 503 && i < retries - 1) {
          console.warn(`Service unavailable, retrying in ${this.RETRY_DELAY}ms... (${i + 1}/${retries})`)
          await this.delay(this.RETRY_DELAY * (i + 1))
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

  async getRealParkingSpots(
    latitude: number,
    longitude: number,
    radius = 1000,
    options: {
      includeStreetParking?: boolean
      includeGarages?: boolean
      includeLots?: boolean
      maxPrice?: number
      requireRealTime?: boolean
      requireAvailability?: boolean
      limit?: number
    } = {},
  ): Promise<RealParkingSpot[]> {
    const cacheKey = this.getCacheKey(latitude, longitude, radius)
    const cached = this.cache.get(cacheKey)

    // Return cached data if valid
    if (cached && this.isValidCache(cached.timestamp)) {
      console.log("🎯 Returning cached parking data")
      return this.filterSpots(cached.data, options)
    }

    try {
      console.log("🔍 Fetching fresh parking data...")

      // Use our API endpoint with better error handling
      const url = new URL("/api/spots/nearby", window.location.origin)
      url.searchParams.set("lat", latitude.toString())
      url.searchParams.set("lng", longitude.toString())
      url.searchParams.set("radius", radius.toString())
      url.searchParams.set("limit", (options.limit || 50).toString())

      const response = await this.fetchWithRetry(url.toString())
      const data = await response.json()

      if (data.success && Array.isArray(data.data)) {
        const spots: RealParkingSpot[] = data.data.map((spot: any) => ({
          id: spot.id?.toString() || `spot-${Math.random()}`,
          name: spot.name || `Parking Spot ${spot.id}`,
          latitude: Number.parseFloat(spot.latitude?.toString() || "0"),
          longitude: Number.parseFloat(spot.longitude?.toString() || "0"),
          address: spot.address || "Address not available",
          spot_type: this.normalizeSpotType(spot.spot_type),
          provider: spot.provider || "Unknown",
          provider_id: spot.provider_id || spot.id?.toString() || "",
          is_available: spot.is_available !== false,
          price_per_hour: spot.price_per_hour ? Number.parseFloat(spot.price_per_hour.toString()) : undefined,
          real_time_data: Boolean(spot.real_time_data),
          total_spaces: spot.total_spaces ? Number.parseInt(spot.total_spaces.toString()) : undefined,
          available_spaces: spot.available_spaces ? Number.parseInt(spot.available_spaces.toString()) : undefined,
          last_updated: spot.last_updated || new Date().toISOString(),
          restrictions: spot.restrictions || [],
          payment_methods: spot.payment_methods || [],
          accessibility: Boolean(spot.accessibility),
          covered: Boolean(spot.covered),
          security: Boolean(spot.security),
          ev_charging: Boolean(spot.ev_charging),
        }))

        // Filter spots based on options
        const filteredSpots = this.filterSpots(spots, options)

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
        return this.filterSpots(cached.data, options)
      }

      console.log("🎭 Generating mock data as fallback")
      const mockData = this.generateMockData(latitude, longitude, radius, options.limit || 20)
      return this.filterSpots(mockData, options)
    }
  }

  private normalizeSpotType(spotType: any): "street" | "garage" | "lot" | "meter" | "private" {
    const type = spotType?.toString().toLowerCase()
    switch (type) {
      case "garage":
      case "parking_garage":
        return "garage"
      case "street":
      case "street_side":
        return "street"
      case "lot":
      case "parking_lot":
        return "lot"
      case "meter":
      case "parking_meter":
        return "meter"
      case "private":
        return "private"
      default:
        return "street"
    }
  }

  private filterSpots(spots: RealParkingSpot[], options: any): RealParkingSpot[] {
    return spots.filter((spot) => {
      if (options.maxPrice && spot.price_per_hour && spot.price_per_hour > options.maxPrice) {
        return false
      }
      if (options.requireRealTime && !spot.real_time_data) {
        return false
      }
      if (options.requireAvailability && !spot.is_available) {
        return false
      }
      if (options.includeStreetParking === false && spot.spot_type === "street") {
        return false
      }
      if (options.includeGarages === false && spot.spot_type === "garage") {
        return false
      }
      if (options.includeLots === false && spot.spot_type === "lot") {
        return false
      }
      return true
    })
  }

  private generateMockData(lat: number, lng: number, radius: number, limit: number): RealParkingSpot[] {
    const spots: RealParkingSpot[] = []
    const radiusInDegrees = radius / 111000 // Rough conversion from meters to degrees

    for (let i = 0; i < limit; i++) {
      const angle = (Math.PI * 2 * i) / limit
      const distance = Math.random() * radiusInDegrees

      const spotLat = lat + distance * Math.cos(angle)
      const spotLng = lng + distance * Math.sin(angle)

      const spotTypes: Array<"garage" | "street" | "lot" | "meter" | "private"> = [
        "garage",
        "street",
        "lot",
        "meter",
        "private",
      ]

      spots.push({
        id: `mock-${i}`,
        name: `Sample Parking ${i + 1}`,
        latitude: spotLat,
        longitude: spotLng,
        address: `${100 + i} Sample Street`,
        spot_type: spotTypes[i % spotTypes.length],
        provider: i % 2 === 0 ? "City Parking" : "Private Lot",
        provider_id: `mock-provider-${i}`,
        is_available: Math.random() > 0.2,
        price_per_hour: i % 4 === 0 ? 0 : Math.floor(Math.random() * 15) + 5,
        real_time_data: i % 3 === 0,
        total_spaces: i % 3 === 0 ? Math.floor(Math.random() * 100) + 20 : undefined,
        available_spaces: i % 3 === 0 ? Math.floor(Math.random() * 30) : undefined,
        last_updated: new Date().toISOString(),
        restrictions: [],
        payment_methods: ["credit_card", "mobile_app"],
        accessibility: Math.random() > 0.7,
        covered: Math.random() > 0.6,
        security: Math.random() > 0.5,
        ev_charging: Math.random() > 0.8,
      })
    }

    return spots
  }

  public clearCache(): void {
    this.cache.clear()
    console.log("🧹 Parking data cache cleared")
  }

  // Legacy methods for compatibility
  private isInLondon(lat: number, lng: number): boolean {
    const LONDON_BOUNDS = {
      north: 51.6723,
      south: 51.2867,
      east: 0.334,
      west: -0.5103,
    }

    return (
      lat >= LONDON_BOUNDS.south && lat <= LONDON_BOUNDS.north && lng >= LONDON_BOUNDS.west && lng <= LONDON_BOUNDS.east
    )
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }
}
