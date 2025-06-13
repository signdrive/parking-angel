import type { RealParkingSpot } from "@/lib/parking-data-service"
import type { SpotPrediction } from "@/lib/ai-spot-predictor"

export interface AreaAnalysis {
  clickLocation: { lat: number; lng: number }
  nearbySpots: RealParkingSpot[]
  aiPredictions: SpotPrediction[]
  bestRecommendation: {
    spot: RealParkingSpot
    prediction: SpotPrediction
    reason: string
  } | null
  areaInsights: {
    averagePrice: number
    availabilityTrend: "increasing" | "decreasing" | "stable"
    demandLevel: "low" | "medium" | "high"
    bestTimeToArrive: string
  }
}
