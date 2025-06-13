import { supabase } from "./supabase"

export interface NotificationPreferences {
  userId: string
  enablePriceAlerts: boolean
  enableAvailabilityAlerts: boolean
  enableTrafficAlerts: boolean
  enableEventAlerts: boolean
  maxPrice: number
  preferredRadius: number
  quietHours: { start: string; end: string }
  preferredSpotTypes: string[]
}

export interface SmartAlert {
  id: string
  type: "price_drop" | "availability" | "traffic_clear" | "event_impact" | "optimal_time"
  title: string
  message: string
  spotId?: string
  urgency: "low" | "medium" | "high"
  actionUrl?: string
  expiresAt: Date
  metadata: any
}

export class SmartNotificationService {
  private static instance: SmartNotificationService

  static getInstance(): SmartNotificationService {
    if (!SmartNotificationService.instance) {
      SmartNotificationService.instance = new SmartNotificationService()
    }
    return SmartNotificationService.instance
  }

  async setupUserNotifications(userId: string, preferences: NotificationPreferences): Promise<void> {
    // Store user preferences
    await supabase.from("notification_preferences").upsert({
      user_id: userId,
      ...preferences,
      updated_at: new Date().toISOString(),
    })

    // Set up geofencing for favorite locations
    await this.setupGeofencing(userId, preferences)
  }

  async generateSmartAlerts(
    userId: string,
    userLocation: { lat: number; lng: number },
    destination?: { lat: number; lng: number; arrivalTime: Date },
  ): Promise<SmartAlert[]> {
    const preferences = await this.getUserPreferences(userId)
    if (!preferences) return []

    const alerts: SmartAlert[] = []

    // Price drop alerts
    if (preferences.enablePriceAlerts) {
      const priceAlerts = await this.generatePriceAlerts(userId, userLocation, preferences)
      alerts.push(...priceAlerts)
    }

    // Availability alerts
    if (preferences.enableAvailabilityAlerts) {
      const availabilityAlerts = await this.generateAvailabilityAlerts(userId, userLocation, preferences)
      alerts.push(...availabilityAlerts)
    }

    // Traffic alerts
    if (preferences.enableTrafficAlerts && destination) {
      const trafficAlerts = await this.generateTrafficAlerts(userLocation, destination)
      alerts.push(...trafficAlerts)
    }

    // Event impact alerts
    if (preferences.enableEventAlerts) {
      const eventAlerts = await this.generateEventAlerts(userLocation, preferences)
      alerts.push(...eventAlerts)
    }

    // Optimal timing alerts
    if (destination) {
      const timingAlerts = await this.generateOptimalTimingAlerts(destination)
      alerts.push(...timingAlerts)
    }

    return this.prioritizeAlerts(alerts)
  }

  private async getUserPreferences(userId: string): Promise<NotificationPreferences | null> {
    const { data } = await supabase.from("notification_preferences").select("*").eq("user_id", userId).single()

    return data
  }

  private async generatePriceAlerts(
    userId: string,
    location: { lat: number; lng: number },
    preferences: NotificationPreferences,
  ): Promise<SmartAlert[]> {
    const alerts: SmartAlert[] = []

    // Check for price drops in favorite spots
    const { data: favoriteSpots } = await supabase
      .from("user_favorite_spots")
      .select("spot_id, last_known_price")
      .eq("user_id", userId)

    for (const favorite of favoriteSpots || []) {
      // Get current price
      const { data: currentSpot } = await supabase
        .from("real_parking_spots")
        .select("price_per_hour, name")
        .eq("id", favorite.spot_id)
        .single()

      if (currentSpot && currentSpot.price_per_hour < favorite.last_known_price) {
        const savings = favorite.last_known_price - currentSpot.price_per_hour
        alerts.push({
          id: `price_drop_${favorite.spot_id}`,
          type: "price_drop",
          title: "Price Drop Alert! 💰",
          message: `${currentSpot.name} is now $${currentSpot.price_per_hour}/hr (was $${favorite.last_known_price}/hr). Save $${savings}!`,
          spotId: favorite.spot_id,
          urgency: savings > 2 ? "high" : "medium",
          actionUrl: `/spot/${favorite.spot_id}`,
          expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
          metadata: { savings, oldPrice: favorite.last_known_price, newPrice: currentSpot.price_per_hour },
        })
      }
    }

    return alerts
  }

  private async generateAvailabilityAlerts(
    userId: string,
    location: { lat: number; lng: number },
    preferences: NotificationPreferences,
  ): Promise<SmartAlert[]> {
    const alerts: SmartAlert[] = []

    // Check for newly available spots in preferred areas
    const { data: recentlyAvailable } = await supabase.rpc("find_recently_available_spots", {
      user_lat: location.lat,
      user_lng: location.lng,
      radius_meters: preferences.preferredRadius,
      max_price: preferences.maxPrice,
      minutes_ago: 30,
    })

    for (const spot of recentlyAvailable || []) {
      alerts.push({
        id: `availability_${spot.id}`,
        type: "availability",
        title: "Spot Just Opened! 🅿️",
        message: `${spot.name} just became available. ${Math.round(spot.distance_meters)}m away, $${spot.price_per_hour}/hr`,
        spotId: spot.id,
        urgency: spot.distance_meters < 200 ? "high" : "medium",
        actionUrl: `/navigate/${spot.id}`,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        metadata: { distance: spot.distance_meters, price: spot.price_per_hour },
      })
    }

    return alerts
  }

  private async generateTrafficAlerts(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number; arrivalTime: Date },
  ): Promise<SmartAlert[]> {
    const alerts: SmartAlert[] = []

    // Calculate optimal departure time considering traffic
    const currentTime = new Date()
    const timeToArrival = destination.arrivalTime.getTime() - currentTime.getTime()

    if (timeToArrival > 0 && timeToArrival < 2 * 60 * 60 * 1000) {
      // Within 2 hours
      // Mock traffic calculation - in production, use Google Maps API
      const estimatedTravelTime = 25 // minutes
      const optimalDepartureTime = new Date(destination.arrivalTime.getTime() - estimatedTravelTime * 60 * 1000)

      if (optimalDepartureTime.getTime() - currentTime.getTime() < 15 * 60 * 1000) {
        // Should leave within 15 minutes
        alerts.push({
          id: "traffic_departure",
          type: "traffic_clear",
          title: "Time to Leave! 🚗",
          message: `Leave now to arrive on time. Current traffic: ${estimatedTravelTime} min drive + parking time.`,
          urgency: "high",
          actionUrl: "/navigate",
          expiresAt: optimalDepartureTime,
          metadata: { travelTime: estimatedTravelTime, departureTime: optimalDepartureTime },
        })
      }
    }

    return alerts
  }

  private async generateEventAlerts(
    location: { lat: number; lng: number },
    preferences: NotificationPreferences,
  ): Promise<SmartAlert[]> {
    const alerts: SmartAlert[] = []

    // Mock event data - in production, integrate with event APIs
    const upcomingEvents = [
      {
        name: "Concert at Madison Square Garden",
        startTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
        distance: 0.8,
        expectedAttendees: 20000,
      },
    ]

    for (const event of upcomingEvents) {
      if (event.distance < 2) {
        // Within 2km
        alerts.push({
          id: `event_${event.name.replace(/\s+/g, "_")}`,
          type: "event_impact",
          title: "Event Alert! 🎵",
          message: `${event.name} starts soon. Expect heavy parking demand in the area. Consider booking ahead.`,
          urgency: "medium",
          actionUrl: "/book-ahead",
          expiresAt: event.startTime,
          metadata: { eventName: event.name, attendees: event.expectedAttendees, distance: event.distance },
        })
      }
    }

    return alerts
  }

  private async generateOptimalTimingAlerts(destination: {
    lat: number
    lng: number
    arrivalTime: Date
  }): Promise<SmartAlert[]> {
    const alerts: SmartAlert[] = []

    // Calculate optimal arrival time for parking
    const currentTime = new Date()
    const timeToArrival = destination.arrivalTime.getTime() - currentTime.getTime()

    // Suggest arriving 15-30 minutes early for better parking
    if (timeToArrival > 30 * 60 * 1000 && timeToArrival < 2 * 60 * 60 * 1000) {
      const optimalArrival = new Date(destination.arrivalTime.getTime() - 20 * 60 * 1000)

      alerts.push({
        id: "optimal_timing",
        type: "optimal_time",
        title: "Optimal Parking Time ⏰",
        message: `Arrive 20 minutes early for better parking availability and lower prices.`,
        urgency: "low",
        actionUrl: "/adjust-arrival",
        expiresAt: optimalArrival,
        metadata: { suggestedArrival: optimalArrival, originalArrival: destination.arrivalTime },
      })
    }

    return alerts
  }

  private prioritizeAlerts(alerts: SmartAlert[]): SmartAlert[] {
    return alerts.sort((a, b) => {
      const urgencyOrder = { high: 3, medium: 2, low: 1 }
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency]
    })
  }

  private async setupGeofencing(userId: string, preferences: NotificationPreferences): Promise<void> {
    // Set up geofences around user's favorite locations
    const { data: favoriteLocations } = await supabase.from("user_favorite_locations").select("*").eq("user_id", userId)

    for (const location of favoriteLocations || []) {
      // In a real app, this would set up push notification geofences
      console.log(`Setting up geofence for ${location.name} at ${location.latitude}, ${location.longitude}`)
    }
  }

  async sendPushNotification(userId: string, alert: SmartAlert): Promise<void> {
    // Check if user is in quiet hours
    const preferences = await this.getUserPreferences(userId)
    if (preferences && this.isInQuietHours(preferences.quietHours)) {
      // Queue for later or send as low-priority
      await this.queueNotification(userId, alert)
      return
    }

    // Send push notification via Firebase
    try {
      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          title: alert.title,
          message: alert.message,
          data: {
            alertId: alert.id,
            type: alert.type,
            actionUrl: alert.actionUrl,
            metadata: alert.metadata,
          },
        }),
      })

      if (response.ok) {
        // Log successful notification
        await supabase.from("notification_log").insert({
          user_id: userId,
          alert_id: alert.id,
          type: alert.type,
          sent_at: new Date().toISOString(),
          status: "sent",
        })
      }
    } catch (error) {
      console.error("Failed to send push notification:", error)
    }
  }

  private isInQuietHours(quietHours: { start: string; end: string }): boolean {
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

    return currentTime >= quietHours.start && currentTime <= quietHours.end
  }

  private async queueNotification(userId: string, alert: SmartAlert): Promise<void> {
    await supabase.from("notification_queue").insert({
      user_id: userId,
      alert_data: alert,
      scheduled_for: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours later
      created_at: new Date().toISOString(),
    })
  }
}
