// Real parking service - NO fake data ever!
class RealParkingService {
  private baseUrl = "/api/parking/real-data"

  async getSpotDetails(spotId: string, fields: string[] = ["latitude", "longitude", "spot_type", "address"]) {
    try {
      const select = fields.join(",")
      const response = await fetch(`${this.baseUrl}?id=${encodeURIComponent(spotId)}&select=${select}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Parking spot ${spotId} not found in real data sources`)
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error fetching real data for spot ${spotId}:`, error)
      throw error // Don't return fake data - let the error bubble up
    }
  }

  async getSpotAvailability(spotId: string) {
    return this.getSpotDetails(spotId, ["is_available", "updated_at"])
  }

  async getAllSpotData(spotId: string) {
    return this.getSpotDetails(spotId, [
      "latitude",
      "longitude",
      "spot_type",
      "address",
      "name",
      "is_available",
      "updated_at",
      "source",
    ])
  }

  async searchNearbyParking(lat: number, lng: number, radius = 1000) {
    try {
      // Search Google Places for real parking near location
      const response = await fetch("/api/parking/search-nearby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng, radius }),
      })

      if (!response.ok) {
        throw new Error("Failed to search nearby parking")
      }

      return await response.json()
    } catch (error) {
      console.error("Error searching nearby parking:", error)
      throw error
    }
  }
}

export const realParkingService = new RealParkingService()
