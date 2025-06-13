"use client"

import React from "react"
import type { ReactNode } from "react"
import { useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { usePathname } from "next/navigation"

interface AnalyticsContextType {
  analytics: null
  logEvent: (eventName: string, parameters?: any) => void
  isLoaded: boolean
}

const AnalyticsContext = React.createContext<AnalyticsContextType>({
  analytics: null,
  logEvent: () => {},
  isLoaded: true,
})

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const pathname = usePathname()

  useEffect(() => {
    // No-op for page view
  }, [pathname])

  useEffect(() => {
    // No-op for user analytics
  }, [user])

  const handleLogEvent = (eventName: string, parameters?: any) => {
    // No-op
  }

  const contextValue: AnalyticsContextType = {
    analytics: null,
    logEvent: handleLogEvent,
    isLoaded: true,
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
