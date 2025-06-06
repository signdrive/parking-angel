import { supabase } from "./supabase"

export interface ParkingNotification {
  id: string
  type: "spot_available" | "price_drop" | "time_reminder" | "session_end" | "payment_due"
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
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
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
}

export class PWANotificationService {
  private static instance: PWANotificationService

  static getInstance(): PWANotificationService {
    if (!PWANotificationService.instance) {
      PWANotificationService.instance = new PWANotificationService()
    }
    return PWANotificationService.instance
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
          image: notification.image,
          tag: notification.tag,
          requireInteraction: notification.requireInteraction || false,
          silent: notification.silent || false,
          timestamp: notification.timestamp,
          data: notification.data,
          actions: notification.actions || [],
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
      actions: [
        { action: "navigate", title: "Navigate", icon: "/icon-72x72.png" },
        { action: "dismiss", title: "Dismiss" },
      ],
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
      actions: [
        { action: "book", title: "Book Now", icon: "/icon-72x72.png" },
        { action: "dismiss", title: "Later" },
      ],
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
      actions: [
        { action: "extend", title: "Extend Time", icon: "/icon-72x72.png" },
        { action: "end", title: "End Session" },
      ],
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
      actions: [
        { action: "receipt", title: "View Receipt", icon: "/icon-72x72.png" },
        { action: "rate", title: "Rate Spot" },
      ],
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
      actions: [
        { action: "pay", title: "Pay Now", icon: "/icon-72x72.png" },
        { action: "remind", title: "Remind Later" },
      ],
    })
  }

  private async logNotification(notification: ParkingNotification): Promise<void> {
    try {
      await supabase.from("notification_log").insert({
        notification_id: notification.id,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        sent_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error logging notification:", error)
    }
  }

  // Background sync for notifications
  async syncPendingNotifications(): Promise<void> {
    try {
      const { data: pendingNotifications } = await supabase
        .from("pending_notifications")
        .select("*")
        .lte("scheduled_for", new Date().toISOString())
        .eq("sent", false)

      for (const pending of pendingNotifications || []) {
        await this.showNotification(pending.notification_data)

        // Mark as sent
        await supabase
          .from("pending_notifications")
          .update({ sent: true, sent_at: new Date().toISOString() })
          .eq("id", pending.id)
      }
    } catch (error) {
      console.error("Error syncing pending notifications:", error)
    }
  }
}

// Export singleton instance
export const pwaNotifications = PWANotificationService.getInstance()
