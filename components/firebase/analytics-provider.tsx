"use client"

import type React from "react"

import { useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { usePathname } from "next/navigation"
import { trackPageView, setUserAnalyticsProperties } from "@/lib/firebase-analytics"

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const pathname = usePathname()

  // Track page views
  useEffect(() => {
    trackPageView(pathname)
  }, [pathname])

  // Set user properties when user logs in
  useEffect(() => {
    if (user) {
      setUserAnalyticsProperties(user.id, {
        user_type: "authenticated",
        signup_method: user.app_metadata?.provider || "email",
        user_tier: "free", // You can update this based on subscription
      })
    }
  }, [user])

  return <>{children}</>
}
