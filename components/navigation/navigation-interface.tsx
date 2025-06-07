"use client"

import { useState } from "react"
import { ProfessionalGPSInterface } from "./professional-gps-interface"
import { Button } from "@/components/ui/button"
import { Navigation } from "lucide-react"

export function NavigationInterface() {
  const [isNavigating, setIsNavigating] = useState(false)

  if (isNavigating) {
    return <ProfessionalGPSInterface onExit={() => setIsNavigating(false)} />
  }

  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Navigation className="w-16 h-16 mx-auto mb-4 text-blue-600" />
        <h2 className="text-2xl font-bold mb-2">AutoNav Pro</h2>
        <p className="text-gray-600 mb-6">Professional GPS Navigation System</p>
        <Button onClick={() => setIsNavigating(true)} className="bg-blue-600 hover:bg-blue-700">
          Start Navigation
        </Button>
      </div>
    </div>
  )
}
