import { getBrowserClient } from './supabase/browser'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types/supabase'

type Tables = Database['public']['Tables']
type NotificationPreferencesRow = Tables['notification_preferences']['Row']
type NotificationsRow = Tables['notifications']['Row']
type NotificationQueueRow = Tables['notification_queue']['Row']
type Json = Database['public']['Tables']['notifications']['Row']['data']

export interface NotificationPreferences {
  userId: string
  email: boolean
  push: boolean
  sms: boolean
  enablePriceAlerts: boolean
  enableAvailabilityAlerts: boolean
  enableTrafficAlerts: boolean
  enableEventAlerts: boolean
  maxPrice: number
  preferredRadius: number
  quietHours: {
    start: string
    end: string
  }
  preferredSpotTypes: string[]
  updated_at?: string
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
  metadata: Record<string, unknown>
}

export class SmartNotificationService {
  private static instance: SmartNotificationService
  private supabase: SupabaseClient<Database>
  private initialized: boolean = false

  private constructor() {
    this.supabase = getBrowserClient()
    this.initialized = true
  }

  static getInstance(): SmartNotificationService {
    if (!SmartNotificationService.instance) {
      SmartNotificationService.instance = new SmartNotificationService()
    }
    return SmartNotificationService.instance
  }

  private checkInitialized() {
    if (!this.initialized || !this.supabase) {
      throw new Error('SmartNotificationService not properly initialized')
    }
  }

  async setupUserNotifications(userId: string, preferences: NotificationPreferences): Promise<void> {
    this.checkInitialized()
    
    const { error } = await this.supabase.from("notification_preferences").upsert({
      id: crypto.randomUUID(),
      user_id: userId,
      email: preferences.email,
      push: preferences.push,
      sms: preferences.sms,
      created_at: new Date().toISOString()
    })

    if (error) throw error

    // Set up geofencing for favorite locations
    await this.setupGeofencing(userId, preferences)
  }

  async getUserPreferences(userId: string): Promise<NotificationPreferences | null> {
    this.checkInitialized()
    const { data, error } = await this.supabase
      .from("notification_preferences")
      .select()
      .eq("user_id", userId)
      .single()

    if (error) throw error
    if (!data) return null

    return {
      userId: userId, // Use the passed userId instead of potentially null data.user_id
      email: data.email ?? false,
      push: data.push ?? false,
      sms: data.sms ?? false,
      enablePriceAlerts: false,
      enableAvailabilityAlerts: false,
      enableTrafficAlerts: false,
      enableEventAlerts: false,
      maxPrice: 0,
      preferredRadius: 1000,
      quietHours: {
        start: "22:00",
        end: "07:00"
      },
      preferredSpotTypes: []
    }
  }

  async sendPushNotification(userId: string, alert: SmartAlert): Promise<void> {
    this.checkInitialized()
    
    // Check if user is in quiet hours
    const preferences = await this.getUserPreferences(userId)
    if (preferences && this.isInQuietHours(preferences.quietHours)) {
      // Queue for later
      await this.queueNotification(userId, alert)
      return
    }

    const notificationData: Json = {
      spotId: alert.spotId,
      urgency: alert.urgency,
      actionUrl: alert.actionUrl,
      metadata: JSON.stringify(alert.metadata)
    }

    const { error } = await this.supabase.from("notifications").insert({
      id: crypto.randomUUID(),
      user_id: userId,
      notification_type: alert.type,
      title: alert.title,
      message: alert.message,
      data: notificationData,
      created_at: new Date().toISOString(),
      sent_at: new Date().toISOString(),
      read: false
    })

    if (error) throw error
  }

  private isInQuietHours(quietHours: { start: string; end: string }): boolean {
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
    return currentTime >= quietHours.start && currentTime <= quietHours.end
  }

  private async queueNotification(userId: string, alert: SmartAlert): Promise<void> {
    this.checkInitialized()
    const quietHoursEnd = new Date()
    quietHoursEnd.setHours(7, 0, 0, 0) // Default to 7 AM
    if (quietHoursEnd < new Date()) {
      quietHoursEnd.setDate(quietHoursEnd.getDate() + 1)
    }

    const { error } = await this.supabase.from("notification_queue").insert({
      id: crypto.randomUUID(),
      user_id: userId,
      type: alert.type,
      message: alert.message,
      scheduled_for: quietHoursEnd.toISOString(),
      created_at: new Date().toISOString()
    })

    if (error) throw error
  }

  private async setupGeofencing(userId: string, preferences: NotificationPreferences): Promise<void> {
    this.checkInitialized()
    
    const { data, error } = await this.supabase
      .from("user_favorite_spots")
      .select()
      .eq("user_id", userId)
      
    if (error) throw error

    for (const location of data || []) {
      // In a real app, this would set up push notification geofences
      console.log(`Setting up geofence for ${location.spot_id}`)
    }
  }
}
