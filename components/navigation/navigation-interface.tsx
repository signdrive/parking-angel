"use client"

import { useState } from "react"
import { useNavigationStore } from "@/lib/navigation-store"
import { SimpleNavigationMap } from "./simple-navigation-map"
import { NavigationSettings } from "./navigation-settings"

export function NavigationInterface() {
  const { isNavigating, stopNavigation } = useNavigationStore()
  const [showSettings, setShowSettings] = useState(false)

  if (!isNavigating) {
    return null
  }

  if (showSettings) {
    return <NavigationSettings onBack={() => setShowSettings(false)} />
  }

  return <SimpleNavigationMap onExit={stopNavigation} />
}
