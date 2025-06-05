import { analytics } from "./firebase"
import { logEvent, setUserProperties, setUserId } from "firebase/analytics"

// Custom analytics events for Parking Angel
export const trackParkingSpotSearch = (location: { lat: number; lng: number }) => {
  if (analytics) {
    logEvent(analytics, "parking_spot_search", {
      latitude: location.lat,
      longitude: location.lng,
      timestamp: new Date().toISOString(),
    })
  }
}

export const trackParkingSpotReport = (spotType: string, location: { lat: number; lng: number }) => {
  if (analytics) {
    logEvent(analytics, "parking_spot_report", {
      spot_type: spotType,
      latitude: location.lat,
      longitude: location.lng,
      timestamp: new Date().toISOString(),
    })
  }
}

export const trackAIAssistantQuery = (query: string, responseTime: number) => {
  if (analytics) {
    logEvent(analytics, "ai_assistant_query", {
      query_length: query.length,
      response_time_ms: responseTime,
      timestamp: new Date().toISOString(),
    })
  }
}

export const trackUserUpgrade = (plan: string) => {
  if (analytics) {
    logEvent(analytics, "user_upgrade", {
      plan_type: plan,
      timestamp: new Date().toISOString(),
    })
  }
}

export const trackMapInteraction = (action: string, location?: { lat: number; lng: number }) => {
  if (analytics) {
    logEvent(analytics, "map_interaction", {
      action,
      latitude: location?.lat,
      longitude: location?.lng,
      timestamp: new Date().toISOString(),
    })
  }
}

export const setUserAnalyticsProperties = (userId: string, properties: Record<string, any>) => {
  if (analytics) {
    setUserId(analytics, userId)
    setUserProperties(analytics, properties)
  }
}

export const trackPageView = (pageName: string) => {
  if (analytics) {
    logEvent(analytics, "page_view", {
      page_title: pageName,
      timestamp: new Date().toISOString(),
    })
  }
}

export const trackFeatureUsage = (feature: string, details?: Record<string, any>) => {
  if (analytics) {
    logEvent(analytics, "feature_usage", {
      feature_name: feature,
      ...details,
      timestamp: new Date().toISOString(),
    })
  }
}
