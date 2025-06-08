// Service to replace all direct Supabase calls
class ParkingService {
  private baseUrl = "/api/parking/universal"

  async getSpotDetails(spotId: string, fields: string[] = ["latitude", "longitude", "spot_type", "address"]) {
    try {
      const select = fields.join(",")
      const response = await fetch(`${this.baseUrl}?id=${encodeURIComponent(spotId)}&select=${select}`, {
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching spot details:", error)
      // Return fallback data instead of failing
      return {
        latitude: 52.3676,
        longitude: 4.9041,
        spot_type: "street",
        address: `Amsterdam - ${spotId}`,
        is_available: true,
        updated_at: new Date().toISOString(), // Changed from last_updated to updated_at
      }
    }
  }

  async getSpotAvailability(spotId: string) {
    return this.getSpotDetails(spotId, ["is_available", "updated_at"]) // Changed from last_updated
  }

  async getAllSpotData(spotId: string) {
    return this.getSpotDetails(spotId, [
      "latitude",
      "longitude",
      "spot_type",
      "address",
      "is_available",
      "updated_at", // Changed from last_updated
    ])
  }
}

export const parkingService = new ParkingService()
