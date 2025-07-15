import { getBrowserClient } from "./supabase/browser"

// Initialize client when needed to ensure we're in the browser
const getSupabase = () => getBrowserClient()

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
      return this.filterSpots(cached.data, options)
    }

    try {
      const allSpots: RealParkingSpot[] = []

      // Determine location and fetch appropriate data
      const isLondon = this.isInLondon(latitude, longitude)

      // Fetch from multiple providers in parallel - FREE SOURCES FIRST!
      const freeProviders = await Promise.allSettled([
        // 🆓 FREE SOURCES (prioritized to reduce costs)
        this.fetchFreeSourcesParking(latitude, longitude, radius),
        this.fetchOpenStreetMapParking(latitude, longitude, radius),
        ...(isLondon ? [this.fetchTfLParking(latitude, longitude, radius)] : []),
        this.fetchCityAPIData(latitude, longitude, radius),
      ])

      // Collect free results first
      freeProviders.forEach((result) => {
        if (result.status === "fulfilled") {
          allSpots.push(...result.value)
        }
      })

      console.log(`🆓 Free sources found ${allSpots.length} spots`)

      // Only use paid sources if we have insufficient data from free sources
      if (allSpots.length < 5) {
        console.log("💰 Using paid sources as fallback...")
        const paidProviders = await Promise.allSettled([
          this.fetchGooglePlacesParking(latitude, longitude, radius)
        ])

        paidProviders.forEach((result) => {
          if (result.status === "fulfilled") {
            allSpots.push(...result.value)
          }
        })
      } else {
        console.log("✅ Sufficient free data found, skipping paid APIs")
      }

      // Remove duplicates based on location proximity
      const uniqueSpots = this.removeDuplicateSpots(allSpots)

      // Cache the results
      this.cache.set(cacheKey, { data: uniqueSpots, timestamp: Date.now() })

      // Store in our database for future reference
      await this.storeRealParkingData(uniqueSpots)

      return this.filterSpots(uniqueSpots, options)
    } catch (error) {
      console.error("Error fetching real parking data:", error)
      return []
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
      const spots = data.spots || []
      
      // Validate and filter TfL data
      return spots.filter((spot: any) => {
        if (!spot || typeof spot !== 'object') return false
        if (!spot.latitude || !spot.longitude || isNaN(spot.latitude) || isNaN(spot.longitude)) return false
        if (!spot.provider || !spot.provider_id) return false
        return true
      })
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
      const spots = data.spots || []
      
      // Validate and filter Google Places data
      return spots.filter((spot: any) => {
        if (!spot || typeof spot !== 'object') return false
        if (!spot.latitude || !spot.longitude || isNaN(spot.latitude) || isNaN(spot.longitude)) return false
        if (!spot.provider || !spot.provider_id) return false
        return true
      })
    } catch (error) {
      console.error("Google Places parking fetch failed:", error)
      return []
    }
  }

  private async fetchOpenStreetMapParking(lat: number, lng: number, radius: number): Promise<RealParkingSpot[]> {
    try {
      // Overpass API query for parking amenities
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="parking"](around:${radius},${lat},${lng});
          way["amenity"="parking"](around:${radius},${lat},${lng});
          relation["amenity"="parking"](around:${radius},${lat},${lng});
        );
        out center meta;
      `

      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
      })

      if (!response.ok) throw new Error("OpenStreetMap API failed")
      const data = await response.json()

      return data.elements
        .filter((element: any) => {
          // Filter out invalid elements
          const lat = element.lat || element.center?.lat;
          const lon = element.lon || element.center?.lon;
          
          // Must have valid coordinates
          if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
            console.warn(`Skipping OSM element ${element.id} - invalid coordinates:`, { lat, lon });
            return false;
          }
          
          // Must have a valid ID
          if (!element.id) {
            console.warn(`Skipping OSM element - missing ID`);
            return false;
          }
          
          return true;
        })
        .map((element: any) => ({
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
      return []
    }
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
      const spots = data.spots || []
      
      // Validate and filter city API data
      return spots.filter((spot: any) => {
        if (!spot || typeof spot !== 'object') return false
        if (!spot.latitude || !spot.longitude || isNaN(spot.latitude) || isNaN(spot.longitude)) return false
        if (!spot.provider || !spot.provider_id) return false
        return true
      })
    } catch (error) {
      console.error("City API parking fetch failed:", error)
      return []
    }
  }

  private async fetchFreeSourcesParking(lat: number, lng: number, radius: number): Promise<RealParkingSpot[]> {
    try {
      console.log("🆓 Fetching from multiple free sources...")
      const response = await fetch(`/api/parking/free-sources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng, radius }),
      })

      if (!response.ok) throw new Error("Free sources API failed")
      const data = await response.json()
      const spots = data.spots || []
      
      console.log(`✅ Free sources returned ${spots.length} spots`)
      
      // Validate and filter free sources data
      return spots.filter((spot: any) => {
        if (!spot || typeof spot !== 'object') return false
        if (!spot.latitude || !spot.longitude || isNaN(spot.latitude) || isNaN(spot.longitude)) return false
        if (!spot.provider || !spot.provider_id) return false
        return true
      })
    } catch (error) {
      console.error("Free sources parking fetch failed:", error)
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
      // Filter out invalid spots before processing
      const validSpots = spots.filter(spot => this.validateParkingSpot(spot));
      
      if (validSpots.length !== spots.length) {
        console.log(`🔍 Filtered out ${spots.length - validSpots.length} invalid spots, processing ${validSpots.length} valid spots`);
      }

      // Process spots in batches to avoid overwhelming the database
      const batchSize = 10;
      for (let i = 0; i < validSpots.length; i += batchSize) {
        const batch = validSpots.slice(i, i + batchSize);
        
        try {
          const batchData = batch.map(spot => {
            // Fix for last_updated - ensure it's a string
            const lastUpdated =
              typeof spot.last_updated === "object" && spot.last_updated instanceof Date
                ? spot.last_updated.toISOString()
                : typeof spot.last_updated === "string"
                  ? spot.last_updated
                  : new Date().toISOString()

            // Validate spot_type before sending to database
            const validSpotTypes = ['street', 'garage', 'lot', 'meter', 'private'];
            if (!validSpotTypes.includes(spot.spot_type)) {
              console.warn(`Invalid spot_type: ${spot.spot_type} for spot ${spot.provider_id}, using 'lot' as fallback`);
              spot.spot_type = 'lot' as any; // Fallback to 'lot' type
            }

            const record = {
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
              last_updated: lastUpdated,
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
            };

            // Validate the record before adding to batch
            if (!record.provider || !record.provider_id || !record.name) {
              console.warn(`Skipping invalid record for spot ${spot.provider_id}:`, record);
              return null;
            }

            return record;
          }).filter(record => record !== null); // Remove null records

          if (batchData.length === 0) {
            console.warn(`Skipping empty batch ${Math.floor(i / batchSize) + 1}`);
            continue;
          }

          console.log(`📤 Attempting to upsert batch ${Math.floor(i / batchSize) + 1} with ${batchData.length} records`);
          
          const { data, error } = await getSupabase()
            .from("real_parking_spots")
            .upsert(batchData, { 
              onConflict: "provider,provider_id",
              ignoreDuplicates: false 
            })

          if (error) {
            console.error(`❌ Supabase error for batch ${Math.floor(i / batchSize) + 1}:`, error);
            console.error(`❌ Error details:`, error.message, error.details, error.hint);
            console.error(`❌ Problematic batch data:`, JSON.stringify(batchData, null, 2));
            throw error;
          }
          
          console.log(`✅ Stored batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(validSpots.length / batchSize)} (${batch.length} spots)`);
        } catch (batchError) {
          console.error(`❌ Error storing batch ${Math.floor(i / batchSize) + 1}:`, batchError);
          
          // Log the problematic batch data for debugging
          batch.forEach((spot, index) => {
            console.log(`Spot ${index + 1}:`, {
              provider: spot.provider,
              provider_id: spot.provider_id,
              spot_type: spot.spot_type,
              name: spot.name
            });
          });
        }
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

  private validateParkingSpot(spot: RealParkingSpot): boolean {
    // Validate required fields
    if (!spot.provider || !spot.provider_id) {
      console.warn(`Skipping spot - missing provider info:`, { provider: spot.provider, provider_id: spot.provider_id });
      return false;
    }

    // Validate coordinates
    if (!spot.latitude || !spot.longitude || isNaN(spot.latitude) || isNaN(spot.longitude)) {
      console.warn(`Skipping spot ${spot.provider_id} - invalid coordinates:`, { lat: spot.latitude, lon: spot.longitude });
      return false;
    }

    // Validate spot_type
    const validSpotTypes = ['street', 'garage', 'lot', 'meter', 'private'];
    if (!validSpotTypes.includes(spot.spot_type)) {
      console.warn(`Skipping spot ${spot.provider_id} - invalid spot_type: ${spot.spot_type}`);
      return false;
    }

    // Validate latitude/longitude ranges
    if (spot.latitude < -90 || spot.latitude > 90) {
      console.warn(`Skipping spot ${spot.provider_id} - invalid latitude: ${spot.latitude}`);
      return false;
    }

    if (spot.longitude < -180 || spot.longitude > 180) {
      console.warn(`Skipping spot ${spot.provider_id} - invalid longitude: ${spot.longitude}`);
      return false;
    }

    return true;
  }
}
