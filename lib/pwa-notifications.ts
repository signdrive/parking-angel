import { getBrowserClient } from './supabase/browser'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types/supabase'

export interface ParkingNotification {
  id: string
  type: "spot_available" | "price_drop" | "time_reminder" | "session_end" | "payment_due"
  title: string
  body: string
  icon?: string
  badge?: string
  tag: string
  requireInteraction?: boolean
  silent?: boolean
  timestamp: number
  data: {
    spotId?: string
    sessionId?: string
    actionUrl?: string
    [key: string]: any
  }
}

export class PWANotificationService {
  private static instance: PWANotificationService
  private supabase: SupabaseClient<Database>
  private initialized: boolean = false

  private constructor() {
    this.supabase = getBrowserClient()
    this.initialized = true
  }

  static getInstance(): PWANotificationService {
    if (!PWANotificationService.instance) {
      PWANotificationService.instance = new PWANotificationService()
    }
    return PWANotificationService.instance
  }

  private checkInitialized() {
    if (!this.initialized || !this.supabase) {
      throw new Error('PWANotificationService not properly initialized')
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications")
      return "denied"
    }

    if (Notification.permission === "granted") {
      return "granted"
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission()
      return permission
    }

    return Notification.permission
  }

  async showNotification(notification: ParkingNotification): Promise<void> {
    this.checkInitialized()
    const permission = await this.requestPermission()

    if (permission !== "granted") {
      console.warn("Notification permission not granted")
      return
    }

    // Check if service worker is available
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        // Use service worker to show notification (works in background)
        await registration.showNotification(notification.title, {
          body: notification.body,
          icon: notification.icon || "/icon-192x192.png",
          badge: notification.badge || "/icon-96x96.png",
          tag: notification.tag,
          requireInteraction: notification.requireInteraction || false,
          silent: notification.silent || false,
          data: notification.data,
          // actions removed: not supported by NotificationOptions type
        })
      }
    } else {
      // Fallback to regular notification
      const notif = new Notification(notification.title, {
        body: notification.body,
        icon: notification.icon || "/icon-192x192.png",
        tag: notification.tag,
        requireInteraction: notification.requireInteraction || false,
        silent: notification.silent || false,
        data: notification.data,
      })

      // Handle click
      notif.onclick = () => {
        window.focus()
        if (notification.data.actionUrl) {
          window.location.href = notification.data.actionUrl
        }
        notif.close()
      }
    }

    // Log notification
    await this.logNotification(notification)
  }

  async scheduleNotification(notification: ParkingNotification, delay: number): Promise<void> {
    setTimeout(() => {
      this.showNotification(notification)
    }, delay)
  }

  // Parking-specific notification helpers
  async notifySpotAvailable(spotId: string, spotName: string, distance: number): Promise<void> {
    await this.showNotification({
      id: `spot-available-${spotId}`,
      type: "spot_available",
      title: "🅿️ Parking Spot Available!",
      body: `${spotName} is now available (${Math.round(distance)}m away)`,
      tag: `spot-${spotId}`,
      requireInteraction: true,
      timestamp: Date.now(),
      data: {
        spotId,
        actionUrl: `/dashboard?spot=${spotId}`,
      },
      // actions property removed
    })
  }

  async notifyPriceDrop(spotId: string, spotName: string, oldPrice: number, newPrice: number): Promise<void> {
    const savings = oldPrice - newPrice
    await this.showNotification({
      id: `price-drop-${spotId}`,
      type: "price_drop",
      title: "💰 Price Drop Alert!",
      body: `${spotName} dropped to $${newPrice}/hr (save $${savings.toFixed(2)})`,
      tag: `price-${spotId}`,
      requireInteraction: true,
      timestamp: Date.now(),
      data: {
        spotId,
        oldPrice,
        newPrice,
        savings,
        actionUrl: `/dashboard?spot=${spotId}`,
      },
      // actions property removed
    })
  }

  async notifyTimeReminder(sessionId: string, minutesLeft: number): Promise<void> {
    await this.showNotification({
      id: `time-reminder-${sessionId}`,
      type: "time_reminder",
      title: "⏰ Parking Time Reminder",
      body: `${minutesLeft} minutes left in your parking session`,
      tag: `session-${sessionId}`,
      requireInteraction: true,
      timestamp: Date.now(),
      data: {
        sessionId,
        minutesLeft,
        actionUrl: `/dashboard?tab=history&session=${sessionId}`,
      },
      // actions property removed
    })
  }

  async notifySessionEnd(sessionId: string, totalCost: number): Promise<void> {
    await this.showNotification({
      id: `session-end-${sessionId}`,
      type: "session_end",
      title: "✅ Parking Session Complete",
      body: `Session ended. Total cost: $${totalCost.toFixed(2)}`,
      tag: `session-end-${sessionId}`,
      timestamp: Date.now(),
      data: {
        sessionId,
        totalCost,
        actionUrl: `/dashboard?tab=history&session=${sessionId}`,
      },
      // actions property removed
    })
  }

  async notifyPaymentDue(sessionId: string, amount: number): Promise<void> {
    await this.showNotification({
      id: `payment-due-${sessionId}`,
      type: "payment_due",
      title: "💳 Payment Required",
      body: `Payment of $${amount.toFixed(2)} is due for your parking session`,
      tag: `payment-${sessionId}`,
      requireInteraction: true,
      timestamp: Date.now(),
      data: {
        sessionId,
        amount,
        actionUrl: `/dashboard?tab=payment&session=${sessionId}`,
      },
      // actions property removed
    })
  }

  private async logNotification(notification: ParkingNotification): Promise<void> {
    this.checkInitialized()
    try {
      await this.supabase.from("notifications").insert({
        notification_type: notification.type,
        message: notification.body,
        title: notification.title,
        data: notification.data,
        user_id: null, // Add user_id if available
        created_at: new Date().toISOString(),
        read: false,
        sent_at: new Date().toISOString()
      })
    } catch (error) {
      console.error("Error logging notification:", error)
    }
  }

  // Background sync for notifications
  async syncPendingNotifications(): Promise<void> {
    this.checkInitialized()
    try {
      const { data: pendingNotifications } = await this.supabase
        .from("notification_queue")
        .select("*")
        .lte("scheduled_for", new Date().toISOString())
        .is("user_id", null) // Or use actual user_id

      for (const pending of pendingNotifications || []) {
        if (!pending.message) continue // Skip if no message

        const notification: ParkingNotification = {
          id: pending.id,
          type: pending.type as "spot_available" | "price_drop" | "time_reminder" | "session_end" | "payment_due",
          title: "Parking Angel", // Default title
          body: pending.message,
          tag: pending.id,
          timestamp: new Date(pending.created_at || Date.now()).getTime(),
          data: {},
          requireInteraction: true,
          silent: false
        }

        await this.showNotification(notification)

        // Mark as processed by deleting from queue
        await this.supabase
          .from("notification_queue")
          .delete()
          .eq("id", pending.id)
      }
    } catch (error) {
      console.error("Error syncing pending notifications:", error)
    }
  }
}

// Export singleton instance
export const pwaNotifications = PWANotificationService.getInstance()
