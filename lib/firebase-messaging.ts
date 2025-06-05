import { messaging } from "./firebase"
import { getToken, onMessage, type MessagePayload } from "firebase/messaging"

// Your VAPID key
const VAPID_KEY = "BNNcuh4IRRZmi4_EadAD7MZss5t24e809M-_5y8AhUDCloyYeIxPCz0v_-ettL01xhtetgMZaamSxnS5ukfegUw"

// Request permission and get FCM token
export const requestNotificationPermission = async (): Promise<string | null> => {
  if (!messaging) {
    console.log("Firebase messaging not available")
    return null
  }

  try {
    const permission = await Notification.requestPermission()
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
      })
      console.log("FCM Token:", token)
      return token
    } else {
      console.log("Notification permission denied")
      return null
    }
  } catch (error) {
    console.error("Error getting notification permission:", error)
    return null
  }
}

// Listen for foreground messages
export const onMessageListener = (callback: (payload: MessagePayload) => void) => {
  if (!messaging) return

  return onMessage(messaging, (payload) => {
    console.log("Message received in foreground:", payload)
    callback(payload)
  })
}

// Send notification data to server for processing
export const subscribeToNotifications = async (userId: string, token: string) => {
  try {
    const response = await fetch("/api/notifications/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        fcmToken: token,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to subscribe to notifications")
    }

    return await response.json()
  } catch (error) {
    console.error("Error subscribing to notifications:", error)
    throw error
  }
}

// Send test notification
export const sendTestNotification = async (userId: string) => {
  try {
    const response = await fetch("/api/notifications/send-test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    })

    if (!response.ok) {
      throw new Error("Failed to send test notification")
    }

    return await response.json()
  } catch (error) {
    console.error("Error sending test notification:", error)
    throw error
  }
}
