export interface SpotPrediction {
  spotId: string
  predictedAvailability: number // 0-100 percentage
  confidence: number // 0-100 percentage
  timeWindow: string
  factors: {
    historical: number
    timeOfDay: number
    dayOfWeek: number
    weather?: number
    events?: number
  }
  recommendation: "high" | "medium" | "low"
  estimatedWaitTime?: number // minutes
}

export class AISpotPredictor {
  private static instance: AISpotPredictor
  private cache = new Map<string, { prediction: SpotPrediction; timestamp: number }>()
  private readonly CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

  private constructor() {}

  static getInstance(): AISpotPredictor {
    if (!AISpotPredictor.instance) {
      AISpotPredictor.instance = new AISpotPredictor()
    }
    return AISpotPredictor.instance
  }

  async predictSpotAvailability(spotId: string, targetTime: Date, timeWindow = "30min"): Promise<SpotPrediction> {
    const cacheKey = `${spotId}_${targetTime.getTime()}_${timeWindow}`
    const cached = this.cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.prediction
    }

    try {
      // Generate prediction based on various factors
      const prediction = await this.generatePrediction(spotId, targetTime, timeWindow)

      // Cache the result
      this.cache.set(cacheKey, {
        prediction,
        timestamp: Date.now(),
      })

      return prediction
    } catch (error) {
      console.error("Error generating prediction:", error)

      // Return a fallback prediction
      return this.generateFallbackPrediction(spotId, targetTime, timeWindow)
    }
  }

  private async generatePrediction(spotId: string, targetTime: Date, timeWindow: string): Promise<SpotPrediction> {
    const now = new Date()
    const hour = targetTime.getHours()
    const dayOfWeek = targetTime.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    // Time-based factors
    const timeOfDayFactor = this.calculateTimeOfDayFactor(hour)
    const dayOfWeekFactor = this.calculateDayOfWeekFactor(dayOfWeek)

    // Historical data simulation (in real app, this would come from database)
    const historicalFactor = this.simulateHistoricalData(spotId, hour, dayOfWeek)

    // Weather factor (simplified)
    const weatherFactor = Math.random() * 0.2 + 0.8 // 80-100%

    // Calculate overall availability
    const baseAvailability = 70 // Base 70% availability
    const availability = Math.min(
      100,
      Math.max(0, baseAvailability * timeOfDayFactor * dayOfWeekFactor * historicalFactor * weatherFactor),
    )

    // Calculate confidence based on data quality
    const confidence = this.calculateConfidence(spotId, targetTime)

    // Determine recommendation
    const recommendation = availability > 75 ? "high" : availability > 50 ? "medium" : "low"

    // Estimate wait time
    const estimatedWaitTime = availability < 30 ? Math.floor(Math.random() * 20) + 5 : 0

    return {
      spotId,
      predictedAvailability: Math.round(availability),
      confidence: Math.round(confidence),
      timeWindow,
      factors: {
        historical: Math.round(historicalFactor * 100),
        timeOfDay: Math.round(timeOfDayFactor * 100),
        dayOfWeek: Math.round(dayOfWeekFactor * 100),
        weather: Math.round(weatherFactor * 100),
      },
      recommendation,
      estimatedWaitTime,
    }
  }

  private generateFallbackPrediction(spotId: string, targetTime: Date, timeWindow: string): SpotPrediction {
    const hour = targetTime.getHours()
    const isBusinessHours = hour >= 9 && hour <= 17
    const availability = isBusinessHours ? 40 + Math.random() * 30 : 60 + Math.random() * 30

    return {
      spotId,
      predictedAvailability: Math.round(availability),
      confidence: 60, // Lower confidence for fallback
      timeWindow,
      factors: {
        historical: 70,
        timeOfDay: isBusinessHours ? 60 : 80,
        dayOfWeek: 75,
        weather: 90,
      },
      recommendation: availability > 60 ? "medium" : "low",
      estimatedWaitTime: availability < 40 ? 10 : 0,
    }
  }

  private calculateTimeOfDayFactor(hour: number): number {
    // Peak hours have lower availability
    if (hour >= 8 && hour <= 10) return 0.6 // Morning rush
    if (hour >= 12 && hour <= 14) return 0.7 // Lunch time
    if (hour >= 17 && hour <= 19) return 0.5 // Evening rush
    if (hour >= 20 && hour <= 22) return 0.8 // Evening
    return 0.9 // Off-peak hours
  }

  private calculateDayOfWeekFactor(dayOfWeek: number): number {
    // Weekend vs weekday patterns
    if (dayOfWeek === 0 || dayOfWeek === 6) return 0.8 // Weekend
    if (dayOfWeek >= 1 && dayOfWeek <= 5) return 0.7 // Weekday
    return 0.75
  }

  private simulateHistoricalData(spotId: string, hour: number, dayOfWeek: number): number {
    // Simulate historical patterns based on spot ID
    const spotHash = this.hashCode(spotId)
    const basePattern = 0.7 + (spotHash % 30) / 100 // 0.7 to 1.0

    // Add some variation based on time
    const timeVariation = Math.sin((hour * Math.PI) / 12) * 0.2

    return Math.max(0.3, Math.min(1.0, basePattern + timeVariation))
  }

  private calculateConfidence(spotId: string, targetTime: Date): number {
    const now = new Date()
    const timeDiff = Math.abs(targetTime.getTime() - now.getTime()) / (1000 * 60 * 60) // hours

    // Confidence decreases with time distance
    let confidence = 90 - timeDiff * 5 // Lose 5% per hour
    confidence = Math.max(50, Math.min(95, confidence))

    return confidence
  }

  private hashCode(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  async batchPredict(spotIds: string[], targetTime: Date, timeWindow = "30min"): Promise<SpotPrediction[]> {
    const predictions = await Promise.all(
      spotIds.map((spotId) => this.predictSpotAvailability(spotId, targetTime, timeWindow)),
    )
    return predictions
  }

  clearCache(): void {
    this.cache.clear()
    console.log("🧹 AI prediction cache cleared")
  }
}
