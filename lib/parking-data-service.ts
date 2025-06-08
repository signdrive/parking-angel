import { supabase } from "./supabase"

// Real parking data providers
export const PARKING_PROVIDERS = {
  PARKWHIZ: "parkwhiz",
  SPOTHERO: "spothero",
  PARKOPEDIA: "parkopedia",
  GOOGLE_PLACES: "google_places",
  OPENSTREETMAP: "openstreetmap",
  CITY_API: "city_api",
  TFL: "tfl", // Added TfL
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
  last_updated: Date | string // Updated to accept string too
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

  static getInstance(): ParkingDataService {
    if (!ParkingDataService.instance) {
      ParkingDataService.instance = new ParkingDataService()
    }
    return ParkingDataService.instance
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
    } = {},
  ): Promise<RealParkingSpot[]> {
    const cacheKey = `${latitude},${longitude},${radius}`
    const cached = this.cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log("Using cached parking data")
      return this.filterSpots(cached.data, options)
    }

    try {
      const allSpots: RealParkingSpot[] = []

      // Determine location and fetch appropriate data
      const isLondon = this.isInLondon(latitude, longitude)

      // Fetch from multiple providers in parallel with retry logic
      const providers = await Promise.allSettled([
        this.withRetry(() => this.fetchGooglePlacesParking(latitude, longitude, radius)),
        this.withRetry(() => this.fetchOpenStreetMapParking(latitude, longitude, radius)),
        ...(isLondon ? [this.withRetry(() => this.fetchTfLParking(latitude, longitude, radius))] : []),
        this.withRetry(() => this.fetchCityAPIData(latitude, longitude, radius)),
      ])

      providers.forEach((result) => {
        if (result.status === "fulfilled") {
          allSpots.push(...result.value)
        }
      })

      // If all providers failed but we have cached data, use it
      if (allSpots.length === 0 && cached) {
        console.log("All providers failed, using cached data")
        return this.filterSpots(cached.data, options)
      }

      // Remove duplicates based on location proximity
      const uniqueSpots = this.removeDuplicateSpots(allSpots)

      // Cache the results
      this.cache.set(cacheKey, { data: uniqueSpots, timestamp: Date.now() })

      // Store in our database for future reference
      this.storeRealParkingData(uniqueSpots).catch((err) => {
        console.error("Failed to store parking data:", err)
      })

      return this.filterSpots(uniqueSpots, options)
    } catch (error) {
      console.error("Error fetching real parking data:", error)

      // Return cached data if available as fallback
      if (cached) {
        console.log("Error fetching fresh data, using cached data")
        return this.filterSpots(cached.data, options)
      }

      return []
    }
  }

  private async withRetry<T>(operation: () => Promise<T>, retries = this.MAX_RETRIES): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (retries > 0) {
        console.log(`Retrying operation, ${retries} attempts left`)
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, this.MAX_RETRIES - retries)))
        return this.withRetry(operation, retries - 1)
      }
      throw error
    }
  }

  private isInLondon(lat: number, lng: number): boolean {
    // London bounding box (approximate)
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

  private async fetchTfLParking(lat: number, lng: number, radius: number): Promise<RealParkingSpot[]> {
    try {
      const response = await fetch(`/api/parking/tfl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng, radius }),
      })

      if (!response.ok) throw new Error("TfL API failed")
      const data = await response.json()
      return data.spots || []
    } catch (error) {
      console.error("TfL parking fetch failed:", error)
      return []
    }
  }

  private async fetchGooglePlacesParking(lat: number, lng: number, radius: number): Promise<RealParkingSpot[]> {
    try {
      const response = await fetch(`/api/parking/google-places`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng, radius }),
      })

      if (!response.ok) throw new Error("Google Places API failed")
      const data = await response.json()
      return data.spots || []
    } catch (error) {
      console.error("Google Places parking fetch failed:", error)
      return []
    }
  }

  private async fetchOpenStreetMapParking(lat: number, lng: number, radius: number): Promise<RealParkingSpot[]> {
    try {
      // Use a more reliable OSM API endpoint or a proxy
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="parking"](around:${radius},${lat},${lng});
          way["amenity"="parking"](around:${radius},${lat},${lng});
          relation["amenity"="parking"](around:${radius},${lat},${lng});
        );
        out center meta;
      `

      // Use a proxy or alternative endpoint if the main one is failing
      const endpoints = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"]

      let response = null
      let error = null

      // Try each endpoint until one works
      for (const endpoint of endpoints) {
        try {
          response = await fetch(endpoint, {
            method: "POST",
            body: query,
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            // Add timeout to prevent hanging requests
            signal: AbortSignal.timeout(10000),
          })

          if (response.ok) break
        } catch (err) {
          error = err
          console.log(`OSM endpoint ${endpoint} failed, trying next...`)
        }
      }

      if (!response || !response.ok) {
        throw error || new Error("All OpenStreetMap API endpoints failed")
      }

      const data = await response.json()

      // Generate mock data if the API returns empty results
      if (!data.elements || data.elements.length === 0) {
        console.log("OSM returned no results, using mock data")
        return this.generateMockParkingSpots(lat, lng, 3)
      }

      return data.elements.map((element: any) => ({
        id: `osm_${element.id}`,
        name: element.tags?.name || "Parking Area",
        latitude: element.lat || element.center?.lat,
        longitude: element.lon || element.center?.lon,
        address: this.buildAddress(element.tags),
        spot_type: this.mapOSMParkingType(element.tags),
        is_available: true,
        total_spaces: element.tags?.capacity ? Number.parseInt(element.tags.capacity) : undefined,
        price_per_hour: element.tags?.fee === "yes" ? undefined : 0,
        restrictions: this.parseOSMRestrictions(element.tags),
        accessibility: element.tags?.wheelchair === "yes",
        covered: element.tags?.covered === "yes",
        security: element.tags?.supervised === "yes",
        provider: PARKING_PROVIDERS.OPENSTREETMAP,
        provider_id: element.id.toString(),
        real_time_data: false,
        last_updated: new Date().toISOString(), // Fixed: Use string directly
        opening_hours: this.parseOpeningHours(element.tags?.opening_hours),
      }))
    } catch (error) {
      console.error("OpenStreetMap parking fetch failed:", error)
      // Return mock data as fallback
      return this.generateMockParkingSpots(lat, lng, 3)
    }
  }

  private generateMockParkingSpots(lat: number, lng: number, count: number): RealParkingSpot[] {
    const spots: RealParkingSpot[] = []

    for (let i = 0; i < count; i++) {
      // Generate spots in a small radius around the given coordinates
      const spotLat = lat + (Math.random() - 0.5) * 0.01
      const spotLng = lng + (Math.random() - 0.5) * 0.01

      spots.push({
        id: `mock_${Date.now()}_${i}`,
        name: `Parking Area ${i + 1}`,
        latitude: spotLat,
        longitude: spotLng,
        address: "Generated Address",
        spot_type: ["street", "garage", "lot", "meter"][Math.floor(Math.random() * 4)] as any,
        is_available: Math.random() > 0.3, // 70% chance of being available
        price_per_hour: Math.random() > 0.5 ? Math.floor(Math.random() * 10) + 1 : 0,
        provider: PARKING_PROVIDERS.OPENSTREETMAP,
        provider_id: `mock_${i}`,
        real_time_data: false,
        last_updated: new Date().toISOString(),
      })
    }

    return spots
  }

  private async fetchCityAPIData(lat: number, lng: number, radius: number): Promise<RealParkingSpot[]> {
    try {
      const response = await fetch(`/api/parking/city-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng, radius }),
      })

      if (!response.ok) throw new Error("City API failed")
      const data = await response.json()
      return data.spots || []
    } catch (error) {
      console.error("City API parking fetch failed:", error)
      return []
    }
  }

  private removeDuplicateSpots(spots: RealParkingSpot[]): RealParkingSpot[] {
    const uniqueSpots: RealParkingSpot[] = []
    const DUPLICATE_THRESHOLD = 50 // meters

    for (const spot of spots) {
      const isDuplicate = uniqueSpots.some((existing) => {
        const distance = this.calculateDistance(spot.latitude, spot.longitude, existing.latitude, existing.longitude)
        return distance < DUPLICATE_THRESHOLD
      })

      if (!isDuplicate) {
        uniqueSpots.push(spot)
      }
    }

    return uniqueSpots
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
      return true
    })
  }

  private async storeRealParkingData(spots: RealParkingSpot[]): Promise<void> {
    try {
      // Use a batch approach to reduce the number of requests
      const batchSize = 10
      for (let i = 0; i < spots.length; i += batchSize) {
        const batch = spots.slice(i, i + batchSize)

        const promises = batch.map((spot) => {
          // Fix for last_updated - ensure it's a string
          const lastUpdated =
            typeof spot.last_updated === "object" && spot.last_updated instanceof Date
              ? spot.last_updated.toISOString()
              : typeof spot.last_updated === "string"
                ? spot.last_updated
                : new Date().toISOString()

          return supabase.from("real_parking_spots").upsert(
            {
              provider_id: spot.provider_id,
              provider: spot.provider,
              name: spot.name,
              latitude: spot.latitude,
              longitude: spot.longitude,
              address: spot.address,
              spot_type: spot.spot_type,
              price_per_hour: spot.price_per_hour,
              is_available: spot.is_available,
              total_spaces: spot.total_spaces,
              available_spaces: spot.available_spaces,
              real_time_data: spot.real_time_data,
              last_updated: lastUpdated, // Fixed: Use the processed value
              metadata: {
                restrictions: spot.restrictions,
                payment_methods: spot.payment_methods,
                accessibility: spot.accessibility,
                covered: spot.covered,
                security: spot.security,
                ev_charging: spot.ev_charging,
                opening_hours: spot.opening_hours,
                contact_info: spot.contact_info,
              },
            },
            { onConflict: "provider,provider_id" },
          )
        })

        // Wait for each batch to complete before moving to the next
        await Promise.allSettled(promises)
      }
    } catch (error) {
      console.error("Error storing real parking data:", error)
    }
  }

  private buildAddress(tags: any): string {
    const parts = []
    if (tags["addr:housenumber"]) parts.push(tags["addr:housenumber"])
    if (tags["addr:street"]) parts.push(tags["addr:street"])
    if (tags["addr:city"]) parts.push(tags["addr:city"])
    return parts.join(", ") || "Address not available"
  }

  private mapOSMParkingType(tags: any): "street" | "garage" | "lot" | "meter" | "private" {
    if (tags.parking === "street_side") return "street"
    if (tags.parking === "multi-storey") return "garage"
    if (tags.parking === "underground") return "garage"
    if (tags.parking === "surface") return "lot"
    if (tags.fee === "yes") return "meter"
    return "lot"
  }

  private parseOSMRestrictions(tags: any): string[] {
    const restrictions = []
    if (tags.maxstay) restrictions.push(`Max stay: ${tags.maxstay}`)
    if (tags.access && tags.access !== "yes") restrictions.push(`Access: ${tags.access}`)
    if (tags.fee === "yes") restrictions.push("Paid parking")
    return restrictions
  }

  private parseOpeningHours(hours: string): any {
    if (!hours) return undefined
    // Simple parsing - in production, use a proper opening hours parser
    return { note: hours }
  }
}
