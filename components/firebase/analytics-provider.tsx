"use client"

import React from "react"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { initializeApp, getApps } from "firebase/app"
import { getAnalytics, type Analytics, logEvent } from "firebase/analytics"

import { useAuth } from "@/hooks/use-auth"
import { usePathname } from "next/navigation"
import { trackPageView, setUserAnalyticsProperties } from "@/lib/firebase-analytics"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

interface AnalyticsContextType {
  analytics: Analytics | null
  logEvent: (eventName: string, parameters?: any) => void
  isLoaded: boolean
}

const AnalyticsContext = React.createContext<AnalyticsContextType>({
  analytics: null,
  logEvent: () => {},
  isLoaded: false,
})

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const pathname = usePathname()

  useEffect(() => {
    let mounted = true

    const initializeAnalytics = async () => {
      try {
        // Check if we're in a browser environment
        if (typeof window === "undefined") {
          return
        }

        // Check if required config is available
        if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
          console.warn("Firebase Analytics: Missing required configuration")
          setIsLoaded(true)
          return
        }

        // Initialize Firebase app if not already initialized
        let app
        if (getApps().length === 0) {
          app = initializeApp(firebaseConfig)
        } else {
          app = getApps()[0]
        }

        // Initialize Analytics with error handling
        const analyticsInstance = getAnalytics(app)

        if (mounted) {
          setAnalytics(analyticsInstance)
          setIsLoaded(true)
          console.log("Firebase Analytics: Initialized successfully")
        }
      } catch (error) {
        console.warn("Firebase Analytics: Initialization failed:", error)
        if (mounted) {
          setError(error instanceof Error ? error.message : "Unknown error")
          setIsLoaded(true)
        }
      }
    }

    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(initializeAnalytics, 100)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    trackPageView(pathname)
  }, [pathname])

  useEffect(() => {
    if (user) {
      setUserAnalyticsProperties(user.id, {
        user_type: "authenticated",
        signup_method: user.app_metadata?.provider || "email",
        user_tier: "free", // You can update this based on subscription
      })
    }
  }, [user])

  const handleLogEvent = (eventName: string, parameters?: any) => {
    try {
      if (analytics && isLoaded && !error) {
        logEvent(analytics, eventName, parameters)
      } else {
        console.warn("Firebase Analytics: Not available for logging event:", eventName)
      }
    } catch (error) {
      console.warn("Firebase Analytics: Error logging event:", error)
    }
  }

  const contextValue: AnalyticsContextType = {
    analytics,
    logEvent: handleLogEvent,
    isLoaded,
  }

  return <AnalyticsContext.Provider value={contextValue}>{children}</AnalyticsContext.Provider>
}

export const useAnalytics = () => {
  const context = React.useContext(AnalyticsContext)
  if (!context) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider")
  }
  return context
}
