interface CachedParkingSpot {
  id: string
  latitude: number
  longitude: number
  address: string
  spot_type: string
  is_available: boolean
  provider: string
  cached_at: number
  expires_at: number
}

export class ParkingCache {
  private static instance: ParkingCache
  private cache = new Map<string, CachedParkingSpot[]>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  static getInstance(): ParkingCache {
    if (!ParkingCache.instance) {
      ParkingCache.instance = new ParkingCache()
    }
    return ParkingCache.instance
  }

  getCacheKey(lat: number, lng: number, radius: number): string {
    return `${Math.round(lat * 1000)}:${Math.round(lng * 1000)}:${radius}`
  }

  get(lat: number, lng: number, radius: number): CachedParkingSpot[] | null {
    const key = this.getCacheKey(lat, lng, radius)
    const cached = this.cache.get(key)

    if (!cached) return null

    const now = Date.now()
    const isExpired = cached.some((spot) => now > spot.expires_at)

    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    console.log(`📦 Using cached parking data for ${key}`)
    return cached
  }

  set(lat: number, lng: number, radius: number, spots: any[]): void {
    const key = this.getCacheKey(lat, lng, radius)
    const now = Date.now()

    const cachedSpots: CachedParkingSpot[] = spots.map((spot) => ({
      id: spot.id,
      latitude: Number(spot.latitude),
      longitude: Number(spot.longitude),
      address: spot.address || "Unknown location",
      spot_type: spot.spot_type || "street",
      is_available: spot.is_available !== false,
      provider: spot.provider || "unknown",
      cached_at: now,
      expires_at: now + this.CACHE_DURATION,
    }))

    this.cache.set(key, cachedSpots)
    console.log(`💾 Cached ${cachedSpots.length} parking spots for ${key}`)
  }

  clear(): void {
    this.cache.clear()
    console.log("🗑️ Parking cache cleared")
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}
