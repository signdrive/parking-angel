"use client"

import { useState } from "react"
import { BulletproofNavigation } from "./bulletproof-navigation"
import { Button } from "@/components/ui/button"
import { Navigation } from "lucide-react"

export function NavigationInterface() {
  const [isNavigating, setIsNavigating] = useState(false)

  if (isNavigating) {
    return <BulletproofNavigation onExit={() => setIsNavigating(false)} />
  }

  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Navigation className="w-16 h-16 mx-auto mb-4 text-blue-600" />
        <h2 className="text-2xl font-bold mb-2">Professional Navigation</h2>
        <p className="text-gray-600 mb-6">Experience bulletproof navigation with advanced fallback</p>
        <Button onClick={() => setIsNavigating(true)} className="bg-blue-600 hover:bg-blue-700">
          Start Navigation
        </Button>
      </div>
    </div>
  )
}
