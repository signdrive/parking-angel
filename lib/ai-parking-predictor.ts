import { getBrowserClient } from './supabase/browser'
import type { RealParkingSpot } from "./parking-data-service"
import type { Database } from '../types/supabase'

type NearbySpot = Database['public']['Functions']['find_nearby_real_spots']['Returns'][0]

const supabase = getBrowserClient()

export interface ParkingPrediction {
  spotId: string
  predictedAvailability: number // 0-1 probability
  predictedPrice: number
  confidence: number
  factors: string[]
  bestTimeToArrive: Date
  alternativeSpots: string[]
  trafficImpact: number
  weatherImpact: number
  eventImpact: number
}

export interface ParkingDemandForecast {
  timeSlot: string
  demandLevel: "low" | "medium" | "high" | "extreme"
  availabilityScore: number
  priceMultiplier: number
  recommendedAction: "park_now" | "wait" | "find_alternative" | "book_ahead"
}

export class AIParkingPredictor {
  private static instance: AIParkingPredictor

  static getInstance(): AIParkingPredictor {
    if (!AIParkingPredictor.instance) {
      AIParkingPredictor.instance = new AIParkingPredictor()
    }
    return AIParkingPredictor.instance
  }

  async predictParkingAvailability(
    spots: RealParkingSpot[],
    targetTime: Date,
    userPreferences: {
      maxWalkDistance?: number
      maxPrice?: number
      requireCovered?: boolean
      requireSecurity?: boolean
      requireEVCharging?: boolean
    } = {},
  ): Promise<ParkingPrediction[]> {
    const predictions: ParkingPrediction[] = []

    for (const spot of spots) {
      try {
        const prediction = await this.predictSingleSpot(spot, targetTime, userPreferences)
        predictions.push(prediction)
      } catch (error) {
        console.error(`Error predicting spot ${spot.id}:`, error)
      }
    }

    // Sort by confidence and availability
    return predictions.sort((a, b) => b.confidence * b.predictedAvailability - a.confidence * a.predictedAvailability)
  }

  private async predictSingleSpot(
    spot: RealParkingSpot,
    targetTime: Date,
    userPreferences: any,
  ): Promise<ParkingPrediction> {
    // Get historical data
    const historicalData = await this.getHistoricalData(spot.id, targetTime)

    // Get current events and traffic
    const contextData = await this.getContextualData(spot.latitude, spot.longitude, targetTime)

    // Calculate base availability from historical patterns
    const baseAvailability = this.calculateBaseAvailability(historicalData, targetTime)

    // Apply contextual adjustments
    const trafficImpact = this.calculateTrafficImpact(contextData.traffic)
    const weatherImpact = this.calculateWeatherImpact(contextData.weather)
    const eventImpact = this.calculateEventImpact(contextData.events, spot)

    // Final prediction
    const predictedAvailability = Math.max(
      0,
      Math.min(1, baseAvailability * (1 - trafficImpact) * (1 - weatherImpact) * (1 - eventImpact)),
    )

    // Price prediction
    const predictedPrice = this.predictPrice(spot, targetTime, predictedAvailability, contextData)

    // Confidence calculation
    const confidence = this.calculateConfidence(historicalData, spot.real_time_data)

    // Find best arrival time
    const bestTimeToArrive = await this.findOptimalArrivalTime(spot, targetTime)

    // Find alternatives
    const alternativeSpots = await this.findAlternativeSpots(spot, userPreferences)

    return {
      spotId: spot.id,
      predictedAvailability,
      predictedPrice,
      confidence,
      factors: this.identifyFactors(trafficImpact, weatherImpact, eventImpact, contextData),
      bestTimeToArrive,
      alternativeSpots,
      trafficImpact,
      weatherImpact,
      eventImpact,
    }
  }
  private async getHistoricalData(spotId: string, targetTime: Date) {
    const { data } = await supabase
      .from("parking_usage_history")
      .select()
      .eq("spot_id", spotId)
      .gte("timestamp", new Date(targetTime.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
      .order("timestamp", { ascending: false })

    return data || []
  }

  private async getContextualData(lat: number, lng: number, targetTime: Date) {
    // In a real implementation, these would be actual API calls
    return {
      traffic: await this.getTrafficData(lat, lng, targetTime),
      weather: await this.getWeatherData(lat, lng, targetTime),
      events: await this.getEventsData(lat, lng, targetTime),
    }
  }

  private async getTrafficData(lat: number, lng: number, targetTime: Date) {
    // Mock traffic data - in production, use Google Maps Traffic API or similar
    const hour = targetTime.getHours()
    const isWeekend = targetTime.getDay() === 0 || targetTime.getDay() === 6

    let trafficLevel = 0.3 // Base traffic

    // Rush hour adjustments
    if (!isWeekend && ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19))) {
      trafficLevel = 0.8
    } else if (!isWeekend && hour >= 10 && hour <= 16) {
      trafficLevel = 0.5
    } else if (isWeekend && hour >= 12 && hour <= 18) {
      trafficLevel = 0.6
    }

    return {
      level: trafficLevel,
      duration: Math.round(trafficLevel * 30 + 10), // Minutes
      congestion: trafficLevel > 0.7 ? "heavy" : trafficLevel > 0.4 ? "moderate" : "light",
    }
  }

  private async getWeatherData(lat: number, lng: number, targetTime: Date) {
    // Mock weather data - in production, use OpenWeatherMap or similar
    return {
      condition: "clear", // clear, rain, snow, etc.
      temperature: 20,
      precipitation: 0,
      impact: 0.1, // 0-1 scale
    }
  }

  private async getEventsData(lat: number, lng: number, targetTime: Date) {
    // Mock events data - in production, use Eventbrite, Ticketmaster APIs
    const events = [
      {
        name: "Concert at nearby venue",
        distance: 0.5, // km
        attendees: 5000,
        startTime: new Date(targetTime.getTime() + 60 * 60 * 1000),
        impact: 0.7,
      },
    ]

    return events.filter((event) => {
      const timeDiff = Math.abs(event.startTime.getTime() - targetTime.getTime())
      return timeDiff < 3 * 60 * 60 * 1000 && event.distance < 2 // Within 3 hours and 2km
    })
  }

  private calculateBaseAvailability(historicalData: any[], targetTime: Date): number {
    if (historicalData.length === 0) return 0.5 // Default if no data

    const hour = targetTime.getHours()
    const dayOfWeek = targetTime.getDay()

    // Filter similar time periods
    const similarPeriods = historicalData.filter((record) => {
      const recordTime = new Date(record.timestamp)
      return Math.abs(recordTime.getHours() - hour) <= 1 && recordTime.getDay() === dayOfWeek
    })

    if (similarPeriods.length === 0) return 0.5

    const avgAvailability =
      similarPeriods.reduce((sum, record) => sum + record.availability_rate, 0) / similarPeriods.length

    return avgAvailability
  }

  private calculateTrafficImpact(traffic: any): number {
    // Higher traffic = lower parking availability (people drive more)
    return traffic.level * 0.3
  }

  private calculateWeatherImpact(weather: any): number {
    if (weather.condition === "rain" || weather.condition === "snow") {
      return 0.4 // Bad weather increases parking demand
    }
    return 0.1
  }

  private calculateEventImpact(events: any[], spot: RealParkingSpot): number {
    if (events.length === 0) return 0

    let totalImpact = 0
    for (const event of events) {
      // Calculate distance impact
      const distanceImpact = Math.max(0, 1 - event.distance / 2) // Impact decreases with distance
      totalImpact += event.impact * distanceImpact
    }

    return Math.min(0.8, totalImpact) // Cap at 80% impact
  }

  private predictPrice(spot: RealParkingSpot, targetTime: Date, availability: number, contextData: any): number {
    const basePrice = spot.price_per_hour || 5 // Default $5/hour

    // Dynamic pricing based on demand
    const demandMultiplier = 1 + (1 - availability) * 0.5 // Up to 50% increase

    // Event pricing
    const eventMultiplier = contextData.events.length > 0 ? 1.3 : 1

    // Time-based pricing
    const hour = targetTime.getHours()
    const timeMultiplier = hour >= 9 && hour <= 17 ? 1.2 : 0.9 // Business hours premium

    return Math.round(basePrice * demandMultiplier * eventMultiplier * timeMultiplier * 100) / 100
  }

  private calculateConfidence(historicalData: any[], hasRealTimeData: boolean): number {
    let confidence = 0.5 // Base confidence

    // More historical data = higher confidence
    confidence += Math.min(0.3, historicalData.length / 100)

    // Real-time data significantly increases confidence
    if (hasRealTimeData) {
      confidence += 0.4
    }

    return Math.min(1, confidence)
  }

  private identifyFactors(
    trafficImpact: number,
    weatherImpact: number,
    eventImpact: number,
    contextData: any,
  ): string[] {
    const factors = []

    if (trafficImpact > 0.3) {
      factors.push(`Heavy traffic (${contextData.traffic.congestion})`)
    }

    if (weatherImpact > 0.2) {
      factors.push(`Weather conditions (${contextData.weather.condition})`)
    }

    if (eventImpact > 0.2) {
      factors.push(`Nearby events (${contextData.events.length} events)`)
    }

    if (factors.length === 0) {
      factors.push("Normal conditions")
    }

    return factors
  }

  private async findOptimalArrivalTime(spot: RealParkingSpot, targetTime: Date): Promise<Date> {
    // Check availability for different arrival times
    const timeSlots = []
    for (let i = -60; i <= 60; i += 15) {
      // Check ±1 hour in 15-minute intervals
      const testTime = new Date(targetTime.getTime() + i * 60 * 1000)
      const prediction = await this.predictSingleSpot(spot, testTime, {})
      timeSlots.push({
        time: testTime,
        score: prediction.predictedAvailability * (1 / prediction.predictedPrice),
      })
    }

    // Find the best time slot
    const bestSlot = timeSlots.reduce((best, current) => (current.score > best.score ? current : best))

    return bestSlot.time
  }
  private async findAlternativeSpots(spot: RealParkingSpot, userPreferences: any): Promise<string[]> {
    const { data } = await supabase.rpc("find_nearby_real_spots", {
      lat: spot.latitude,
      lng: spot.longitude,
      radius: 1000,
    })

    return (data || [])
      .filter((s) => s.id !== spot.id)
      .slice(0, 3)
      .map((s) => s.id.toString())
  }

  async generateDemandForecast(lat: number, lng: number, date: Date): Promise<ParkingDemandForecast[]> {
    const forecasts: ParkingDemandForecast[] = []

    // Generate 24-hour forecast in 2-hour intervals
    for (let hour = 0; hour < 24; hour += 2) {
      const timeSlot = new Date(date)
      timeSlot.setHours(hour, 0, 0, 0)

      const forecast = await this.predictDemandForTimeSlot(lat, lng, timeSlot)
      forecasts.push(forecast)
    }

    return forecasts
  }

  private async predictDemandForTimeSlot(lat: number, lng: number, timeSlot: Date): Promise<ParkingDemandForecast> {
    const hour = timeSlot.getHours()
    const isWeekend = timeSlot.getDay() === 0 || timeSlot.getDay() === 6

    let demandLevel: "low" | "medium" | "high" | "extreme" = "low"
    let availabilityScore = 0.8
    let priceMultiplier = 1.0
    let recommendedAction: "park_now" | "wait" | "find_alternative" | "book_ahead" = "park_now"

    // Business hours logic
    if (!isWeekend && hour >= 9 && hour <= 17) {
      demandLevel = "high"
      availabilityScore = 0.3
      priceMultiplier = 1.3
      recommendedAction = "book_ahead"
    }
    // Rush hours
    else if (!isWeekend && ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19))) {
      demandLevel = "extreme"
      availabilityScore = 0.1
      priceMultiplier = 1.5
      recommendedAction = "find_alternative"
    }
    // Weekend peak
    else if (isWeekend && hour >= 12 && hour <= 18) {
      demandLevel = "medium"
      availabilityScore = 0.5
      priceMultiplier = 1.1
      recommendedAction = "park_now"
    }
    // Off-peak hours
    else {
      demandLevel = "low"
      availabilityScore = 0.9
      priceMultiplier = 0.8
      recommendedAction = "wait"
    }

    return {
      timeSlot: `${hour.toString().padStart(2, "0")}:00`,
      demandLevel,
      availabilityScore,
      priceMultiplier,
      recommendedAction,
    }
  }
}
