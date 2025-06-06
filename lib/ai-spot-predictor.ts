import { supabase } from "./supabase"

export interface SpotPrediction {
  spotId: string
  currentAvailability: "available" | "occupied" | "unknown"
  predictedAvailability: number // 0-100% confidence
  predictionTimeframe: "15min" | "30min" | "1hour" | "2hour"
  confidence: number // 0-100% how sure we are
  factors: PredictionFactor[]
  recommendedAction: "book_now" | "wait" | "find_alternative"
  priceImpact: "stable" | "increasing" | "decreasing"
}

export interface PredictionFactor {
  type: "historical" | "event" | "weather" | "traffic" | "day_pattern"
  impact: number // -100 to +100 (negative = less available)
  description: string
}

export interface EventData {
  name: string
  startTime: Date
  endTime: Date
  attendees: number
  venue: string
  distance: number // km from parking spot
}

export class AISpotPredictor {
  private static instance: AISpotPredictor

  static getInstance(): AISpotPredictor {
    if (!AISpotPredictor.instance) {
      AISpotPredictor.instance = new AISpotPredictor()
    }
    return AISpotPredictor.instance
  }

  async predictSpotAvailability(
    spotId: string,
    targetTime: Date,
    timeframe: "15min" | "30min" | "1hour" | "2hour" = "30min",
  ): Promise<SpotPrediction> {
    // Get historical data for this spot
    const historicalData = await this.getHistoricalData(spotId, targetTime)

    // Get contextual factors
    const factors = await this.getContextualFactors(spotId, targetTime)

    // Run AI prediction algorithm
    const prediction = this.calculatePrediction(historicalData, factors, timeframe)

    return {
      spotId,
      currentAvailability: await this.getCurrentAvailability(spotId),
      predictedAvailability: prediction.availability,
      predictionTimeframe: timeframe,
      confidence: prediction.confidence,
      factors: factors,
      recommendedAction: this.getRecommendedAction(prediction),
      priceImpact: this.predictPriceImpact(prediction, factors),
    }
  }

  private async getHistoricalData(spotId: string, targetTime: Date) {
    const dayOfWeek = targetTime.getDay()
    const hour = targetTime.getHours()
    const month = targetTime.getMonth()

    // Get similar time periods from last 90 days
    const { data } = await supabase
      .from("parking_usage_history")
      .select("*")
      .eq("spot_id", spotId)
      .gte("timestamp", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))
      .order("timestamp", { ascending: false })

    // Filter for similar patterns
    const similarPeriods = (data || []).filter((record) => {
      const recordTime = new Date(record.timestamp)
      const timeDiff = Math.abs(recordTime.getHours() - hour)
      const dayMatch = recordTime.getDay() === dayOfWeek

      return dayMatch && timeDiff <= 1
    })

    return {
      totalRecords: similarPeriods.length,
      averageOccupancy: this.calculateAverageOccupancy(similarPeriods),
      peakHours: this.identifyPeakHours(similarPeriods),
      seasonalTrends: this.analyzeSeasonalTrends(similarPeriods, month),
    }
  }

  private async getContextualFactors(spotId: string, targetTime: Date): Promise<PredictionFactor[]> {
    const factors: PredictionFactor[] = []

    // Get spot location for context
    const { data: spot } = await supabase
      .from("parking_spots")
      .select("latitude, longitude, spot_type, address")
      .eq("id", spotId)
      .single()

    if (!spot) return factors

    // Day pattern analysis
    const dayPattern = this.analyzeDayPattern(targetTime)
    factors.push({
      type: "day_pattern",
      impact: dayPattern.impact,
      description: dayPattern.description,
    })

    // Event impact
    const events = await this.getNearbyEvents(spot.latitude, spot.longitude, targetTime)
    for (const event of events) {
      const eventImpact = this.calculateEventImpact(event, spot)
      factors.push({
        type: "event",
        impact: eventImpact.impact,
        description: `${event.name} (${event.attendees} attendees, ${event.distance.toFixed(1)}km away)`,
      })
    }

    // Weather impact
    const weather = await this.getWeatherForecast(spot.latitude, spot.longitude, targetTime)
    const weatherImpact = this.calculateWeatherImpact(weather)
    factors.push({
      type: "weather",
      impact: weatherImpact.impact,
      description: weatherImpact.description,
    })

    // Traffic impact
    const traffic = await this.getTrafficForecast(spot.latitude, spot.longitude, targetTime)
    const trafficImpact = this.calculateTrafficImpact(traffic)
    factors.push({
      type: "traffic",
      impact: trafficImpact.impact,
      description: trafficImpact.description,
    })

    return factors
  }

  private calculatePrediction(historicalData: any, factors: PredictionFactor[], timeframe: string) {
    // Base prediction from historical data
    const baseAvailability = historicalData.averageOccupancy || 50

    // Apply contextual factors
    let totalImpact = 0
    let confidenceModifier = 1

    factors.forEach((factor) => {
      totalImpact += factor.impact

      // More data sources = higher confidence
      if (factor.type === "historical" && historicalData.totalRecords > 10) {
        confidenceModifier += 0.2
      }
    })

    // Calculate final prediction
    const predictedAvailability = Math.max(0, Math.min(100, baseAvailability + totalImpact * 0.5))

    // Calculate confidence based on data quality and consistency
    const baseConfidence = Math.min(90, 30 + historicalData.totalRecords * 2)
    const finalConfidence = Math.min(95, baseConfidence * confidenceModifier)

    return {
      availability: Math.round(predictedAvailability),
      confidence: Math.round(finalConfidence),
    }
  }

  private analyzeDayPattern(targetTime: Date) {
    const hour = targetTime.getHours()
    const dayOfWeek = targetTime.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    // Business district patterns
    if (!isWeekend && hour >= 8 && hour <= 18) {
      return {
        impact: -30, // Less availability during business hours
        description: "Business hours - high demand expected",
      }
    }

    // Evening/weekend patterns
    if (isWeekend || hour >= 18) {
      return {
        impact: 10, // More availability in evenings/weekends
        description: "Off-peak hours - lower demand expected",
      }
    }

    return {
      impact: 0,
      description: "Normal demand pattern",
    }
  }

  private async getNearbyEvents(lat: number, lng: number, targetTime: Date): Promise<EventData[]> {
    // In production, integrate with Eventbrite, Ticketmaster, or local event APIs
    // For now, return mock data based on common event patterns

    const events: EventData[] = []
    const hour = targetTime.getHours()
    const dayOfWeek = targetTime.getDay()

    // Mock major events that would impact parking
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      // Friday/Saturday
      if (hour >= 19 && hour <= 23) {
        events.push({
          name: "Downtown Concert",
          startTime: new Date(targetTime.getTime() - 60 * 60 * 1000),
          endTime: new Date(targetTime.getTime() + 3 * 60 * 60 * 1000),
          attendees: 2000,
          venue: "City Concert Hall",
          distance: 0.3,
        })
      }
    }

    return events
  }

  private calculateEventImpact(event: EventData, spot: any) {
    const distanceImpact = Math.max(0, 1 - event.distance / 2) // Impact decreases with distance
    const sizeImpact = Math.min(1, event.attendees / 5000) // Larger events = more impact
    const timeImpact = this.calculateTimeProximityImpact(event.startTime, new Date())

    const totalImpact = -(distanceImpact * sizeImpact * timeImpact * 50) // Negative = less availability

    return {
      impact: Math.round(totalImpact),
    }
  }

  private calculateTimeProximityImpact(eventTime: Date, targetTime: Date): number {
    const timeDiff = Math.abs(eventTime.getTime() - targetTime.getTime()) / (1000 * 60 * 60) // hours

    if (timeDiff <= 1) return 1.0 // Peak impact within 1 hour
    if (timeDiff <= 2) return 0.7 // High impact within 2 hours
    if (timeDiff <= 4) return 0.3 // Medium impact within 4 hours

    return 0.1 // Low impact beyond 4 hours
  }

  private async getWeatherForecast(lat: number, lng: number, targetTime: Date) {
    // In production, integrate with OpenWeatherMap or similar
    // Mock weather data for now
    return {
      condition: "clear", // clear, rain, snow, storm
      temperature: 22,
      precipitation: 0,
      windSpeed: 5,
    }
  }

  private calculateWeatherImpact(weather: any) {
    let impact = 0
    let description = "Clear weather - normal parking demand"

    if (weather.condition === "rain") {
      impact = -20 // Rain increases parking demand
      description = "Rainy weather - increased parking demand"
    } else if (weather.condition === "snow") {
      impact = -35 // Snow significantly increases demand
      description = "Snow - high parking demand expected"
    } else if (weather.condition === "storm") {
      impact = -40 // Storms create highest demand
      description = "Storm conditions - very high parking demand"
    }

    return { impact, description }
  }

  private async getTrafficForecast(lat: number, lng: number, targetTime: Date) {
    // In production, integrate with Google Maps Traffic API
    const hour = targetTime.getHours()
    const dayOfWeek = targetTime.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    // Mock traffic patterns
    let congestionLevel = 0.3 // Base level

    if (!isWeekend) {
      if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
        congestionLevel = 0.8 // Rush hour
      } else if (hour >= 10 && hour <= 16) {
        congestionLevel = 0.5 // Business hours
      }
    }

    return {
      congestionLevel,
      estimatedDelay: congestionLevel * 20, // minutes
    }
  }

  private calculateTrafficImpact(traffic: any) {
    const impact = -(traffic.congestionLevel * 25) // High traffic = less parking availability

    let description = "Light traffic - normal parking availability"
    if (traffic.congestionLevel > 0.7) {
      description = "Heavy traffic - reduced parking availability"
    } else if (traffic.congestionLevel > 0.4) {
      description = "Moderate traffic - slightly reduced availability"
    }

    return { impact: Math.round(impact), description }
  }

  private calculateAverageOccupancy(records: any[]): number {
    if (records.length === 0) return 50 // Default assumption

    const totalOccupancy = records.reduce((sum, record) => {
      return sum + (record.is_occupied ? 100 : 0)
    }, 0)

    return totalOccupancy / records.length
  }

  private identifyPeakHours(records: any[]): number[] {
    const hourlyOccupancy: { [hour: number]: number[] } = {}

    records.forEach((record) => {
      const hour = new Date(record.timestamp).getHours()
      if (!hourlyOccupancy[hour]) hourlyOccupancy[hour] = []
      hourlyOccupancy[hour].push(record.is_occupied ? 100 : 0)
    })

    const peakHours: number[] = []
    Object.entries(hourlyOccupancy).forEach(([hour, occupancies]) => {
      const avgOccupancy = occupancies.reduce((a, b) => a + b, 0) / occupancies.length
      if (avgOccupancy > 70) {
        // Consider 70%+ as peak
        peakHours.push(Number.parseInt(hour))
      }
    })

    return peakHours
  }

  private analyzeSeasonalTrends(records: any[], currentMonth: number) {
    // Analyze if current month typically has higher/lower demand
    const monthlyData = records.filter((record) => {
      return new Date(record.timestamp).getMonth() === currentMonth
    })

    return {
      monthlyAverage: this.calculateAverageOccupancy(monthlyData),
      trend: "stable", // Could be 'increasing', 'decreasing', 'stable'
    }
  }

  private async getCurrentAvailability(spotId: string): Promise<"available" | "occupied" | "unknown"> {
    const { data } = await supabase.from("parking_spots").select("is_available, last_updated").eq("id", spotId).single()

    if (!data) return "unknown"

    // Check if data is recent (within 10 minutes)
    const lastUpdate = new Date(data.last_updated)
    const now = new Date()
    const minutesSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60)

    if (minutesSinceUpdate > 10) return "unknown"

    return data.is_available ? "available" : "occupied"
  }

  private getRecommendedAction(prediction: any): "book_now" | "wait" | "find_alternative" {
    if (prediction.availability > 70 && prediction.confidence > 60) {
      return "book_now"
    } else if (prediction.availability > 40 && prediction.confidence > 70) {
      return "wait"
    } else {
      return "find_alternative"
    }
  }

  private predictPriceImpact(prediction: any, factors: PredictionFactor[]): "stable" | "increasing" | "decreasing" {
    const demandFactors = factors.filter((f) => f.impact < -10) // High negative impact = high demand

    if (demandFactors.length >= 2) {
      return "increasing" // High demand = price increase
    } else if (prediction.availability > 80) {
      return "decreasing" // Low demand = price decrease
    }

    return "stable"
  }
}
